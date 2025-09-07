"""Papers API Routes

Handles paper management, upload, search, and download operations.
"""

from datetime import datetime
from typing import List, Optional

from fastapi import (
    APIRouter, 
    Depends, 
    HTTPException, 
    status, 
    UploadFile, 
    File, 
    Form,
    Query
)
from pydantic import BaseModel, Field

from ..core.dependencies import (
    get_current_active_user,
    get_current_tenant,
    require_roles,
    get_client_ip
)
from ..core.exceptions import (
    ValidationError,
    PermissionError,
    NotFoundError
)
from ..models.user import User
from ..models.tenant import Tenant
from ..models.paper import PaperStatus, ExamType
from ..services.paper_service import PaperService

router = APIRouter(prefix="/papers", tags=["papers"])

# Request/Response Models
class PaperResponse(BaseModel):
    """Paper response model"""
    id: int
    title: str
    subject: str
    university: str
    stream: str
    year: int
    semester_year: str
    exam_type: str
    tags: List[str]
    status: str
    uploader_name: str
    created_at: datetime
    download_count: int = 0
    file_size: Optional[int] = None
    
class PaperListResponse(BaseModel):
    """Paginated paper list response"""
    papers: List[PaperResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

class PaperUploadResponse(BaseModel):
    """Paper upload response"""
    id: int
    title: str
    status: str
    message: str
    processing_job_id: Optional[str] = None

class PaperSearchResponse(BaseModel):
    """Paper search response"""
    papers: List[PaperResponse]
    total: int
    query: str
    filters: dict
    took_ms: int

class DownloadUrlResponse(BaseModel):
    """Download URL response"""
    download_url: str
    expires_at: datetime
    file_name: str
    file_size: int

class PaperStatsResponse(BaseModel):
    """Paper statistics response"""
    total_papers: int
    approved_papers: int
    pending_papers: int
    rejected_papers: int
    total_downloads: int
    popular_subjects: List[dict]
    recent_uploads: int

# Initialize service
paper_service = PaperService()

@router.get("/", response_model=PaperListResponse)
async def get_papers(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    subject: Optional[str] = Query(None, description="Filter by subject"),
    university: Optional[str] = Query(None, description="Filter by university"),
    stream: Optional[str] = Query(None, description="Filter by stream"),
    year: Optional[int] = Query(None, ge=2000, le=2030, description="Filter by year"),
    exam_type: Optional[ExamType] = Query(None, description="Filter by exam type"),
    status: Optional[PaperStatus] = Query(PaperStatus.APPROVED, description="Filter by status"),
    sort_by: str = Query("created_at", regex="^(created_at|title|year|download_count)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    current_user: User = Depends(get_current_active_user),
    current_tenant: Tenant = Depends(get_current_tenant)
):
    """Get paginated list of papers
    
    Supports filtering by subject, university, stream, year, exam type, and status.
    Results are paginated and sorted by specified criteria.
    """
    try:
        filters = {
            "subject": subject,
            "university": university,
            "stream": stream,
            "year": year,
            "exam_type": exam_type,
            "status": status
        }
        
        # Remove None values
        filters = {k: v for k, v in filters.items() if v is not None}
        
        result = await paper_service.get_papers(
            tenant_id=current_tenant.id,
            filters=filters,
            page=page,
            per_page=per_page,
            sort_by=sort_by,
            sort_order=sort_order,
            user_id=current_user.id
        )
        
        return PaperListResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve papers"
        )

@router.get("/search", response_model=PaperSearchResponse)
async def search_papers(
    q: str = Query(..., min_length=2, description="Search query"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    subject: Optional[str] = Query(None),
    university: Optional[str] = Query(None),
    year: Optional[int] = Query(None, ge=2000, le=2030),
    current_user: User = Depends(get_current_active_user),
    current_tenant: Tenant = Depends(get_current_tenant)
):
    """Full-text search papers
    
    Searches paper titles, subjects, and content using PostgreSQL full-text search.
    Supports additional filtering by subject, university, and year.
    """
    try:
        filters = {
            "subject": subject,
            "university": university,
            "year": year
        }
        
        # Remove None values
        filters = {k: v for k, v in filters.items() if v is not None}
        
        result = await paper_service.search_papers(
            query=q,
            tenant_id=current_tenant.id,
            filters=filters,
            page=page,
            per_page=per_page,
            user_id=current_user.id
        )
        
        return PaperSearchResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Search failed"
        )

@router.get("/{paper_id}", response_model=PaperResponse)
async def get_paper(
    paper_id: int,
    current_user: User = Depends(get_current_active_user),
    current_tenant: Tenant = Depends(get_current_tenant)
):
    """Get paper by ID
    
    Returns detailed paper information if user has access.
    """
    try:
        paper = await paper_service.get_paper(
            paper_id=paper_id,
            tenant_id=current_tenant.id,
            user_id=current_user.id
        )
        
        if not paper:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Paper not found"
            )
            
        return PaperResponse(**paper)
        
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paper not found"
        )
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve paper"
        )

