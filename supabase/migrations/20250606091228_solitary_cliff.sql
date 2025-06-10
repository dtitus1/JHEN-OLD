/*
  # Complete JHEN Fantasy Database Setup

  1. New Tables
    - `profiles` - User profiles with subscription tiers
    - `categories` - Content categorization
    - `tags` - Content tagging system
    - `articles` - Blog posts and analysis articles
    - `videos` - Video content with metadata
    - `content_views` - Track content engagement

  2. Security
    - Enable RLS on all tables
    - Admin-only policies for content creation/editing
    - Public read access for published content
    - User-specific access for premium content

  3. Features
    - Rich content support with metadata
    - Publishing workflow (draft/published)
    - Premium content gating
    - SEO optimization fields
    - Content analytics
*/

-- Profiles table (must be created first)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'elite', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Articles table (enhanced)
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  featured_image text,
  meta_title text,
  meta_description text,
  is_premium boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  published boolean DEFAULT false,
  published_at timestamptz,
  read_time integer DEFAULT 5,
  view_count integer DEFAULT 0,
  category_id uuid REFERENCES categories(id),
  author_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Videos table (enhanced)
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  youtube_video_id text,
  video_url text,
  thumbnail_url text,
  duration integer,
  view_count integer DEFAULT 0,
  is_premium boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  published boolean DEFAULT false,
  published_at timestamptz,
  category_id uuid REFERENCES categories(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Article tags junction table
CREATE TABLE IF NOT EXISTS article_tags (
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Video tags junction table
CREATE TABLE IF NOT EXISTS video_tags (
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (video_id, tag_id)
);

-- Content views tracking
CREATE TABLE IF NOT EXISTS content_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('article', 'video')),
  content_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  ip_address inet,
  user_agent text,
  viewed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Profiles are created on signup"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.subscription_tier = 'admin'
    )
  );

-- Tags policies
CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage tags"
  ON tags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.subscription_tier = 'admin'
    )
  );

-- Articles policies
CREATE POLICY "Published articles are viewable by everyone"
  ON articles FOR SELECT
  TO public
  USING (published = true AND is_premium = false);

CREATE POLICY "Premium articles require subscription"
  ON articles FOR SELECT
  TO authenticated
  USING (
    published = true AND (
      is_premium = false OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.subscription_tier IN ('premium', 'elite', 'admin')
      )
    )
  );

CREATE POLICY "Authors can manage their own articles"
  ON articles FOR ALL
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Admins can manage all articles"
  ON articles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.subscription_tier = 'admin'
    )
  );

-- Videos policies
CREATE POLICY "Published videos are viewable by everyone"
  ON videos FOR SELECT
  TO public
  USING (published = true AND is_premium = false);

CREATE POLICY "Premium videos require subscription"
  ON videos FOR SELECT
  TO authenticated
  USING (
    published = true AND (
      is_premium = false OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.subscription_tier IN ('premium', 'elite', 'admin')
      )
    )
  );

CREATE POLICY "Only admins can manage videos"
  ON videos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.subscription_tier = 'admin'
    )
  );

-- Junction table policies
CREATE POLICY "Article tags are viewable by everyone"
  ON article_tags FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage article tags"
  ON article_tags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.subscription_tier = 'admin'
    )
  );

CREATE POLICY "Video tags are viewable by everyone"
  ON video_tags FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage video tags"
  ON video_tags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.subscription_tier = 'admin'
    )
  );

-- Content views policies
CREATE POLICY "Users can view their own content views"
  ON content_views FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can insert content views"
  ON content_views FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all content views"
  ON content_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.subscription_tier = 'admin'
    )
  );

-- Insert default categories
INSERT INTO categories (name, slug, description, color) VALUES
  ('Weekly Analysis', 'weekly-analysis', 'Weekly fantasy football breakdowns and analysis', '#3B82F6'),
  ('Player Breakdowns', 'player-breakdowns', 'Individual player analysis and projections', '#10B981'),
  ('Waiver Wire', 'waiver-wire', 'Weekly waiver wire pickups and targets', '#F59E0B'),
  ('Start/Sit', 'start-sit', 'Weekly start and sit recommendations', '#EF4444'),
  ('Draft Strategy', 'draft-strategy', 'Draft guides and strategy content', '#8B5CF6'),
  ('Trade Analysis', 'trade-analysis', 'Trade targets and analysis', '#06B6D4')
ON CONFLICT (slug) DO NOTHING;

-- Insert default tags
INSERT INTO tags (name, slug) VALUES
  ('Quarterback', 'quarterback'),
  ('Running Back', 'running-back'),
  ('Wide Receiver', 'wide-receiver'),
  ('Tight End', 'tight-end'),
  ('Defense', 'defense'),
  ('Kicker', 'kicker'),
  ('Rookie', 'rookie'),
  ('Injury', 'injury'),
  ('Playoff Push', 'playoff-push'),
  ('Championship', 'championship'),
  ('PPR', 'ppr'),
  ('Standard', 'standard'),
  ('Dynasty', 'dynasty'),
  ('Redraft', 'redraft')
ON CONFLICT (slug) DO NOTHING;

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at') THEN
    CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_articles_updated_at') THEN
    CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_videos_updated_at') THEN
    CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_content_views(content_type_param text, content_id_param uuid)
RETURNS void AS $$
BEGIN
  IF content_type_param = 'article' THEN
    UPDATE articles SET view_count = view_count + 1 WHERE id = content_id_param;
  ELSIF content_type_param = 'video' THEN
    UPDATE videos SET view_count = view_count + 1 WHERE id = content_id_param;
  END IF;
  
  INSERT INTO content_views (content_type, content_id, user_id)
  VALUES (content_type_param, content_id_param, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;