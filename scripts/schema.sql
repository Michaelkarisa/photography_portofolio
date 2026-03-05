-- Inferno Pictures Database Schema
-- Tables: users, services, media, messages, testimonials, bookings, collections

-- ═══════════════════════════════════════
-- USERS TABLE - Photographer Profile
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  location TEXT,
  logo_url TEXT,
  avatar_url TEXT,
  about_title TEXT,
  about_body TEXT,
  philosophy TEXT,
  skills TEXT[],
  clients_note TEXT,
  services_offered TEXT[],
  instagram_handle TEXT,
  twitter_handle TEXT,
  linkedin_handle TEXT,
  facebook_handle TEXT,
  portfolio_url TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- SERVICES TABLE
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  description TEXT,
  base_price DECIMAL(10, 2),
  duration_hours INTEGER,
  items_offered TEXT[],
  turnaround TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- COLLECTIONS TABLE - Curated Series
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  series_label TEXT,
  description TEXT,
  tagline TEXT,
  image_url TEXT,
  cloudinary_public_id TEXT,
  link_label TEXT DEFAULT 'See full series',
  link_url TEXT DEFAULT '#contact',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- MEDIA TABLE
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  cloudinary_public_id TEXT UNIQUE,
  media_type TEXT NOT NULL,
  category TEXT NOT NULL,
  caption TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- MESSAGES TABLE
-- ═══════════════════════════════════════
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

-- ═══════════════════════════════════════
-- TESTIMONIALS TABLE
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_title TEXT,
  client_image_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  quote TEXT NOT NULL,
  service_type TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- BOOKINGS TABLE
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  event_date DATE NOT NULL,
  event_location TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  deposit_amount DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (is_active);
CREATE POLICY "Media is viewable by everyone" ON media FOR SELECT USING (true);
CREATE POLICY "Approved testimonials are viewable by everyone" ON testimonials FOR SELECT USING (is_approved);
CREATE POLICY "Collections are viewable by everyone" ON collections FOR SELECT USING (is_active);
CREATE POLICY "Messages can be created by anyone" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Bookings can be created by anyone" ON bookings FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_media_category ON media(category);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_collections_active ON collections(is_active);
CREATE INDEX IF NOT EXISTS idx_collections_sort ON collections(sort_order);
