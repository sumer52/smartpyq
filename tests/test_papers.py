"""Tests for paper management functionality.

Tests paper service, file upload, processing, and paper endpoints.
"""

import pytest
import tempfile
import os
from unittest.mock import Mock, patch, MagicMock
from io import BytesIO
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.services.paper_service import PaperService
from app.models.paper import Paper, PaperVersion
from app.models.user import User
from app.utils.pdf_processor import PDFProcessor
from tests.conftest import TestUtils

class TestPDFProcessor:
    """Test PDF processing utilities."""
    
    def test_is_valid_pdf_valid(self, sample_pdf_file):
        """Test PDF validation with valid file."""
        processor = PDFProcessor()
        
        # Test with file path
        is_valid = processor.is_valid_pdf(sample_pdf_file)
        assert is_valid is True
    
    def test_is_valid_pdf_invalid(self, sample_text_file):
        """Test PDF validation with invalid file."""
        processor = PDFProcessor()
        
        # Test with non-PDF file
        is_valid = processor.is_valid_pdf(sample_text_file)
        assert is_valid is False
    
    def test_is_valid_pdf_nonexistent(self):
        """Test PDF validation with nonexistent file."""
        processor = PDFProcessor()
        
        # Test with nonexistent file
        is_valid = processor.is_valid_pdf("/nonexistent/file.pdf")
        assert is_valid is False
    
    @patch('app.utils.pdf_processor.fitz')
    def test_extract_text_success(self, mock_fitz, sample_pdf_file):
        """Test successful text extraction."""
        # Mock PyMuPDF
        mock_doc = Mock()
        mock_page = Mock()
        mock_page.get_text.return_value = "Sample PDF content"
        mock_doc.__iter__ = Mock(return_value=iter([mock_page]))
        mock_doc.close = Mock()
        mock_fitz.open.return_value = mock_doc
        
        processor = PDFProcessor()
        text = processor.extract_text(sample_pdf_file)
        
        assert text == "Sample PDF content"
        mock_fitz.open.assert_called_once_with(sample_pdf_file)
        mock_doc.close.assert_called_once()
    
    @patch('app.utils.pdf_processor.fitz', side_effect=ImportError)
    @patch('app.utils.pdf_processor.PyPDF2')
    def test_extract_text_fallback(self, mock_pypdf2, mock_fitz, sample_pdf_file):
        """Test text extraction fallback to PyPDF2."""
        # Mock PyPDF2
        mock_reader = Mock()
        mock_page = Mock()
        mock_page.extract_text.return_value = "Fallback PDF content"
        mock_reader.pages = [mock_page]
        mock_pypdf2.PdfReader.return_value = mock_reader
        
        processor = PDFProcessor()
        text = processor.extract_text(sample_pdf_file)
        
        assert text == "Fallback PDF content"
    
    @patch('app.utils.pdf_processor.fitz')
    def test_extract_metadata_success(self, mock_fitz, sample_pdf_file):
        """Test successful metadata extraction."""
        # Mock PyMuPDF
        mock_doc = Mock()
        mock_doc.metadata = {
            'title': 'Test Document',
            'author': 'Test Author',
            'subject': 'Test Subject',
            'creator': 'Test Creator',
            'producer': 'Test Producer',
            'creationDate': 'D:20231201120000Z',
            'modDate': 'D:20231201120000Z'
        }
        mock_doc.page_count = 10
        mock_doc.close = Mock()
        mock_fitz.open.return_value = mock_doc
        
        processor = PDFProcessor()
        metadata = processor.extract_metadata(sample_pdf_file)
        
        assert metadata['title'] == 'Test Document'
        assert metadata['author'] == 'Test Author'
        assert metadata['page_count'] == 10
        mock_doc.close.assert_called_once()
    
    @patch('app.utils.pdf_processor.fitz')
    def test_generate_thumbnail_success(self, mock_fitz, sample_pdf_file):
        """Test successful thumbnail generation."""
        # Mock PyMuPDF
        mock_doc = Mock()
        mock_page = Mock()
        mock_pix = Mock()
        mock_pix.tobytes.return_value = b'fake_image_data'
        mock_page.get_pixmap.return_value = mock_pix
        mock_doc.__getitem__ = Mock(return_value=mock_page)
        mock_doc.close = Mock()
        mock_fitz.open.return_value = mock_doc
        
        processor = PDFProcessor()
        
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
            output_path = tmp.name
        
        try:
            success = processor.generate_thumbnail(sample_pdf_file, output_path)
            assert success is True
            assert os.path.exists(output_path)
        finally:
            if os.path.exists(output_path):
                os.unlink(output_path)
    
    @patch('app.utils.pdf_processor.fitz')
    def test_add_watermark_success(self, mock_fitz, sample_pdf_file):
        """Test successful watermark addition."""
        # Mock PyMuPDF
        mock_doc = Mock()
        mock_page = Mock()
        mock_doc.__iter__ = Mock(return_value=iter([mock_page]))
        mock_doc.save = Mock()
        mock_doc.close = Mock()
        mock_fitz.open.return_value = mock_doc
        
        processor = PDFProcessor()
        
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp:
            output_path = tmp.name
        
        try:
            success = processor.add_watermark(sample_pdf_file, output_path, "WATERMARK")
            assert success is True
            mock_doc.save.assert_called_once_with(output_path)
        finally:
            if os.path.exists(output_path):
                os.unlink(output_path)
    
    def test_compute_checksum(self, sample_pdf_file):
        """Test checksum computation."""
        processor = PDFProcessor()
        
        checksum1 = processor.compute_checksum(sample_pdf_file)
        checksum2 = processor.compute_checksum(sample_pdf_file)
        
        # Same file should produce same checksum
        assert checksum1 == checksum2
        assert len(checksum1) == 64  # SHA-256 hex length
    
    def test_get_file_info(self, sample_pdf_file):
        """Test file info extraction."""
        processor = PDFProcessor()
        
        info = processor.get_file_info(sample_pdf_file)
        
        assert 'size' in info
        assert 'mime_type' in info
        assert 'extension' in info
        assert info['size'] > 0
        assert info['extension'] == '.pdf'

