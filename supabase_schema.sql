-- READIFY SUPABASE SCHEMA MIGRATION SCRIPT
-- Run this script in your Supabase SQL Editor to initialize the database tables and Row Level Security.

-- ==========================================
-- 1. Profiles Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    avatar_url TEXT,
    theme TEXT DEFAULT 'dark',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Trigger: Automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, theme)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    'dark'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==========================================
-- 2. Projects Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE DEFAULT auth.uid(),
    project_name TEXT NOT NULL,
    description TEXT,
    tech_stack JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    readme_content TEXT,
    template_style TEXT DEFAULT 'minimal',
    is_favorite BOOLEAN DEFAULT false,
    installation TEXT DEFAULT '',
    usage TEXT DEFAULT '',
    advanced_options JSONB DEFAULT '{"includeBadges":true,"includeInstallation":true,"includeApiDocs":false,"includeArchitecture":false,"includeContribution":false,"includeLicense":true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Projects Policies
CREATE POLICY "Users can view their own projects" ON public.projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON public.projects
    FOR DELETE USING (auth.uid() = user_id);

-- Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_projects_modtime ON public.projects;
CREATE TRIGGER update_projects_modtime
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();


-- ==========================================
-- 3. Templates Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Templates
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Templates Policies
CREATE POLICY "Templates are viewable by all authenticated users" ON public.templates
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Insert Default Templates
INSERT INTO public.templates (name, description, settings) VALUES
('Minimal API Service', 'A lightweight template ideal for backend REST microservices, APIs, and CLI utilities.', '{"style":"minimal","techStack":["Node.js","Express","Docker"],"features":["Fast Routing","JWT Authorization","Docker Containerized"],"advanced":{"includeBadges":true,"includeInstallation":true,"includeApiDocs":true,"includeArchitecture":false,"includeContribution":false,"includeLicense":true}}'),
('Open-Source Package', 'Full documentation template with extensive contribution guides, build systems, badges, and badges.', '{"style":"open-source","techStack":["React","TypeScript","Vite"],"features":["Modular Components","TS Type-Safe","ESLint and Prettier"],"advanced":{"includeBadges":true,"includeInstallation":true,"includeApiDocs":false,"includeArchitecture":true,"includeContribution":true,"includeLicense":true}}'),
('SaaS Startup Landing', 'FSE-ready project document including interactive features lists, tech stack breakdowns, and architecture outline.', '{"style":"startup","techStack":["Next.js","Tailwind CSS","Supabase"],"features":["Supabase Authentication","RLS PostgreSQL","Responsive UI Dashboard"],"advanced":{"includeBadges":true,"includeInstallation":true,"includeApiDocs":true,"includeArchitecture":true,"includeContribution":false,"includeLicense":true}}')
ON CONFLICT DO NOTHING;
