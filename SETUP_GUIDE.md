# Inferno Pictures — Setup & Configuration Guide

This guide covers the setup and configuration required to run the Inferno Pictures website with Supabase and Cloudinary integration.

## Prerequisites

- Supabase account (https://supabase.com)
- Cloudinary account (https://cloudinary.com)
- Basic knowledge of environment variables

---

## 1. Supabase Setup

### 1.1 Create Database Schema

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Copy the entire contents of `scripts/schema.sql`
4. Paste into a new SQL query
5. Run the query to create all tables:
   - `users` — Photographer profile (name, bio, location, social handles)
   - `services` — Available photography services
   - `media` — Gallery images and videos with metadata
   - `messages` — Contact form submissions
   - `testimonials` — Client testimonials and reviews
   - `bookings` — Project/session booking requests

### 1.2 Get Your Credentials

1. In Supabase, go to **Settings → API**
2. Copy your **Project URL** and **anon key**
3. These are already configured in `js/supabase-client.js`:
   ```javascript
   const SUPABASE_URL = 'https://pkeqoyqojprzakncxlyv.supabase.co';
   const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   ```

**⚠️ Note:** The anon key in the code is public and safe to use for client-side operations. The tables have Row Level Security (RLS) configured to allow public read-only access.

---

## 2. Cloudinary Setup

### 2.1 Create Upload Presets (REQUIRED)

You need TWO upload presets for media and logos:

**First Preset - Media (Images & Videos):**

1. Go to Cloudinary Dashboard → Settings → Upload
2. Under "Upload presets", click **"Add upload preset"**
3. Set the following:
   - **Name:** `inferno_pictures`
   - **Signing Mode:** `Unsigned`
   - **Folder:** `inferno_pictures`
   - Click **"Save"**

**Second Preset - Logos:**

1. Repeat the steps above to create another upload preset
2. Set the following:
   - **Name:** `inferno_pictures_logos`
   - **Signing Mode:** `Unsigned`
   - **Folder:** `inferno_pictures_logos`
   - Click **"Save"**

### 2.2 Get Your Cloud Name

1. In Cloudinary Dashboard, at the top you'll see your **Cloud Name**
2. It's already configured in `js/cloudinary-upload.js`:
   ```javascript
   const CLOUDINARY_CLOUD_NAME = 'dtwfhkkhm';
   const CLOUDINARY_UPLOAD_PRESET = 'inferno_pictures';
   ```

**⚠️ Important:** The upload preset names must match exactly what you created in Cloudinary: `inferno_pictures` for media and `inferno_pictures_logos` for logos.

---

## 3. Database Seeding (Optional)

To add sample data to your database:

1. Go to Supabase SQL Editor
2. Insert sample data:

```sql
-- Insert sample photographer profile with logo
INSERT INTO users (name, bio, location, logo_url, services_offered, instagram_handle, twitter_handle, linkedin_handle, portfolio_url)
VALUES (
  'Alex Chen',
  'Editorial photographer capturing moments of truth. Based in Kilifi, creating cinematic frames for brands and publications.',
  'Kilifi, Kenya',
  'https://res.cloudinary.com/dtwfhkkhm/image/upload/v1/inferno_pictures_logos/logo.png',
  ARRAY['Portrait', 'Editorial', 'Events', 'Videography'],
  'alexchen_photography',
  'alexchen_photos',
  'alex-chen',
  'https://alexchen.photography'
);

-- Insert sample media items
INSERT INTO media (url, cloudinary_public_id, media_type, category, caption) VALUES
('https://res.cloudinary.com/dtwfhkkhm/image/upload/v1/inferno_pictures/sample1.jpg', 'inferno_pictures/sample1', 'image', 'portrait', 'Studio Portrait Session'),
('https://res.cloudinary.com/dtwfhkkhm/image/upload/v1/inferno_pictures/sample2.jpg', 'inferno_pictures/sample2', 'image', 'editorial', 'Editorial Feature');
```

---

## 4. Admin Dashboard Access

### Login Credentials (Demo)

- **Username:** `admin`
- **Password:** `inferno123`

### Accessing the Admin Panel

1. Open `admin/dashboard.html` in your browser
2. Login with the credentials above
3. Navigate to:
   - **Photographer Profile** — Upload logo, edit name, bio, location, and social handles
   - **Media** — Upload images and videos to Cloudinary and save to database

### Uploading Logo

1. Go to **Photographer Profile** panel
2. Click on the **Logo Upload** card
3. Select a logo image file:
   - **Formats:** JPEG, PNG, WebP, GIF
   - **Size Limit:** Max 10MB
   - **Recommended:** 300x300px square format for best display
4. Click **Upload Logo**
5. The logo is uploaded to Cloudinary and saved to Supabase
6. The logo appears in the website header (replaces text logo)

### Uploading Media

1. Go to **Media** panel
2. Select a file (image or video):
   - **Images:** JPEG, PNG, WebP, GIF (max 50MB)
   - **Videos:** MP4, WebM, QuickTime (max 500MB)
3. Add a caption and select a category (Portrait, Editorial, Nature, Event)
4. Click **Upload Media**
5. The file is uploaded to Cloudinary and saved to Supabase
6. The frontend automatically reflects changes when gallery reloads

---

## 5. Frontend Integration

The frontend automatically:
- Loads the photographer profile on page load
- Displays all media items in the gallery
- Supports category filtering (Portrait, Editorial, Nature, Event, Videography)
- Updates in real-time when admin uploads new content

**Files Involved:**
- `index.html` — Main website
- `js/main.js` — Data fetching and gallery rendering
- `js/supabase-client.js` — Supabase client functions
- `js/cloudinary-upload.js` — Cloudinary upload utilities

---

## 6. File Structure

```
project/
├── index.html                    # Main website
├── styles.css                    # All styling
├── js/
│   ├── main.js                   # Frontend data loading
│   ├── supabase-client.js        # Supabase API functions
│   ├── cloudinary-upload.js      # Cloudinary upload utilities
├── admin/
│   ├── dashboard.html            # Admin dashboard
│   ├── admin.js                  # Admin functionality
│   ├── admin.css                 # Admin styling
├── scripts/
│   └── schema.sql                # Database schema (run once)
```

---

## 7. Key Features

### Photographer Profile
- Upload custom logo (displays in website header)
- Edit name, bio, location
- Add social media handles (Instagram, Twitter, LinkedIn, Portfolio)
- Update services offered
- Add avatar (profile photo)
- Data syncs to hero section and throughout website

### Media Management
- Upload images and videos directly from admin panel
- Automatic Cloudinary integration with optimization
- Categories: Portrait, Editorial, Nature, Event
- Add captions for each media item
- View all uploaded media in admin gallery with delete option
- Media type tracking (image or video)

### Services Management
- Add/edit photography services (Portrait Sessions, Brand Editorial, Events, etc.)
- Set pricing and turnaround times
- Mark services as active or inactive
- Feature popular services

### Messages & Bookings
- Receive contact form submissions in admin inbox
- Track booking requests with client details
- Manage booking status (pending, confirmed, in-progress, completed, cancelled)
- Link bookings to specific services

### Testimonials
- Collect and manage client testimonials
- Star ratings and client information
- Feature testimonials on website
- Approve/reject testimonials before publishing

### Gallery
- Dynamic gallery fed from Supabase media table
- Filter by category (Portrait, Editorial, Nature, Event)
- Responsive masonry layout
- Separate image and video handling

---

## 8. Troubleshooting

### Images not uploading?
- Check Cloudinary upload preset is named exactly `inferno_pictures`
- Verify Cloud Name is `dtwfhkkhm` in cloudinary-upload.js
- Check browser console for error messages

### Gallery not showing?
- Verify Supabase database has entries in `media` table
- Check that Supabase credentials are correct in supabase-client.js
- Open browser console and check for JavaScript errors

### Admin panel not loading?
- Clear browser cache
- Check all script imports in dashboard.html
- Verify Supabase and Cloudinary libraries are loaded from CDN

---

## 9. Security Notes

- **Supabase Key:** The anon key is public and safe — RLS policies restrict what can be accessed
- **Cloudinary:** Uses unsigned uploads for security — no API secret is exposed
- **Admin Login:** Replace demo credentials with proper authentication in production
- **Database:** All tables have RLS enabled with public read-only access

---

## 10. Production Deployment

Before deploying:

1. Replace demo admin credentials with real authentication
2. Update RLS policies if needed
3. Test all image uploads
4. Set up proper Cloudinary transformation presets
5. Configure CDN for image optimization
6. Enable HTTPS on your domain

---

## Support & Resources

- Supabase Docs: https://supabase.com/docs
- Cloudinary Docs: https://cloudinary.com/documentation
- Inferno Pictures GitHub: (link to your repo)

---

**Last Updated:** March 2026