class TestPaperService:
    """Test paper service functionality."""
    
    def test_create_paper_success(self, paper_service: PaperService, test_user: User):
        """Test successful paper creation."""
        paper_data = {
            "title": "Test Paper",
            "subject": "Mathematics",
            "university": "Test University",
            "stream": "Engineering",
            "year": 2023,
            "semester_year": "Semester 1",
            "exam_type": "Final",
            "tags": ["algebra", "calculus"]
        }
        
        paper = paper_service.create_paper(paper_data, test_user.id)
        
        assert paper is not None
        assert paper.title == "Test Paper"
        assert paper.subject == "Mathematics"
        assert paper.uploader_id == test_user.id
        assert paper.status == "pending"
    
    def test_get_paper_by_id(self, paper_service: PaperService, test_paper: Paper):
        """Test getting paper by ID."""
        paper = paper_service.get_paper_by_id(test_paper.id)
        
        assert paper is not None
        assert paper.id == test_paper.id
        assert paper.title == test_paper.title
    
    def test_get_paper_nonexistent(self, paper_service: PaperService):
        """Test getting nonexistent paper."""
        paper = paper_service.get_paper_by_id(99999)
        
        assert paper is None
    
    def test_get_papers_with_filters(self, paper_service: PaperService, test_paper: Paper):
        """Test getting papers with filters."""
        filters = {
            "subject": test_paper.subject,
            "year": test_paper.year
        }
        
        papers = paper_service.get_papers(filters=filters)
        
        assert len(papers) > 0
        assert all(p.subject == test_paper.subject for p in papers)
        assert all(p.year == test_paper.year for p in papers)
    
    def test_get_papers_pagination(self, paper_service: PaperService):
        """Test papers pagination."""
        # Create multiple papers
        for i in range(5):
            paper_data = {
                "title": f"Test Paper {i}",
                "subject": "Test Subject",
                "university": "Test University",
                "stream": "Test Stream",
                "year": 2023,
                "semester_year": "Semester 1",
                "exam_type": "Final"
            }
            paper_service.create_paper(paper_data, 1)
        
        # Test pagination
        papers_page1 = paper_service.get_papers(limit=3, offset=0)
        papers_page2 = paper_service.get_papers(limit=3, offset=3)
        
        assert len(papers_page1) <= 3
        assert len(papers_page2) <= 3
        
        # Ensure no overlap
        page1_ids = {p.id for p in papers_page1}
        page2_ids = {p.id for p in papers_page2}
        assert page1_ids.isdisjoint(page2_ids)
    
    def test_search_papers_by_title(self, paper_service: PaperService, test_paper: Paper):
        """Test searching papers by title."""
        results = paper_service.search_papers("Test")
        
        assert len(results) > 0
        assert any(test_paper.id == p.id for p in results)
    
    def test_search_papers_by_content(self, paper_service: PaperService):
        """Test searching papers by content."""
        # Create paper with specific content
        paper_data = {
            "title": "Searchable Paper",
            "subject": "Computer Science",
            "university": "Test University",
            "stream": "Engineering",
            "year": 2023,
            "semester_year": "Semester 1",
            "exam_type": "Final"
        }
        paper = paper_service.create_paper(paper_data, 1)
        
        # Mock extracted content
        paper.extracted_text = "This paper discusses algorithms and data structures"
        paper_service.db.commit()
        
        results = paper_service.search_papers("algorithms")
        
        assert len(results) > 0
        assert any(paper.id == p.id for p in results)
    
    @patch('app.services.paper_service.process_upload_task.delay')
    def test_upload_paper_success(self, mock_task, paper_service: PaperService, test_user: User, sample_pdf_file):
        """Test successful paper upload."""
        # Create upload file mock
        with open(sample_pdf_file, 'rb') as f:
            file_content = f.read()
        
        upload_file = UploadFile(
            filename="test.pdf",
            file=BytesIO(file_content),
            content_type="application/pdf"
        )
        
        paper_data = {
            "title": "Uploaded Paper",
            "subject": "Physics",
            "university": "Test University",
            "stream": "Science",
            "year": 2023,
            "semester_year": "Semester 1",
            "exam_type": "Midterm"
        }
        
        result = paper_service.upload_paper(upload_file, paper_data, test_user.id)
        
        assert result["success"] is True
        assert "paper" in result
        assert result["paper"]["title"] == "Uploaded Paper"
        assert result["paper"]["status"] == "processing"
        
        # Verify background task was called
        mock_task.assert_called_once()
    
    def test_upload_paper_invalid_file(self, paper_service: PaperService, test_user: User, sample_text_file):
        """Test paper upload with invalid file."""
        # Create upload file mock with text file
        with open(sample_text_file, 'rb') as f:
            file_content = f.read()
        
        upload_file = UploadFile(
            filename="test.txt",
            file=BytesIO(file_content),
            content_type="text/plain"
        )
        
        paper_data = {
            "title": "Invalid Upload",
            "subject": "Test",
            "university": "Test University",
            "stream": "Test",
            "year": 2023,
            "semester_year": "Semester 1",
            "exam_type": "Test"
        }
        
        result = paper_service.upload_paper(upload_file, paper_data, test_user.id)
        
        assert result["success"] is False
        assert "invalid" in result["error"].lower()
    
    def test_update_paper_status(self, paper_service: PaperService, test_paper: Paper):
        """Test updating paper status."""
        result = paper_service.update_paper_status(test_paper.id, "approved")
        
        assert result["success"] is True
        
        # Verify status was updated
        updated_paper = paper_service.get_paper_by_id(test_paper.id)
        assert updated_paper.status == "approved"
    
    def test_delete_paper_success(self, paper_service: PaperService, test_paper: Paper):
        """Test successful paper deletion."""
        paper_id = test_paper.id
        
        result = paper_service.delete_paper(paper_id)
        
        assert result["success"] is True
        
        # Verify paper was deleted
        deleted_paper = paper_service.get_paper_by_id(paper_id)
        assert deleted_paper is None
    
    def test_get_user_papers(self, paper_service: PaperService, test_user: User, test_paper: Paper):
        """Test getting papers by user."""
        papers = paper_service.get_user_papers(test_user.id)
        
        assert len(papers) > 0
        assert all(p.uploader_id == test_user.id for p in papers)
    
    def test_get_paper_statistics(self, paper_service: PaperService):
        """Test getting paper statistics."""
        stats = paper_service.get_paper_statistics()
        
        assert "total_papers" in stats
        assert "papers_by_status" in stats
        assert "papers_by_subject" in stats
        assert "recent_uploads" in stats
        assert isinstance(stats["total_papers"], int)
    
    @patch('app.utils.storage.StorageAdapter.generate_signed_url')
    def test_get_paper_download_url(self, mock_signed_url, paper_service: PaperService, test_paper: Paper):
        """Test getting paper download URL."""
        mock_signed_url.return_value = "https://example.com/signed-url"
        
        # Set file URL for paper
        test_paper.file_url = "papers/test.pdf"
        paper_service.db.commit()
        
        url = paper_service.get_paper_download_url(test_paper.id)
        
        assert url == "https://example.com/signed-url"
        mock_signed_url.assert_called_once_with("papers/test.pdf", expires_in=300)
    
    @patch('app.utils.pdf_processor.PDFProcessor.add_watermark')
    @patch('app.utils.storage.StorageAdapter.upload_file')
    def test_generate_watermarked_paper(self, mock_upload, mock_watermark, paper_service: PaperService, test_paper: Paper, test_user: User):
        """Test generating watermarked paper."""
        mock_watermark.return_value = True
        mock_upload.return_value = "watermarked/test.pdf"
        
        # Set file URL for paper
        test_paper.file_url = "papers/test.pdf"
        paper_service.db.commit()
        
        result = paper_service.generate_watermarked_paper(test_paper.id, test_user.id)
        
        assert result["success"] is True
        assert "url" in result
        mock_watermark.assert_called_once()

