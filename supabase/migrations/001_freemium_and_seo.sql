-- Migration: Create profiles, milestones, tasks, misses, experiments, and SEO content tables
-- This migration adds the infrastructure for the Freemium Goal Operating System

-- 1. Profiles table (daily-goals-specific user data)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  ai_api_key_encrypted TEXT,
  ai_provider TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup (if not exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Goal Milestones
CREATE TABLE IF NOT EXISTS goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  sort_order INT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own milestones"
  ON goal_milestones FOR ALL
  USING (auth.uid() = user_id);

-- 3. Goal Tasks
CREATE TABLE IF NOT EXISTS goal_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID REFERENCES goal_milestones(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  sort_order INT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE goal_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tasks"
  ON goal_tasks FOR ALL
  USING (auth.uid() = user_id);

-- 4. Goal Misses (failure tracking)
CREATE TABLE IF NOT EXISTS goal_misses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  miss_date DATE NOT NULL,
  reason TEXT CHECK (reason IN ('no_time', 'too_tired', 'forgot', 'too_difficult', 'not_motivated', 'unexpected', 'schedule_conflict', 'other')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(goal_id, miss_date)
);

ALTER TABLE goal_misses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own misses"
  ON goal_misses FOR ALL
  USING (auth.uid() = user_id);

-- 5. Goal Experiments
CREATE TABLE IF NOT EXISTS goal_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  description TEXT,
  original_schedule JSONB,
  experiment_schedule JSONB,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE goal_experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own experiments"
  ON goal_experiments FOR ALL
  USING (auth.uid() = user_id);

-- 6. SEO Content
CREATE TABLE IF NOT EXISTS seo_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  featured_image TEXT,
  featured_image_alt TEXT,
  category TEXT,
  focus_keyword TEXT,
  secondary_keywords TEXT[],
  author TEXT,
  indexable BOOLEAN DEFAULT true,
  follow_links BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE seo_content ENABLE ROW LEVEL SECURITY;

-- Admin-only access for SEO content management
CREATE POLICY "Admins can manage SEO content"
  ON seo_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.subscription_tier = 'pro'
    )
  );

-- Public read access for published content
CREATE POLICY "Public can view published SEO content"
  ON seo_content FOR SELECT
  USING (status = 'published');

-- 7. SEO Content Related
CREATE TABLE IF NOT EXISTS seo_content_related (
  content_id UUID REFERENCES seo_content(id) ON DELETE CASCADE,
  related_id UUID REFERENCES seo_content(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, related_id)
);

ALTER TABLE seo_content_related ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view related content for published pages"
  ON seo_content_related FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM seo_content
      WHERE seo_content.id = content_id AND seo_content.status = 'published'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_daily_logs_user_id ON goal_daily_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_daily_logs_goal_date ON goal_daily_logs(goal_id, log_date);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_goal_id ON goal_milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_tasks_goal_id ON goal_tasks(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_tasks_milestone_id ON goal_tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_goal_misses_goal_id ON goal_misses(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_misses_user_date ON goal_misses(user_id, miss_date);
CREATE INDEX IF NOT EXISTS idx_goal_experiments_goal_id ON goal_experiments(goal_id);
CREATE INDEX IF NOT EXISTS idx_seo_content_slug ON seo_content(slug);
CREATE INDEX IF NOT EXISTS idx_seo_content_status ON seo_content(status);
CREATE INDEX IF NOT EXISTS idx_seo_content_category ON seo_content(category);