@router.post("/upload", response_model=PaperUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_paper(
    file: UploadFile = File(..., description="PDF file to upload"),
    title: str = Form(..., min_length=3, max_length=200),
    subject: str = Form(..., min_length=2, max_length=100),
    university: str = Form(..., min_length=2, max_length=100),
    stream: str = Form(..., min_length=2, max_length=100),
    year: int = Form(..., ge=2000, le=2030),
    semester_year: str = Form(..., min_length=1, max_length=50),
    exam_type: ExamType = Form(...),
    tags: str = Form("", description="Comma-separated tags"),
    current_user: User = Depends(get_current_active_user),
    current_tenant: Tenant = Depends(get_current_tenant),
    client_ip: str = Depends(get_client_ip)
):
    """Upload a new paper
    
    Accepts PDF files and metadata. File is validated and processed asynchronously.
    Returns paper ID and processing status.
    """
    try:
        # Validate file type
        if not file.content_type == "application/pdf":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are allowed"
            )
            
        # Parse tags
        tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()] if tags else []
        
        result = await paper_service.upload_paper(
            file=file,
            title=title,
            subject=subject,
            university=university,
            stream=stream,
            year=year,
            semester_year=semester_year,
            exam_type=exam_type,
            tags=tag_list,
            uploader_id=current_user.id,
            tenant_id=current_tenant.id,
            client_ip=client_ip
        )
        
        return PaperUploadResponse(**result)
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Upload failed. Please try again."
        )

@router.get("/{paper_id}/download", response_model=DownloadUrlResponse)
async def get_download_url(
    paper_id: int,
    current_user: User = Depends(get_current_active_user),
    current_tenant: Tenant = Depends(get_current_tenant),
    client_ip: str = Depends(get_client_ip)
):
    """Get signed download URL for paper
    
    Returns time-limited signed URL for secure file access.
    Logs download activity for analytics.
    """
    try:
        result = await paper_service.get_download_url(
            paper_id=paper_id,
            user_id=current_user.id,
            tenant_id=current_tenant.id,
            client_ip=client_ip
        )
        
        return DownloadUrlResponse(**result)
        
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paper not found"
        )
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate download URL"
        )

@router.post("/{paper_id}/stamp", response_model=DownloadUrlResponse)
async def stamp_paper(
    paper_id: int,
    current_user: User = Depends(get_current_active_user),
    current_tenant: Tenant = Depends(get_current_tenant),
    client_ip: str = Depends(get_client_ip)
):
    """Generate watermarked version of paper
    
    Creates a watermarked copy with user information and returns download URL.
    Used for tracking and preventing unauthorized distribution.
    """
    try:
        result = await paper_service.stamp_paper(
            paper_id=paper_id,
            user_id=current_user.id,
            tenant_id=current_tenant.id,
            client_ip=client_ip
        )
        
        return DownloadUrlResponse(**result)
        
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paper not found"
        )
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate stamped paper"
        )

# Admin endpoints
@router.post("/{paper_id}/approve")
async def approve_paper(
    paper_id: int,
    current_user: User = Depends(require_roles(["admin", "tenant_admin"])),
    current_tenant: Tenant = Depends(get_current_tenant),
    client_ip: str = Depends(get_client_ip)
):
    """Approve pending paper
    
    Admin/tenant_admin only. Changes paper status to approved.
    """
    try:
        await paper_service.approve_paper(
            paper_id=paper_id,
            approver_id=current_user.id,
            tenant_id=current_tenant.id,
            client_ip=client_ip
        )
        
        return {"message": "Paper approved successfully"}
        
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paper not found"
        )
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to approve paper"
        )

@router.post("/{paper_id}/reject")
async def reject_paper(
    paper_id: int,
    reason: str = Form(..., min_length=10, max_length=500),
    current_user: User = Depends(require_roles(["admin", "tenant_admin"])),
    current_tenant: Tenant = Depends(get_current_tenant),
    client_ip: str = Depends(get_client_ip)
):
    """Reject pending paper
    
    Admin/tenant_admin only. Changes paper status to rejected with reason.
    """
    try:
        await paper_service.reject_paper(
            paper_id=paper_id,
            rejector_id=current_user.id,
            reason=reason,
            tenant_id=current_tenant.id,
            client_ip=client_ip
        )
        
        return {"message": "Paper rejected successfully"}
        
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paper not found"
        )
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reject paper"
        )

@router.delete("/{paper_id}")
async def delete_paper(
    paper_id: int,
    current_user: User = Depends(require_roles(["admin", "tenant_admin"])),
    current_tenant: Tenant = Depends(get_current_tenant),
    client_ip: str = Depends(get_client_ip)
):
    """Delete paper
    
    Admin/tenant_admin only. Permanently removes paper and associated files.
    """
    try:
        await paper_service.delete_paper(
            paper_id=paper_id,
            deleter_id=current_user.id,
            tenant_id=current_tenant.id,
            client_ip=client_ip
        )
        
        return {"message": "Paper deleted successfully"}
        
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paper not found"
        )
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete paper"
        )

@router.get("/stats/overview", response_model=PaperStatsResponse)
async def get_paper_stats(
    current_user: User = Depends(get_current_active_user),
    current_tenant: Tenant = Depends(get_current_tenant)
):
    """Get paper statistics
    
    Returns overview of paper counts, popular subjects, and recent activity.
    """
    try:
        stats = await paper_service.get_paper_stats(
            tenant_id=current_tenant.id,
            user_id=current_user.id
        )
        
        return PaperStatsResponse(**stats)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve statistics"
        )