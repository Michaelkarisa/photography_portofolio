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
5. Run the query to create the `users` and `media` tables

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

### 2.1 Create Upload Preset (REQUIRED)

To use unsigned uploads (uploads without exposing API secret), you must create an upload preset:

1. Go to Cloudinary Dashboard → Settings → Upload
2. Under "Upload presets", click **"Add upload preset"**
3. Set the following:
   - **Name:** `inferno_pictures`
   - **Signing Mode:** `Unsigned`
   - **Folder:** `inferno_pictures`
   - Click **"Save"**

### 2.2 Get Your Cloud Name

1. In Cloudinary Dashboard, at the top you'll see your **Cloud Name**
2. It's already configured in `js/cloudinary-upload.js`:
   ```javascript
   const CLOUDINARY_CLOUD_NAME = 'dtwfhkkhm';
   const CLOUDINARY_UPLOAD_PRESET = 'inferno_pictures';
   ```

**⚠️ Important:** The upload preset name must match exactly what you created in Cloudinary.

---

## 3. Database Seeding (Optional)

To add sample data to your database:

1. Go to Supabase SQL Editor
2. Insert sample data:

```sql
-- Insert sample photographer profile
INSERT INTO users (name, bio, location, services_offered, instagram_handle, twitter_handle, linkedin_handle, portfolio_url)
VALUES (
  'Alex Chen',
  'Editorial photographer capturing moments of truth. Based in Kilifi, creating cinematic frames for brands and publications.',
  'Kilifi, Kenya',
  ARRAY['Portrait', 'Editorial', 'Events', 'Videography'],
  'alexchen_photography',
  'alexchen_photos',
  'alex-chen',
  'https://alexchen.photography'
);

-- Insert sample media items
INSERT INTO media (url, cloudinary_public_id, category, caption) VALUES
('https://res.cloudinary.com/dtwfhkkhm/image/upload/v1/inferno_pictures/sample1.jpg', 'inferno_pictures/sample1', 'portrait', 'Studio Portrait Session'),
('https://res.cloudinary.com/dtwfhkkhm/image/upload/v1/inferno_pictures/sample2.jpg', 'inferno_pictures/sample2', 'editorial', 'Editorial Feature');
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
   - **Photographer Profile** — Edit your name, bio, location, and social handles
   - **Media** — Upload images to Cloudinary and save to database

### Uploading Images

1. Go to **Media** panel
2. Select an image file (JPEG, PNG, WebP, GIF — max 50MB)
3. Add a caption and select a category
4. Click **Upload Image**
5. The image is uploaded to Cloudinary and saved to Supabase
6. The frontend automatically reflects changes

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
- Edit name, bio, location
- Add social media handles (Instagram, Twitter, LinkedIn, Portfolio)
- Update services offered
- Data syncs to hero section and footer

### Media Management
- Upload images directly from admin panel
- Automatic Cloudinary integration
- Categories: Portrait, Editorial, Nature, Event, Videography
- Add captions for each image
- View all uploaded media in admin gallery

### Gallery
- Dynamic gallery fed from Supabase
- Filter by category
- Responsive masonry layout
- Hover effects and animations

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
