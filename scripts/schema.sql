-- Inferno Pictures Database Schema
-- Tables: users, services, media, messages, testimonials, bookings

-- ═════════════════════════════════════════════════════════════
-- USERS TABLE - Photographer Profile
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  location TEXT,
  avatar_url TEXT,
  services_offered TEXT[], -- Array of service names
  instagram_handle TEXT,
  twitter_handle TEXT,
  linkedin_handle TEXT,
  portfolio_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ═════════════════════════════════════════════════════════════
-- SERVICES TABLE - Available Services
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- e.g., 'Portrait Photography', 'Wedding Coverage', 'Video Production'
  description TEXT,
  base_price DECIMAL(10, 2),
  duration_hours INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ═════════════════════════════════════════════════════════════
-- MEDIA TABLE - Gallery Images & Videos
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  cloudinary_public_id TEXT UNIQUE,
  media_type TEXT NOT NULL, -- 'image' or 'video'
  category TEXT NOT NULL, -- 'portrait', 'editorial', 'nature', 'event'
  caption TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ═════════════════════════════════════════════════════════════
-- MESSAGES TABLE - Contact Form Submissions
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ═════════════════════════════════════════════════════════════
-- TESTIMONIALS TABLE - Client Testimonials & Reviews
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_title TEXT, -- e.g., 'Bride & Groom', 'Magazine Editor'
  client_image_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  quote TEXT NOT NULL,
  service_type TEXT, -- e.g., 'Wedding Photography', 'Editorial'
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ═════════════════════════════════════════════════════════════
-- BOOKINGS TABLE - Project/Session Bookings
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  event_date DATE NOT NULL,
  event_location TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'
  deposit_amount DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ═════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY & POLICIES
-- ═════════════════════════════════════════════════════════════
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (is_active);
CREATE POLICY "Media is viewable by everyone" ON media FOR SELECT USING (true);
CREATE POLICY "Approved testimonials are viewable by everyone" ON testimonials FOR SELECT USING (is_approved);

-- Admin-only write policies (protect from public mutations)
CREATE POLICY "Messages can be created by anyone" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Bookings can be created by anyone" ON bookings FOR INSERT WITH CHECK (true);

-- ═════════════════════════════════════════════════════════════
-- INDEXES FOR PERFORMANCE
-- ═════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_media_media_type ON media(media_type);
CREATE INDEX IF NOT EXISTS idx_media_category ON media(category);
CREATE INDEX IF NOT EXISTS idx_media_featured ON media(featured);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
