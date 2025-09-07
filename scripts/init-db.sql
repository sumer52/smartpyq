-- Smart PYQ Database Initialization Script
-- This script sets up the initial database structure and data

-- Create database if it doesn't exist (for PostgreSQL)
-- Note: This is typically handled by the container initialization

-- Set timezone
SET timezone = 'UTC';

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search
CREATE EXTENSION IF NOT EXISTS "unaccent";  -- For accent-insensitive search

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'admin', 'tenant_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE paper_status AS ENUM ('pending', 'processing', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE chat_message_role AS ENUM ('user', 'assistant', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create initial tenant (example university)
INSERT INTO tenants (id, name, allowed_domains, access_code_hash, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'Example University',
    ARRAY['university.edu', 'student.university.edu'],
    '$argon2id$v=19$m=65536,t=3,p=4$example_hash',  -- Replace with actual hash
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Create initial admin user
-- Password: admin123 (change this in production!)
INSERT INTO users (id, email, password_hash, name, role, tenant_id, domain_verified, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'admin@university.edu',
    '$argon2id$v=19$m=65536,t=3,p=4$admin_hash',  -- Replace with actual hash
    'System Administrator',
    'admin'::user_role,
    t.id,
    true,
    NOW(),
    NOW()
FROM tenants t 
WHERE t.name = 'Example University'
ON CONFLICT (email) DO NOTHING;

-- Create initial features
INSERT INTO features (id, title, description, icon_url, display_order, created_at, updated_at)
VALUES 
    (
        uuid_generate_v4(),
        'AI-Powered Chat Assistant',
        'Get instant help with your academic questions using our advanced AI chatbot powered by Google Gemini.',
        '/icons/chat-ai.svg',
        1,
        NOW(),
        NOW()
    ),
    (
        uuid_generate_v4(),
        'Comprehensive Paper Database',
        'Access thousands of previous year question papers from various universities and subjects.',
        '/icons/database.svg',
        2,
        NOW(),
        NOW()
    ),
    (
        uuid_generate_v4(),
        'Smart Search & Filtering',
        'Find exactly what you need with our intelligent search and advanced filtering options.',
        '/icons/search.svg',
        3,
        NOW(),
        NOW()
    ),
    (
        uuid_generate_v4(),
        'Secure File Management',
        'Upload, organize, and access your study materials with enterprise-grade security.',
        '/icons/security.svg',
        4,
        NOW(),
        NOW()
    ),
    (
        uuid_generate_v4(),
        'Multi-University Support',
        'Support for multiple universities and colleges with domain-based access control.',
        '/icons/university.svg',
        5,
        NOW(),
        NOW()
    ),
    (
        uuid_generate_v4(),
        'Real-time Analytics',
        'Track your study progress and get insights into trending topics and popular papers.',
        '/icons/analytics.svg',
        6,
        NOW(),
        NOW()
    )
ON CONFLICT DO NOTHING;

-- Create sample paper categories/subjects
INSERT INTO papers (id, title, subject, university, stream, year, semester_year, exam_type, tags, file_url, uploader_id, status, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'Sample Mathematics Paper - Calculus',
    'Mathematics',
    'Example University',
    'Engineering',
    2023,
    'Semester 1',
    'Mid-term',
    '["calculus", "derivatives", "integrals", "sample"]'::jsonb,
    '/samples/math-calculus-2023.pdf',
    u.id,
    'approved'::paper_status,
    NOW(),
    NOW()
FROM users u 
WHERE u.email = 'admin@university.edu'
ON CONFLICT DO NOTHING;

INSERT INTO papers (id, title, subject, university, stream, year, semester_year, exam_type, tags, file_url, uploader_id, status, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'Sample Physics Paper - Mechanics',
    'Physics',
    'Example University',
    'Engineering',
    2023,
    'Semester 1',
    'Final',
    '["mechanics", "motion", "forces", "sample"]'::jsonb,
    '/samples/physics-mechanics-2023.pdf',
    u.id,
    'approved'::paper_status,
    NOW(),
    NOW()
FROM users u 
WHERE u.email = 'admin@university.edu'
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_papers_subject ON papers(subject);
CREATE INDEX IF NOT EXISTS idx_papers_university ON papers(university);
CREATE INDEX IF NOT EXISTS idx_papers_year ON papers(year);
CREATE INDEX IF NOT EXISTS idx_papers_status ON papers(status);
CREATE INDEX IF NOT EXISTS idx_papers_tags ON papers USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_papers_search ON papers USING GIN(to_tsvector('english', title || ' ' || subject));

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_uuid ON chat_sessions(session_uuid);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- Create full-text search configuration
CREATE TEXT SEARCH CONFIGURATION IF NOT EXISTS smartpyq_search (COPY = english);

-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trigger_update_%s_updated_at ON %s', t, t);
        EXECUTE format('CREATE TRIGGER trigger_update_%s_updated_at 
                       BEFORE UPDATE ON %s 
                       FOR EACH ROW 
                       EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END $$;

-- Create function for paper search
CREATE OR REPLACE FUNCTION search_papers(search_query text)
RETURNS TABLE(
    id uuid,
    title text,
    subject text,
    university text,
    year integer,
    rank real
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.subject,
        p.university,
        p.year,
        ts_rank(to_tsvector('english', p.title || ' ' || p.subject), plainto_tsquery('english', search_query)) as rank
    FROM papers p
    WHERE 
        p.status = 'approved'
        AND (
            to_tsvector('english', p.title || ' ' || p.subject) @@ plainto_tsquery('english', search_query)
            OR p.title ILIKE '%' || search_query || '%'
            OR p.subject ILIKE '%' || search_query || '%'
        )
    ORDER BY rank DESC, p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function for getting trending topics
CREATE OR REPLACE FUNCTION get_trending_topics(days_back integer DEFAULT 7, limit_count integer DEFAULT 10)
RETURNS TABLE(
    subject text,
    paper_count bigint,
    recent_downloads bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.subject,
        COUNT(*)::bigint as paper_count,
        COALESCE(SUM(CASE WHEN al.created_at > NOW() - INTERVAL '1 day' * days_back THEN 1 ELSE 0 END), 0)::bigint as recent_downloads
    FROM papers p
    LEFT JOIN audit_logs al ON al.target_id::text = p.id::text AND al.action = 'paper_download'
    WHERE p.status = 'approved'
    GROUP BY p.subject
    ORDER BY recent_downloads DESC, paper_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample audit logs for demonstration
INSERT INTO audit_logs (id, actor_id, action, target_type, target_id, metadata, created_at)
SELECT 
    uuid_generate_v4(),
    u.id,
    'user_login',
    'user',
    u.id::text,
    '{"ip_address": "127.0.0.1", "user_agent": "Sample Browser"}'::jsonb,
    NOW() - INTERVAL '1 hour'
FROM users u 
WHERE u.email = 'admin@university.edu'
ON CONFLICT DO NOTHING;

-- Create materialized view for analytics (optional)
CREATE MATERIALIZED VIEW IF NOT EXISTS paper_analytics AS
SELECT 
    p.subject,
    p.university,
    p.year,
    COUNT(*) as paper_count,
    AVG(EXTRACT(EPOCH FROM (NOW() - p.created_at))/86400) as avg_age_days
FROM papers p
WHERE p.status = 'approved'
GROUP BY p.subject, p.university, p.year;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_paper_analytics_unique 
ON paper_analytics(subject, university, year);

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW paper_analytics;

-- Grant permissions (adjust as needed)
GRANT USAGE ON SCHEMA public TO PUBLIC;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO PUBLIC;

-- Create a function to refresh analytics (can be called by Celery)
CREATE OR REPLACE FUNCTION refresh_analytics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY paper_analytics;
    -- Add other analytics refresh operations here
END;
$$ LANGUAGE plpgsql;

-- Final message
DO $$
BEGIN
    RAISE NOTICE 'Smart PYQ database initialization completed successfully!';
    RAISE NOTICE 'Default admin user: admin@university.edu (change password!)';
    RAISE NOTICE 'Default tenant: Example University';
END $$;