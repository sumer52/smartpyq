"""Paper service for managing academic papers and documents.

Handles paper CRUD operations, search functionality, file uploads,
version management, and access control.
"""

import os
import hashlib
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, or_

from app.core.config import settings
from app.core.exceptions import (
    NotFoundError,
    ValidationError,
    PermissionError,
    ConflictError
)
from app.models.paper import Paper, PaperStatus, ExamType, PaperVersion
from app.models.user import User, UserRole
from app.models.audit_log import AuditAction, AuditSeverity
from app.repositories.paper_repository import PaperRepository
from app.repositories.audit_log_repository import AuditLogRepository
from app.schemas.paper import (
    PaperCreateRequest,
    PaperUpdateRequest,
    PaperResponse,
    PaperSearchRequest,
    PaperSearchResponse,
    PaperVersionResponse
)
from app.utils.storage import StorageService
from app.utils.cache import CacheService
from app.utils.pdf import PDFProcessor
from app.workers.tasks import process_paper_upload


class PaperService:
    """Service for paper management operations."""
    
    def __init__(
        self,
        db: AsyncSession,
        storage_service: Optional[StorageService] = None,
        cache_service: Optional[CacheService] = None,
        pdf_processor: Optional[PDFProcessor] = None
    ):
        self.db = db
        self.paper_repo = PaperRepository(db)
        self.audit_repo = AuditLogRepository(db)
        self.storage_service = storage_service
        self.cache_service = cache_service
        self.pdf_processor = pdf_processor
    
    async def create_paper(
        self,
        paper_data: PaperCreateRequest,
        uploader: User,
        ip_address: Optional[str] = None
    ) -> PaperResponse:
        """Create a new paper.
        
        Args:
            paper_data: Paper creation data
            uploader: User creating the paper
            ip_address: Client IP address
            
        Returns:
            Created paper response
            
        Raises:
            ValidationError: If paper data is invalid
            PermissionError: If user lacks permission
        """
        # Check if user can create papers in this tenant
        if uploader.tenant_id != paper_data.tenant_id:
            if uploader.role not in [UserRole.ADMIN, UserRole.TENANT_ADMIN]:
                raise PermissionError("Cannot create papers for other tenants")
        
        # Validate tags
        if paper_data.tags and len(paper_data.tags) > 20:
            raise ValidationError("Maximum 20 tags allowed")
        
        # Create paper
        paper_dict = paper_data.dict(exclude={'tenant_id'})
        paper_dict.update({
            'tenant_id': paper_data.tenant_id or uploader.tenant_id,
            'uploader_id': uploader.id,
            'status': PaperStatus.PENDING,
            'created_at': datetime.utcnow()
        })
        
        paper = await self.paper_repo.create(**paper_dict)
        
        # Log audit event
        await self._log_audit(
            AuditAction.PAPER_CREATE,
            actor_id=uploader.id,
            target_type="paper",
            target_id=paper.id,
            tenant_id=paper.tenant_id,
            details=f"Paper created: {paper.title}",
            ip_address=ip_address
        )
        
        return PaperResponse.from_orm(paper)
    
    async def get_paper(
        self,
        paper_id: int,
        user: Optional[User] = None,
        include_content: bool = False
    ) -> PaperResponse:
        """Get paper by ID.
        
        Args:
            paper_id: Paper ID
            user: Requesting user
            include_content: Whether to include file content
            
        Returns:
            Paper response
            
        Raises:
            NotFoundError: If paper not found
            PermissionError: If user lacks access
        """
        paper = await self.paper_repo.get_by_id(paper_id)
        if not paper:
            raise NotFoundError("Paper not found")
        
        # Check access permissions
        if not await self._check_paper_access(paper, user):
            raise PermissionError("Access denied")
        
        # Get from cache if available
        cache_key = f"paper:{paper_id}:content:{include_content}"
        if self.cache_service and not include_content:
            cached_paper = await self.cache_service.get(cache_key)
            if cached_paper:
                return PaperResponse.parse_obj(cached_paper)
        
        paper_response = PaperResponse.from_orm(paper)
        
        # Cache the response
        if self.cache_service and not include_content:
            await self.cache_service.set(
                cache_key,
                paper_response.dict(),
                expire=3600  # 1 hour
            )
        
        return paper_response
    
    async def search_papers(
        self,
        search_request: PaperSearchRequest,
        user: Optional[User] = None
    ) -> PaperSearchResponse:
        """Search papers with filters.
        
        Args:
            search_request: Search parameters
            user: Requesting user
            
        Returns:
            Search results
        """
        # Build search filters
        filters = {}
        
        # Tenant filter
        if user and user.role not in [UserRole.ADMIN]:
            filters['tenant_id'] = user.tenant_id
        elif search_request.tenant_id:
            filters['tenant_id'] = search_request.tenant_id
        
        # Status filter (non-admins can only see approved papers)
        if user and user.role not in [UserRole.ADMIN, UserRole.TENANT_ADMIN]:
            filters['status'] = PaperStatus.APPROVED
        elif search_request.status:
            filters['status'] = search_request.status
        
        # Other filters
        if search_request.subject:
            filters['subject'] = search_request.subject
        if search_request.university:
            filters['university'] = search_request.university
        if search_request.stream:
            filters['stream'] = search_request.stream
        if search_request.year:
            filters['year'] = search_request.year
        if search_request.semester_year:
            filters['semester_year'] = search_request.semester_year
        if search_request.exam_type:
            filters['exam_type'] = search_request.exam_type
        
        # Check cache for common searches
        cache_key = None
        if self.cache_service and not search_request.query:
            cache_key = f"search:{hash(str(sorted(filters.items())))}:{search_request.page}:{search_request.limit}"
            cached_result = await self.cache_service.get(cache_key)
            if cached_result:
                return PaperSearchResponse.parse_obj(cached_result)
        
        # Perform search
        if search_request.query:
            # Full-text search
            papers, total = await self.paper_repo.search_papers(
                query=search_request.query,
                filters=filters,
                page=search_request.page,
                limit=search_request.limit,
                sort_by=search_request.sort_by,
                sort_order=search_request.sort_order
            )
        else:
            # Filter-based search
            papers, total = await self.paper_repo.get_papers_with_filters(
                filters=filters,
                page=search_request.page,
                limit=search_request.limit,
                sort_by=search_request.sort_by,
                sort_order=search_request.sort_order
            )
        
        # Convert to response objects
        paper_responses = [PaperResponse.from_orm(paper) for paper in papers]
        
        result = PaperSearchResponse(
            papers=paper_responses,
            total=total,
            page=search_request.page,
            limit=search_request.limit,
            total_pages=(total + search_request.limit - 1) // search_request.limit
        )
        
        # Cache the result
        if self.cache_service and cache_key:
            await self.cache_service.set(
                cache_key,
                result.dict(),
                expire=1800  # 30 minutes
            )
        
        return result
    
    async def upload_paper(
        self,
        file_data: bytes,
        filename: str,
        paper_data: PaperCreateRequest,
        uploader: User,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """Upload paper file and create paper record.
        
        Args:
            file_data: File content
            filename: Original filename
            paper_data: Paper metadata
            uploader: User uploading the file
            ip_address: Client IP address
            
        Returns:
            Upload result with paper info
            
        Raises:
            ValidationError: If file is invalid
            PermissionError: If user lacks permission
        """
        # Validate file
        if not filename.lower().endswith('.pdf'):
            raise ValidationError("Only PDF files are allowed")
        
        if len(file_data) > settings.MAX_FILE_SIZE:
            raise ValidationError(f"File size exceeds {settings.MAX_FILE_SIZE} bytes")
        
        # Validate PDF content
        if self.pdf_processor:
            if not await self.pdf_processor.validate_pdf(file_data):
                raise ValidationError("Invalid PDF file")
        
        # Generate file hash
        file_hash = hashlib.sha256(file_data).hexdigest()
        
        # Check for duplicate files
        existing_version = await self.paper_repo.get_version_by_checksum(file_hash)
        if existing_version:
            raise ConflictError("File already exists in the system")
        
        # Create paper record first
        paper = await self.create_paper(paper_data, uploader, ip_address)
        
        # Generate storage key
        file_extension = Path(filename).suffix
        storage_key = f"papers/{paper.id}/{file_hash}{file_extension}"
        
        try:
            # Upload to storage (staging area)
            staging_key = f"staging/{storage_key}"
            if self.storage_service:
                await self.storage_service.upload_file(
                    staging_key,
                    file_data,
                    content_type="application/pdf"
                )
            
            # Create paper version record
            version_data = {
                'paper_id': paper.id,
                's3_key': staging_key,
                'checksum': file_hash,
                'file_size': len(file_data),
                'original_filename': filename,
                'created_at': datetime.utcnow()
            }
            
            version = await self.paper_repo.create_version(**version_data)
            
            # Queue background processing
            if hasattr(process_paper_upload, 'delay'):
                process_paper_upload.delay(
                    paper_id=paper.id,
                    version_id=version.id,
                    staging_key=staging_key,
                    storage_key=storage_key
                )
            
            # Log audit event
            await self._log_audit(
                AuditAction.PAPER_UPLOAD,
                actor_id=uploader.id,
                target_type="paper",
                target_id=paper.id,
                tenant_id=paper.tenant_id,
                details=f"Paper uploaded: {filename} ({len(file_data)} bytes)",
                ip_address=ip_address,
                metadata={
                    'filename': filename,
                    'file_size': len(file_data),
                    'checksum': file_hash
                }
            )
            
            return {
                'paper_id': paper.id,
                'version_id': version.id,
                'status': 'uploaded',
                'message': 'File uploaded successfully and queued for processing',
                'processing': True
            }
            
        except Exception as e:
            # Clean up paper record if upload fails
            await self.paper_repo.delete(paper.id)
            raise ValidationError(f"Upload failed: {str(e)}")
    
    async def approve_paper(
        self,
        paper_id: int,
        approver: User,
        ip_address: Optional[str] = None
    ) -> PaperResponse:
        """Approve a paper.
        
        Args:
            paper_id: Paper ID
            approver: User approving the paper
            ip_address: Client IP address
            
        Returns:
            Updated paper response
            
        Raises:
            NotFoundError: If paper not found
            PermissionError: If user lacks permission
            ValidationError: If paper cannot be approved
        """
        paper = await self.paper_repo.get_by_id(paper_id)
        if not paper:
            raise NotFoundError("Paper not found")
        
        # Check permissions
        if not await self._check_paper_moderation_access(paper, approver):
            raise PermissionError("Access denied")
        
        if paper.status != PaperStatus.PENDING:
            raise ValidationError("Only pending papers can be approved")
        
        # Update paper status
        updated_paper = await self.paper_repo.update(
            paper_id,
            status=PaperStatus.APPROVED,
            approved_by=approver.id,
            approved_at=datetime.utcnow()
        )
        
        # Clear cache
        if self.cache_service:
            await self._clear_paper_cache(paper_id)
        
        # Log audit event
        await self._log_audit(
            AuditAction.PAPER_APPROVE,
            actor_id=approver.id,
            target_type="paper",
            target_id=paper_id,
            tenant_id=paper.tenant_id,
            details=f"Paper approved: {paper.title}",
            ip_address=ip_address
        )
        
        return PaperResponse.from_orm(updated_paper)
    
    async def reject_paper(
        self,
        paper_id: int,
        reason: str,
        rejector: User,
        ip_address: Optional[str] = None
    ) -> PaperResponse:
        """Reject a paper.
        
        Args:
            paper_id: Paper ID
            reason: Rejection reason
            rejector: User rejecting the paper
            ip_address: Client IP address
            
        Returns:
            Updated paper response
            
        Raises:
            NotFoundError: If paper not found
            PermissionError: If user lacks permission
            ValidationError: If paper cannot be rejected
        """
        paper = await self.paper_repo.get_by_id(paper_id)
        if not paper:
            raise NotFoundError("Paper not found")
        
        # Check permissions
        if not await self._check_paper_moderation_access(paper, rejector):
            raise PermissionError("Access denied")
        
        if paper.status not in [PaperStatus.PENDING, PaperStatus.APPROVED]:
            raise ValidationError("Paper cannot be rejected")
        
        # Update paper status
        updated_paper = await self.paper_repo.update(
            paper_id,
            status=PaperStatus.REJECTED,
            rejection_reason=reason,
            rejected_by=rejector.id,
            rejected_at=datetime.utcnow()
        )
        
        # Clear cache
        if self.cache_service:
            await self._clear_paper_cache(paper_id)
        
        # Log audit event
        await self._log_audit(
            AuditAction.PAPER_REJECT,
            actor_id=rejector.id,
            target_type="paper",
            target_id=paper_id,
            tenant_id=paper.tenant_id,
            details=f"Paper rejected: {paper.title} - {reason}",
            ip_address=ip_address,
            metadata={'rejection_reason': reason}
        )
        
        return PaperResponse.from_orm(updated_paper)
    
    async def get_paper_download_url(
        self,
        paper_id: int,
        user: User,
        ip_address: Optional[str] = None
    ) -> str:
        """Get signed URL for paper download.
        
        Args:
            paper_id: Paper ID
            user: Requesting user
            ip_address: Client IP address
            
        Returns:
            Signed download URL
            
        Raises:
            NotFoundError: If paper not found
            PermissionError: If user lacks access
        """
        paper = await self.paper_repo.get_by_id(paper_id)
        if not paper:
            raise NotFoundError("Paper not found")
        
        # Check access permissions
        if not await self._check_paper_access(paper, user):
            raise PermissionError("Access denied")
        
        if paper.status != PaperStatus.APPROVED:
            if user.role not in [UserRole.ADMIN, UserRole.TENANT_ADMIN]:
                raise PermissionError("Paper not available for download")
        
        # Get latest version
        latest_version = await self.paper_repo.get_latest_version(paper_id)
        if not latest_version or not latest_version.s3_key:
            raise NotFoundError("Paper file not found")
        
        # Generate signed URL
        if self.storage_service:
            signed_url = await self.storage_service.generate_signed_url(
                latest_version.s3_key,
                expires_in=settings.SIGNED_URL_TTL_SECONDS
            )
        else:
            # Fallback to direct file serving
            signed_url = f"/api/v1/papers/{paper_id}/file"
        
        # Log download access
        await self._log_audit(
            AuditAction.PAPER_DOWNLOAD,
            actor_id=user.id,
            target_type="paper",
            target_id=paper_id,
            tenant_id=paper.tenant_id,
            details=f"Paper download accessed: {paper.title}",
            ip_address=ip_address
        )
        
        # Update download count
        await self.paper_repo.increment_download_count(paper_id)
        
        return signed_url
    
    async def get_paper_versions(
        self,
        paper_id: int,
        user: User
    ) -> List[PaperVersionResponse]:
        """Get all versions of a paper.
        
        Args:
            paper_id: Paper ID
            user: Requesting user
            
        Returns:
            List of paper versions
            
        Raises:
            NotFoundError: If paper not found
            PermissionError: If user lacks access
        """
        paper = await self.paper_repo.get_by_id(paper_id)
        if not paper:
            raise NotFoundError("Paper not found")
        
        # Check access permissions
        if not await self._check_paper_access(paper, user):
            raise PermissionError("Access denied")
        
        versions = await self.paper_repo.get_paper_versions(paper_id)
        return [PaperVersionResponse.from_orm(version) for version in versions]
    
    async def delete_paper(
        self,
        paper_id: int,
        user: User,
        ip_address: Optional[str] = None
    ) -> bool:
        """Delete a paper.
        
        Args:
            paper_id: Paper ID
            user: User deleting the paper
            ip_address: Client IP address
            
        Returns:
            True if deleted successfully
            
        Raises:
            NotFoundError: If paper not found
            PermissionError: If user lacks permission
        """
        paper = await self.paper_repo.get_by_id(paper_id)
        if not paper:
            raise NotFoundError("Paper not found")
        
        # Check permissions (only admin, tenant admin, or uploader can delete)
        can_delete = (
            user.role in [UserRole.ADMIN, UserRole.TENANT_ADMIN] or
            (paper.uploader_id == user.id and paper.status == PaperStatus.PENDING)
        )
        
        if not can_delete:
            raise PermissionError("Access denied")
        
        # Delete associated files from storage
        versions = await self.paper_repo.get_paper_versions(paper_id)
        if self.storage_service:
            for version in versions:
                if version.s3_key:
                    try:
                        await self.storage_service.delete_file(version.s3_key)
                    except Exception:
                        # Log but don't fail the deletion
                        pass
        
        # Delete from database
        await self.paper_repo.delete(paper_id)
        
        # Clear cache
        if self.cache_service:
            await self._clear_paper_cache(paper_id)
        
        # Log audit event
        await self._log_audit(
            AuditAction.PAPER_DELETE,
            actor_id=user.id,
            target_type="paper",
            target_id=paper_id,
            tenant_id=paper.tenant_id,
            details=f"Paper deleted: {paper.title}",
            ip_address=ip_address
        )
        
        return True
    
    async def get_paper_stats(
        self,
        user: Optional[User] = None,
        tenant_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Get paper statistics.
        
        Args:
            user: Requesting user
            tenant_id: Tenant ID filter
            
        Returns:
            Statistics dictionary
        """
        # Apply tenant filter based on user permissions
        if user and user.role not in [UserRole.ADMIN]:
            tenant_id = user.tenant_id
        
        stats = await self.paper_repo.get_paper_stats(tenant_id=tenant_id)
        
        return {
            'total_papers': stats.get('total', 0),
            'approved_papers': stats.get('approved', 0),
            'pending_papers': stats.get('pending', 0),
            'rejected_papers': stats.get('rejected', 0),
            'total_downloads': stats.get('total_downloads', 0),
            'papers_by_exam_type': stats.get('by_exam_type', {}),
            'papers_by_subject': stats.get('by_subject', {}),
            'recent_uploads': stats.get('recent_uploads', 0)
        }
    
    async def _check_paper_access(
        self,
        paper: Paper,
        user: Optional[User]
    ) -> bool:
        """Check if user can access paper.
        
        Args:
            paper: Paper to check
            user: User requesting access
            
        Returns:
            True if access allowed
        """
        if not user:
            return paper.status == PaperStatus.APPROVED
        
        # Admins can access all papers
        if user.role == UserRole.ADMIN:
            return True
        
        # Tenant admins can access papers in their tenant
        if user.role == UserRole.TENANT_ADMIN and user.tenant_id == paper.tenant_id:
            return True
        
        # Users can access approved papers in their tenant
        if user.tenant_id == paper.tenant_id:
            return paper.status == PaperStatus.APPROVED or paper.uploader_id == user.id
        
        return False
    
    async def _check_paper_moderation_access(
        self,
        paper: Paper,
        user: User
    ) -> bool:
        """Check if user can moderate paper.
        
        Args:
            paper: Paper to check
            user: User requesting moderation access
            
        Returns:
            True if moderation access allowed
        """
        # Admins can moderate all papers
        if user.role == UserRole.ADMIN:
            return True
        
        # Tenant admins can moderate papers in their tenant
        if user.role == UserRole.TENANT_ADMIN and user.tenant_id == paper.tenant_id:
            return True
        
        return False
    
    async def _clear_paper_cache(self, paper_id: int) -> None:
        """Clear paper-related cache entries.
        
        Args:
            paper_id: Paper ID
        """
        if self.cache_service:
            # Clear specific paper cache
            cache_keys = [
                f"paper:{paper_id}:content:True",
                f"paper:{paper_id}:content:False"
            ]
            
            for key in cache_keys:
                await self.cache_service.delete(key)
            
            # Clear search cache (simplified - in production, use cache tags)
            await self.cache_service.delete_pattern("search:*")
    
    async def _log_audit(
        self,
        action: AuditAction,
        actor_id: Optional[int] = None,
        target_type: Optional[str] = None,
        target_id: Optional[int] = None,
        tenant_id: Optional[int] = None,
        details: Optional[str] = None,
        ip_address: Optional[str] = None,
        severity: AuditSeverity = AuditSeverity.INFO,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """Log audit event.
        
        Args:
            action: Audit action
            actor_id: Actor user ID
            target_type: Target entity type
            target_id: Target entity ID
            tenant_id: Tenant ID
            details: Event details
            ip_address: Client IP address
            severity: Event severity
            metadata: Additional metadata
        """
        try:
            await self.audit_repo.create_log(
                action=action,
                actor_id=actor_id,
                target_type=target_type,
                target_id=target_id,
                tenant_id=tenant_id,
                details=details,
                ip_address=ip_address,
                severity=severity,
                metadata=metadata
            )
        except Exception:
            # Don't let audit logging failures break the main flow
            pass