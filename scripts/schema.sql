-- Inferno Pictures Database Schema
-- Tables: users (photographer profile), media (images with metadata)

-- Create users table for photographer profile
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  location TEXT,
  avatar_url TEXT,
  services_offered TEXT[], -- Array of service categories: ['Portrait', 'Editorial', 'Events', 'Videography', 'Wedding']
  instagram_handle TEXT,
  twitter_handle TEXT,
  linkedin_handle TEXT,
  portfolio_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create media table for gallery images
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  cloudinary_public_id TEXT,
  category TEXT NOT NULL, -- 'portrait', 'editorial', 'nature', 'event', 'videography'
  caption TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (optional, for security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Media is viewable by everyone" ON media
  FOR SELECT USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_media_category ON media(category);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);