class TestPaperEndpoints:
    """Test paper API endpoints."""
    
    def test_get_papers_endpoint(self, client, auth_headers):
        """Test get papers endpoint."""
        response = client.get("/api/v1/papers", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "papers" in data
        assert "total" in data
        assert "page" in data
        assert "limit" in data
    
    def test_get_paper_by_id_endpoint(self, client, auth_headers, test_paper: Paper):
        """Test get paper by ID endpoint."""
        response = client.get(f"/api/v1/papers/{test_paper.id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_paper.id
        assert data["title"] == test_paper.title
    
    def test_get_nonexistent_paper_endpoint(self, client, auth_headers):
        """Test get nonexistent paper endpoint."""
        response = client.get("/api/v1/papers/99999", headers=auth_headers)
        
        assert response.status_code == 404
    
    @patch('app.services.paper_service.process_upload_task.delay')
    def test_upload_paper_endpoint(self, mock_task, client, auth_headers, sample_pdf_file):
        """Test upload paper endpoint."""
        with open(sample_pdf_file, 'rb') as f:
            files = {"file": ("test.pdf", f, "application/pdf")}
            data = {
                "title": "API Upload Test",
                "subject": "Computer Science",
                "university": "Test University",
                "stream": "Engineering",
                "year": "2023",
                "semester_year": "Semester 1",
                "exam_type": "Final"
            }
            
            response = client.post(
                "/api/v1/papers/upload",
                files=files,
                data=data,
                headers=auth_headers
            )
        
        assert response.status_code == 201
        response_data = response.json()
        assert response_data["success"] is True
        assert "paper" in response_data
    
    def test_search_papers_endpoint(self, client, auth_headers):
        """Test search papers endpoint."""
        response = client.get("/api/v1/search?q=test", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert "total" in data
        assert "query" in data
    
    @patch('app.services.paper_service.PaperService.get_paper_download_url')
    def test_authorize_paper_endpoint(self, mock_download_url, client, auth_headers, test_paper: Paper):
        """Test paper authorization endpoint."""
        mock_download_url.return_value = "https://example.com/signed-url"
        
        response = client.get(f"/api/v1/papers/{test_paper.id}/authorize", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "download_url" in data
        assert data["download_url"] == "https://example.com/signed-url"
    
    @patch('app.services.paper_service.PaperService.generate_watermarked_paper')
    def test_stamp_paper_endpoint(self, mock_watermark, client, auth_headers, test_paper: Paper):
        """Test paper stamping endpoint."""
        mock_watermark.return_value = {
            "success": True,
            "url": "https://example.com/watermarked.pdf"
        }
        
        response = client.post(f"/api/v1/papers/{test_paper.id}/stamp", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "url" in data
    
    def test_unauthorized_paper_access(self, client, test_paper: Paper):
        """Test unauthorized access to paper endpoints."""
        response = client.get(f"/api/v1/papers/{test_paper.id}")
        
        assert response.status_code == 401

# Performance tests
class TestPaperPerformance:
    """Test paper-related performance."""
    
    @pytest.mark.slow
    def test_search_performance(self, paper_service: PaperService):
        """Test search performance with multiple papers."""
        import time
        
        # Create multiple papers
        for i in range(50):
            paper_data = {
                "title": f"Performance Test Paper {i}",
                "subject": f"Subject {i % 5}",
                "university": "Test University",
                "stream": "Engineering",
                "year": 2020 + (i % 4),
                "semester_year": "Semester 1",
                "exam_type": "Final"
            }
            paper_service.create_paper(paper_data, 1)
        
        # Time search operation
        start_time = time.time()
        results = paper_service.search_papers("Performance")
        end_time = time.time()
        
        search_time = end_time - start_time
        
        # Should complete search in reasonable time (less than 1 second)
        assert search_time < 1.0
        assert len(results) > 0
    
    @pytest.mark.slow
    def test_pagination_performance(self, paper_service: PaperService):
        """Test pagination performance."""
        import time
        
        # Time paginated query
        start_time = time.time()
        papers = paper_service.get_papers(limit=20, offset=0)
        end_time = time.time()
        
        query_time = end_time - start_time
        
        # Should complete query in reasonable time (less than 0.5 seconds)
        assert query_time < 0.5