"""Paper repository for paper-related database operations.

Handles paper management, search, filtering, and version control.
"""

from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timedelta

from sqlalchemy import select, and_, or_, func, update, desc, asc, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload

from app.models.paper import Paper, PaperStatus, PaperVersion, ExamType
from app.models.user import User
from app.models.tenant import Tenant
from app.repositories.base_repository import BaseRepository
from app.core.exceptions import ValidationError, NotFoundError


class PaperRepository(BaseRepository[Paper]):
    """Repository for paper operations."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(db, Paper)
    
    async def get_by_tenant(
        self,
        tenant_id: int,
        status: Optional[PaperStatus] = None,
        skip: int = 0,
        limit: int = 100,
        load_relationships: bool = False
    ) -> List[Paper]:
        """Get papers by tenant.
        
        Args:
            tenant_id: Tenant ID
            status: Filter by paper status
            skip: Number of records to skip
            limit: Maximum number of records
            load_relationships: Whether to load relationships
            
        Returns:
            List of papers
        """
        query = select(Paper).where(Paper.tenant_id == tenant_id)
        
        if status:
            query = query.where(Paper.status == status)
        
        if load_relationships:
            query = query.options(
                selectinload(Paper.uploader),
                selectinload(Paper.versions)
            )
        
        query = query.order_by(Paper.created_at.desc()).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_approved_papers(
        self,
        tenant_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
        load_relationships: bool = False
    ) -> List[Paper]:
        """Get approved papers.
        
        Args:
            tenant_id: Filter by tenant ID
            skip: Number of records to skip
            limit: Maximum number of records
            load_relationships: Whether to load relationships
            
        Returns:
            List of approved papers
        """
        query = select(Paper).where(Paper.status == PaperStatus.APPROVED)
        
        if tenant_id:
            query = query.where(Paper.tenant_id == tenant_id)
        
        if load_relationships:
            query = query.options(
                selectinload(Paper.uploader),
                selectinload(Paper.versions)
            )
        
        query = query.order_by(Paper.created_at.desc()).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def search_papers(
        self,
        search_term: Optional[str] = None,
        tenant_id: Optional[int] = None,
        subject: Optional[str] = None,
        university: Optional[str] = None,
        stream: Optional[str] = None,
        year: Optional[int] = None,
        semester_year: Optional[str] = None,
        exam_type: Optional[ExamType] = None,
        tags: Optional[List[str]] = None,
        status: Optional[PaperStatus] = None,
        skip: int = 0,
        limit: int = 100,
        order_by: str = 'created_at',
        order_desc: bool = True
    ) -> List[Paper]:
        """Search papers with multiple filters.
        
        Args:
            search_term: Text search in title and description
            tenant_id: Filter by tenant ID
            subject: Filter by subject
            university: Filter by university
            stream: Filter by stream
            year: Filter by year
            semester_year: Filter by semester/year
            exam_type: Filter by exam type
            tags: Filter by tags (any of the provided tags)
            status: Filter by status
            skip: Number of records to skip
            limit: Maximum number of records
            order_by: Field to order by
            order_desc: Whether to order in descending order
            
        Returns:
            List of matching papers
        """
        query = select(Paper)
        conditions = []
        
        # Text search
        if search_term:
            search_pattern = f"%{search_term}%"
            conditions.append(
                or_(
                    Paper.title.ilike(search_pattern),
                    Paper.description.ilike(search_pattern)
                )
            )
        
        # Exact filters
        if tenant_id:
            conditions.append(Paper.tenant_id == tenant_id)
        
        if subject:
            conditions.append(Paper.subject.ilike(f"%{subject}%"))
        
        if university:
            conditions.append(Paper.university.ilike(f"%{university}%"))
        
        if stream:
            conditions.append(Paper.stream.ilike(f"%{stream}%"))
        
        if year:
            conditions.append(Paper.year == year)
        
        if semester_year:
            conditions.append(Paper.semester_year == semester_year)
        
        if exam_type:
            conditions.append(Paper.exam_type == exam_type)
        
        if status:
            conditions.append(Paper.status == status)
        
        # Tags filter (any of the provided tags)
        if tags:
            tag_conditions = []
            for tag in tags:
                tag_conditions.append(Paper.tags.op('@>')([tag]))
            conditions.append(or_(*tag_conditions))
        
        # Apply conditions
        if conditions:
            query = query.where(and_(*conditions))
        
        # Add ordering
        if hasattr(Paper, order_by):
            order_field = getattr(Paper, order_by)
            if order_desc:
                query = query.order_by(order_field.desc())
            else:
                query = query.order_by(order_field)
        
        # Add pagination
        query = query.offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_papers_by_uploader(
        self,
        uploader_id: int,
        status: Optional[PaperStatus] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Paper]:
        """Get papers uploaded by a specific user.
        
        Args:
            uploader_id: Uploader user ID
            status: Filter by status
            skip: Number of records to skip
            limit: Maximum number of records
            
        Returns:
            List of papers
        """
        query = select(Paper).where(Paper.uploader_id == uploader_id)
        
        if status:
            query = query.where(Paper.status == status)
        
        query = query.order_by(Paper.created_at.desc()).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_popular_papers(
        self,
        tenant_id: Optional[int] = None,
        days: int = 30,
        skip: int = 0,
        limit: int = 100
    ) -> List[Paper]:
        """Get popular papers based on download count.
        
        Args:
            tenant_id: Filter by tenant ID
            days: Number of days to consider for popularity
            skip: Number of records to skip
            limit: Maximum number of records
            
        Returns:
            List of popular papers
        """
        query = select(Paper).where(Paper.status == PaperStatus.APPROVED)
        
        if tenant_id:
            query = query.where(Paper.tenant_id == tenant_id)
        
        # Order by download count and rating
        query = query.order_by(
            Paper.download_count.desc(),
            Paper.average_rating.desc(),
            Paper.created_at.desc()
        ).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_recent_papers(
        self,
        tenant_id: Optional[int] = None,
        days: int = 7,
        skip: int = 0,
        limit: int = 100
    ) -> List[Paper]:
        """Get recently uploaded papers.
        
        Args:
            tenant_id: Filter by tenant ID
            days: Number of days to consider as recent
            skip: Number of records to skip
            limit: Maximum number of records
            
        Returns:
            List of recent papers
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        query = select(Paper).where(
            and_(
                Paper.status == PaperStatus.APPROVED,
                Paper.created_at >= cutoff_date
            )
        )
        
        if tenant_id:
            query = query.where(Paper.tenant_id == tenant_id)
        
        query = query.order_by(Paper.created_at.desc()).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_papers_pending_approval(
        self,
        tenant_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Paper]:
        """Get papers pending approval.
        
        Args:
            tenant_id: Filter by tenant ID
            skip: Number of records to skip
            limit: Maximum number of records
            
        Returns:
            List of papers pending approval
        """
        query = select(Paper).where(Paper.status == PaperStatus.PENDING)
        
        if tenant_id:
            query = query.where(Paper.tenant_id == tenant_id)
        
        query = query.options(selectinload(Paper.uploader))
        query = query.order_by(Paper.created_at.asc()).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def approve_paper(
        self,
        paper_id: int,
        moderator_id: int,
        moderator_notes: Optional[str] = None
    ) -> bool:
        """Approve a paper.
        
        Args:
            paper_id: Paper ID
            moderator_id: Moderator user ID
            moderator_notes: Optional moderator notes
            
        Returns:
            True if approved successfully
        """
        update_data = {
            'status': PaperStatus.APPROVED,
            'moderator_id': moderator_id,
            'moderated_at': datetime.utcnow()
        }
        
        if moderator_notes:
            update_data['moderator_notes'] = moderator_notes
        
        query = (
            update(Paper)
            .where(Paper.id == paper_id)
            .values(**update_data)
        )
        
        result = await self.db.execute(query)
        return result.rowcount > 0
    
    async def reject_paper(
        self,
        paper_id: int,
        moderator_id: int,
        moderator_notes: str
    ) -> bool:
        """Reject a paper.
        
        Args:
            paper_id: Paper ID
            moderator_id: Moderator user ID
            moderator_notes: Rejection reason
            
        Returns:
            True if rejected successfully
        """
        query = (
            update(Paper)
            .where(Paper.id == paper_id)
            .values(
                status=PaperStatus.REJECTED,
                moderator_id=moderator_id,
                moderator_notes=moderator_notes,
                moderated_at=datetime.utcnow()
            )
        )
        
        result = await self.db.execute(query)
        return result.rowcount > 0
    
    async def increment_download_count(self, paper_id: int) -> bool:
        """Increment paper download count.
        
        Args:
            paper_id: Paper ID
            
        Returns:
            True if incremented successfully
        """
        query = (
            update(Paper)
            .where(Paper.id == paper_id)
            .values(download_count=Paper.download_count + 1)
        )
        
        result = await self.db.execute(query)
        return result.rowcount > 0
    
    async def update_rating(
        self,
        paper_id: int,
        new_rating: float,
        rating_count: int
    ) -> bool:
        """Update paper rating.
        
        Args:
            paper_id: Paper ID
            new_rating: New average rating
            rating_count: Total number of ratings
            
        Returns:
            True if updated successfully
        """
        query = (
            update(Paper)
            .where(Paper.id == paper_id)
            .values(
                average_rating=new_rating,
                rating_count=rating_count
            )
        )
        
        result = await self.db.execute(query)
        return result.rowcount > 0
    
    async def get_paper_statistics(
        self,
        tenant_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Get paper statistics.
        
        Args:
            tenant_id: Filter by tenant ID
            
        Returns:
            Dictionary with paper statistics
        """
        base_query = select(func.count(Paper.id))
        
        if tenant_id:
            base_query = base_query.where(Paper.tenant_id == tenant_id)
        
        # Total papers
        total_result = await self.db.execute(base_query)
        total_papers = total_result.scalar()
        
        # Papers by status
        status_stats = {}
        for status in PaperStatus:
            status_query = base_query.where(Paper.status == status)
            status_result = await self.db.execute(status_query)
            status_stats[status.value] = status_result.scalar()
        
        # Papers by exam type
        exam_type_stats = {}
        for exam_type in ExamType:
            exam_type_query = base_query.where(Paper.exam_type == exam_type)
            exam_type_result = await self.db.execute(exam_type_query)
            exam_type_stats[exam_type.value] = exam_type_result.scalar()
        
        # Total downloads
        downloads_query = select(func.sum(Paper.download_count))
        if tenant_id:
            downloads_query = downloads_query.where(Paper.tenant_id == tenant_id)
        downloads_result = await self.db.execute(downloads_query)
        total_downloads = downloads_result.scalar() or 0
        
        return {
            'total_papers': total_papers,
            'by_status': status_stats,
            'by_exam_type': exam_type_stats,
            'total_downloads': total_downloads
        }
    
    async def get_subjects(
        self,
        tenant_id: Optional[int] = None,
        limit: int = 100
    ) -> List[str]:
        """Get unique subjects.
        
        Args:
            tenant_id: Filter by tenant ID
            limit: Maximum number of subjects
            
        Returns:
            List of unique subjects
        """
        query = select(Paper.subject.distinct()).where(Paper.subject.isnot(None))
        
        if tenant_id:
            query = query.where(Paper.tenant_id == tenant_id)
        
        query = query.order_by(Paper.subject).limit(limit)
        
        result = await self.db.execute(query)
        return [subject for subject in result.scalars().all() if subject]
    
    async def get_universities(
        self,
        tenant_id: Optional[int] = None,
        limit: int = 100
    ) -> List[str]:
        """Get unique universities.
        
        Args:
            tenant_id: Filter by tenant ID
            limit: Maximum number of universities
            
        Returns:
            List of unique universities
        """
        query = select(Paper.university.distinct()).where(Paper.university.isnot(None))
        
        if tenant_id:
            query = query.where(Paper.tenant_id == tenant_id)
        
        query = query.order_by(Paper.university).limit(limit)
        
        result = await self.db.execute(query)
        return [university for university in result.scalars().all() if university]
    
    async def get_popular_tags(
        self,
        tenant_id: Optional[int] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get popular tags with counts.
        
        Args:
            tenant_id: Filter by tenant ID
            limit: Maximum number of tags
            
        Returns:
            List of dictionaries with tag and count
        """
        # This is a simplified version - in production, you might want to use
        # a more sophisticated approach with proper JSON aggregation
        query = select(Paper.tags).where(Paper.tags.isnot(None))
        
        if tenant_id:
            query = query.where(Paper.tenant_id == tenant_id)
        
        result = await self.db.execute(query)
        all_tags = result.scalars().all()
        
        # Count tag occurrences
        tag_counts = {}
        for tags_list in all_tags:
            if tags_list:
                for tag in tags_list:
                    tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        # Sort by count and return top tags
        sorted_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)
        return [
            {'tag': tag, 'count': count}
            for tag, count in sorted_tags[:limit]
        ]
    
    async def create_paper_version(
        self,
        paper_id: int,
        s3_key: str,
        checksum: str,
        file_size: Optional[int] = None
    ) -> PaperVersion:
        """Create a new paper version.
        
        Args:
            paper_id: Paper ID
            s3_key: S3 storage key
            checksum: File checksum
            file_size: File size in bytes
            
        Returns:
            Created paper version
        """
        version_data = {
            'paper_id': paper_id,
            's3_key': s3_key,
            'checksum': checksum,
            'file_size': file_size
        }
        
        version = PaperVersion(**version_data)
        self.db.add(version)
        await self.db.flush()
        await self.db.refresh(version)
        return version
    
    async def get_paper_versions(
        self,
        paper_id: int,
        skip: int = 0,
        limit: int = 10
    ) -> List[PaperVersion]:
        """Get versions for a paper.
        
        Args:
            paper_id: Paper ID
            skip: Number of records to skip
            limit: Maximum number of records
            
        Returns:
            List of paper versions
        """
        query = (
            select(PaperVersion)
            .where(PaperVersion.paper_id == paper_id)
            .order_by(PaperVersion.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def full_text_search(
        self,
        search_term: str,
        tenant_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Paper]:
        """Perform full-text search on papers.
        
        Args:
            search_term: Search term
            tenant_id: Filter by tenant ID
            skip: Number of records to skip
            limit: Maximum number of records
            
        Returns:
            List of matching papers
        """
        # Use PostgreSQL full-text search if available, otherwise fall back to ILIKE
        try:
            # Try PostgreSQL full-text search
            search_vector = func.to_tsvector('english', 
                func.coalesce(Paper.title, '') + ' ' + 
                func.coalesce(Paper.description, '')
            )
            search_query = func.plainto_tsquery('english', search_term)
            
            query = select(Paper).where(search_vector.op('@@')(search_query))
            
            if tenant_id:
                query = query.where(Paper.tenant_id == tenant_id)
            
            # Order by relevance (ts_rank)
            query = query.order_by(
                func.ts_rank(search_vector, search_query).desc()
            ).offset(skip).limit(limit)
            
        except Exception:
            # Fallback to ILIKE search
            search_pattern = f"%{search_term}%"
            query = select(Paper).where(
                or_(
                    Paper.title.ilike(search_pattern),
                    Paper.description.ilike(search_pattern)
                )
            )
            
            if tenant_id:
                query = query.where(Paper.tenant_id == tenant_id)
            
            query = query.order_by(Paper.created_at.desc()).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()