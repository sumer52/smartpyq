#!/usr/bin/env python3
"""
Smart PYQ Application Initialization Script

This script initializes the Smart PYQ application with:
- Database setup and migrations
- Initial admin user creation
- Default tenant setup
- Sample data insertion
- Environment validation

Usage:
    python scripts/init-app.py [--reset] [--sample-data]
    
Options:
    --reset: Drop and recreate all tables (WARNING: destroys data)
    --sample-data: Insert sample papers and data for development
    --admin-email: Email for admin user (default: admin@example.com)
    --admin-password: Password for admin user (default: prompts for input)
    --tenant-name: Name of default tenant (default: Example University)
    --tenant-domains: Comma-separated domains for tenant (default: example.edu)
"""

import asyncio
import argparse
import getpass
import os
import sys
from pathlib import Path
from typing import List, Optional

# Add the app directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import get_settings
from app.core.database import get_db_session
from app.core.security import get_password_hash, generate_access_code
from app.models.tenant import Tenant
from app.models.user import User, UserRole
from app.models.paper import Paper, PaperStatus
from app.models.feature import Feature
from app.services.auth_service import AuthService
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from datetime import datetime, timezone


class AppInitializer:
    """Application initialization manager."""
    
    def __init__(self):
        self.settings = get_settings()
        self.auth_service = AuthService()
    
    async def validate_environment(self) -> bool:
        """Validate that all required environment variables are set."""
        print("🔍 Validating environment configuration...")
        
        required_vars = [
            'DATABASE_URL',
            'JWT_SECRET',
            'REDIS_URL'
        ]
        
        missing_vars = []
        for var in required_vars:
            if not getattr(self.settings, var.lower(), None):
                missing_vars.append(var)
        
        if missing_vars:
            print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
            print("Please check your .env file or environment configuration.")
            return False
        
        # Validate database connection
        try:
            async with get_db_session() as session:
                await session.execute(text("SELECT 1"))
            print("✅ Database connection successful")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            return False
        
        print("✅ Environment validation passed")
        return True
    
    async def run_migrations(self) -> bool:
        """Run Alembic migrations."""
        print("🔄 Running database migrations...")
        
        try:
            import subprocess
            result = subprocess.run(
                ["alembic", "upgrade", "head"],
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent.parent
            )
            
            if result.returncode != 0:
                print(f"❌ Migration failed: {result.stderr}")
                return False
            
            print("✅ Database migrations completed")
            return True
            
        except Exception as e:
            print(f"❌ Migration error: {e}")
            return False
    
    async def create_default_tenant(
        self, 
        name: str = "Example University",
        domains: List[str] = None
    ) -> Optional[Tenant]:
        """Create default tenant if it doesn't exist."""
        if domains is None:
            domains = ["example.edu", "student.example.edu"]
        
        print(f"🏢 Creating default tenant: {name}...")
        
        async with get_db_session() as session:
            # Check if tenant already exists
            existing_tenant = await session.execute(
                text("SELECT id FROM tenants WHERE name = :name"),
                {"name": name}
            )
            
            if existing_tenant.first():
                print(f"ℹ️  Tenant '{name}' already exists")
                result = await session.execute(
                    text("SELECT * FROM tenants WHERE name = :name"),
                    {"name": name}
                )
                return result.first()
            
            # Generate access code
            access_code = generate_access_code()
            access_code_hash = get_password_hash(access_code)
            
            # Create tenant
            tenant_id = str(uuid.uuid4())
            await session.execute(
                text("""
                    INSERT INTO tenants (id, name, allowed_domains, access_code_hash, created_at, updated_at)
                    VALUES (:id, :name, :domains, :access_code_hash, :created_at, :updated_at)
                """),
                {
                    "id": tenant_id,
                    "name": name,
                    "domains": domains,
                    "access_code_hash": access_code_hash,
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                }
            )
            
            await session.commit()
            
            print(f"✅ Tenant created successfully")
            print(f"📋 Tenant Access Code: {access_code}")
            print(f"⚠️  Save this access code - it won't be shown again!")
            
            # Return the created tenant
            result = await session.execute(
                text("SELECT * FROM tenants WHERE id = :id"),
                {"id": tenant_id}
            )
            return result.first()
    
    async def create_admin_user(
        self,
        email: str,
        password: str,
        name: str = "System Administrator",
        tenant_id: str = None
    ) -> Optional[User]:
        """Create admin user if it doesn't exist."""
        print(f"👤 Creating admin user: {email}...")
        
        async with get_db_session() as session:
            # Check if user already exists
            existing_user = await session.execute(
                text("SELECT id FROM users WHERE email = :email"),
                {"email": email}
            )
            
            if existing_user.first():
                print(f"ℹ️  Admin user '{email}' already exists")
                return None
            
            # Get tenant ID if not provided
            if not tenant_id:
                tenant_result = await session.execute(
                    text("SELECT id FROM tenants LIMIT 1")
                )
                tenant_row = tenant_result.first()
                if not tenant_row:
                    print("❌ No tenant found. Create a tenant first.")
                    return None
                tenant_id = str(tenant_row.id)
            
            # Hash password
            password_hash = get_password_hash(password)
            
            # Create user
            user_id = str(uuid.uuid4())
            await session.execute(
                text("""
                    INSERT INTO users (id, email, password_hash, name, role, tenant_id, domain_verified, created_at, updated_at)
                    VALUES (:id, :email, :password_hash, :name, :role, :tenant_id, :domain_verified, :created_at, :updated_at)
                """),
                {
                    "id": user_id,
                    "email": email,
                    "password_hash": password_hash,
                    "name": name,
                    "role": "admin",
                    "tenant_id": tenant_id,
                    "domain_verified": True,
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                }
            )
            
            await session.commit()
            
            print(f"✅ Admin user created successfully")
            print(f"📧 Email: {email}")
            print(f"🔑 Password: {password}")
            
            return user_id
    
    async def create_default_features(self) -> bool:
        """Create default feature entries."""
        print("🎯 Creating default features...")
        
        features = [
            {
                "title": "AI-Powered Chat Assistant",
                "description": "Get instant help with your academic questions using our advanced AI chatbot powered by Google Gemini.",
                "icon_url": "/icons/chat-ai.svg",
                "display_order": 1
            },
            {
                "title": "Comprehensive Paper Database",
                "description": "Access thousands of previous year question papers from various universities and subjects.",
                "icon_url": "/icons/database.svg",
                "display_order": 2
            },
            {
                "title": "Smart Search & Filtering",
                "description": "Find exactly what you need with our intelligent search and advanced filtering options.",
                "icon_url": "/icons/search.svg",
                "display_order": 3
            },
            {
                "title": "Secure File Management",
                "description": "Upload, organize, and access your study materials with enterprise-grade security.",
                "icon_url": "/icons/security.svg",
                "display_order": 4
            },
            {
                "title": "Multi-University Support",
                "description": "Support for multiple universities and colleges with domain-based access control.",
                "icon_url": "/icons/university.svg",
                "display_order": 5
            },
            {
                "title": "Real-time Analytics",
                "description": "Track your study progress and get insights into trending topics and popular papers.",
                "icon_url": "/icons/analytics.svg",
                "display_order": 6
            }
        ]
        
        async with get_db_session() as session:
            for feature_data in features:
                # Check if feature already exists
                existing = await session.execute(
                    text("SELECT id FROM features WHERE title = :title"),
                    {"title": feature_data["title"]}
                )
                
                if existing.first():
                    continue
                
                # Create feature
                await session.execute(
                    text("""
                        INSERT INTO features (id, title, description, icon_url, display_order, created_at, updated_at)
                        VALUES (:id, :title, :description, :icon_url, :display_order, :created_at, :updated_at)
                    """),
                    {
                        "id": str(uuid.uuid4()),
                        "title": feature_data["title"],
                        "description": feature_data["description"],
                        "icon_url": feature_data["icon_url"],
                        "display_order": feature_data["display_order"],
                        "created_at": datetime.now(timezone.utc),
                        "updated_at": datetime.now(timezone.utc)
                    }
                )
            
            await session.commit()
            print(f"✅ Created {len(features)} default features")
            return True
    
    async def create_sample_data(self, admin_user_id: str) -> bool:
        """Create sample papers and data for development."""
        print("📚 Creating sample data...")
        
        sample_papers = [
            {
                "title": "Mathematics - Calculus and Differential Equations",
                "subject": "Mathematics",
                "university": "Example University",
                "stream": "Engineering",
                "year": 2023,
                "semester_year": "Semester 1",
                "exam_type": "Mid-term",
                "tags": ["calculus", "derivatives", "integrals", "differential-equations"]
            },
            {
                "title": "Physics - Mechanics and Thermodynamics",
                "subject": "Physics",
                "university": "Example University",
                "stream": "Engineering",
                "year": 2023,
                "semester_year": "Semester 1",
                "exam_type": "Final",
                "tags": ["mechanics", "motion", "forces", "thermodynamics"]
            },
            {
                "title": "Computer Science - Data Structures and Algorithms",
                "subject": "Computer Science",
                "university": "Example University",
                "stream": "Computer Science",
                "year": 2023,
                "semester_year": "Semester 2",
                "exam_type": "Mid-term",
                "tags": ["data-structures", "algorithms", "programming", "complexity"]
            },
            {
                "title": "Chemistry - Organic Chemistry Fundamentals",
                "subject": "Chemistry",
                "university": "Example University",
                "stream": "Science",
                "year": 2023,
                "semester_year": "Semester 1",
                "exam_type": "Final",
                "tags": ["organic-chemistry", "reactions", "mechanisms", "synthesis"]
            }
        ]
        
        async with get_db_session() as session:
            for paper_data in sample_papers:
                # Check if paper already exists
                existing = await session.execute(
                    text("SELECT id FROM papers WHERE title = :title"),
                    {"title": paper_data["title"]}
                )
                
                if existing.first():
                    continue
                
                # Create paper
                await session.execute(
                    text("""
                        INSERT INTO papers (id, title, subject, university, stream, year, semester_year, exam_type, tags, file_url, uploader_id, status, created_at, updated_at)
                        VALUES (:id, :title, :subject, :university, :stream, :year, :semester_year, :exam_type, :tags, :file_url, :uploader_id, :status, :created_at, :updated_at)
                    """),
                    {
                        "id": str(uuid.uuid4()),
                        "title": paper_data["title"],
                        "subject": paper_data["subject"],
                        "university": paper_data["university"],
                        "stream": paper_data["stream"],
                        "year": paper_data["year"],
                        "semester_year": paper_data["semester_year"],
                        "exam_type": paper_data["exam_type"],
                        "tags": paper_data["tags"],
                        "file_url": f"/samples/{paper_data['subject'].lower().replace(' ', '-')}-{paper_data['year']}.pdf",
                        "uploader_id": admin_user_id,
                        "status": "approved",
                        "created_at": datetime.now(timezone.utc),
                        "updated_at": datetime.now(timezone.utc)
                    }
                )
            
            await session.commit()
            print(f"✅ Created {len(sample_papers)} sample papers")
            return True
    
    async def reset_database(self) -> bool:
        """Reset the entire database (WARNING: destroys all data)."""
        print("⚠️  RESETTING DATABASE - ALL DATA WILL BE LOST!")
        
        confirm = input("Type 'RESET' to confirm: ")
        if confirm != "RESET":
            print("❌ Reset cancelled")
            return False
        
        try:
            import subprocess
            
            # Drop all tables
            result = subprocess.run(
                ["alembic", "downgrade", "base"],
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent.parent
            )
            
            if result.returncode != 0:
                print(f"❌ Downgrade failed: {result.stderr}")
                return False
            
            print("✅ Database reset completed")
            return True
            
        except Exception as e:
            print(f"❌ Reset error: {e}")
            return False
    
    async def initialize(
        self,
        reset: bool = False,
        sample_data: bool = False,
        admin_email: str = "admin@example.com",
        admin_password: str = None,
        tenant_name: str = "Example University",
        tenant_domains: List[str] = None
    ) -> bool:
        """Run the complete initialization process."""
        print("🚀 Starting Smart PYQ initialization...")
        print("=" * 50)
        
        # Validate environment
        if not await self.validate_environment():
            return False
        
        # Reset database if requested
        if reset:
            if not await self.reset_database():
                return False
        
        # Run migrations
        if not await self.run_migrations():
            return False
        
        # Create default tenant
        tenant = await self.create_default_tenant(tenant_name, tenant_domains)
        if not tenant:
            return False
        
        # Get admin password if not provided
        if not admin_password:
            admin_password = getpass.getpass("Enter admin password: ")
            if not admin_password:
                print("❌ Password is required")
                return False
        
        # Create admin user
        admin_user_id = await self.create_admin_user(
            admin_email, 
            admin_password, 
            tenant_id=str(tenant.id) if hasattr(tenant, 'id') else None
        )
        
        # Create default features
        await self.create_default_features()
        
        # Create sample data if requested
        if sample_data and admin_user_id:
            await self.create_sample_data(admin_user_id)
        
        print("=" * 50)
        print("🎉 Smart PYQ initialization completed successfully!")
        print("")
        print("Next steps:")
        print("1. Start the application: docker-compose up")
        print("2. Access the API docs: http://localhost:8080/docs")
        print("3. Login with your admin credentials")
        print("4. Configure your AI API keys in the environment")
        print("")
        print("⚠️  Remember to:")
        print("- Change default passwords in production")
        print("- Configure proper domain restrictions")
        print("- Set up SSL certificates")
        print("- Configure monitoring and logging")
        
        return True


async def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Initialize Smart PYQ application")
    parser.add_argument("--reset", action="store_true", help="Reset database (destroys all data)")
    parser.add_argument("--sample-data", action="store_true", help="Insert sample data")
    parser.add_argument("--admin-email", default="admin@example.com", help="Admin user email")
    parser.add_argument("--admin-password", help="Admin user password (will prompt if not provided)")
    parser.add_argument("--tenant-name", default="Example University", help="Default tenant name")
    parser.add_argument("--tenant-domains", help="Comma-separated tenant domains")
    
    args = parser.parse_args()
    
    # Parse tenant domains
    tenant_domains = None
    if args.tenant_domains:
        tenant_domains = [domain.strip() for domain in args.tenant_domains.split(",")]
    
    # Initialize the application
    initializer = AppInitializer()
    
    success = await initializer.initialize(
        reset=args.reset,
        sample_data=args.sample_data,
        admin_email=args.admin_email,
        admin_password=args.admin_password,
        tenant_name=args.tenant_name,
        tenant_domains=tenant_domains
    )
    
    if not success:
        print("❌ Initialization failed")
        sys.exit(1)
    
    print("✅ Initialization completed successfully")


if __name__ == "__main__":
    asyncio.run(main())