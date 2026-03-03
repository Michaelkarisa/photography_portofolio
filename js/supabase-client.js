/**
 * Supabase Client Configuration
 * Initializes Supabase client for data fetching
 */

// Supabase Configuration
const SUPABASE_URL = 'https://pkeqoyqojprzakncxlyv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrZXFveXFvanByemFrbmN4bHl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1ODc3NzIsImV4cCI6MjA0OTE2Mzc3Mn0.9QUqEJ8FfO-3d6IxDnLDHN2M8ZCqGrWXL9XkE0yUfMc';

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Fetch photographer profile from users table
 */
async function fetchPhotographerProfile() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('[v0] Error fetching photographer profile:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[v0] Exception fetching photographer profile:', err);
    return null;
  }
}

/**
 * Fetch all media items from media table
 */
async function fetchAllMedia() {
  try {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[v0] Error fetching media:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[v0] Exception fetching media:', err);
    return [];
  }
}

/**
 * Fetch media by category
 */
async function fetchMediaByCategory(category) {
  try {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[v0] Error fetching media by category:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[v0] Exception fetching media by category:', err);
    return [];
  }
}

/**
 * Create new media item (used by admin)
 */
async function createMediaItem(url, cloudinaryPublicId, category, caption) {
  try {
    const { data, error } = await supabase
      .from('media')
      .insert([
        {
          url,
          cloudinary_public_id: cloudinaryPublicId,
          category,
          caption
        }
      ])
      .select();

    if (error) {
      console.error('[v0] Error creating media item:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (err) {
    console.error('[v0] Exception creating media item:', err);
    return null;
  }
}

/**
 * Update media item
 */
async function updateMediaItem(id, updates) {
  try {
    const { data, error } = await supabase
      .from('media')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('[v0] Error updating media item:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (err) {
    console.error('[v0] Exception updating media item:', err);
    return null;
  }
}

/**
 * Delete media item
 */
async function deleteMediaItem(id) {
  try {
    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[v0] Error deleting media item:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[v0] Exception deleting media item:', err);
    return false;
  }
}

/**
 * Update or create photographer profile
 */
async function savePhotographerProfile(profileData) {
  try {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .single();

    let result;
    if (existing) {
      // Update existing
      result = await supabase
        .from('users')
        .update(profileData)
        .eq('id', existing.id)
        .select();
    } else {
      // Create new
      result = await supabase
        .from('users')
        .insert([profileData])
        .select();
    }

    if (result.error) {
      console.error('[v0] Error saving photographer profile:', result.error);
      return null;
    }

    return result.data?.[0] || null;
  } catch (err) {
    console.error('[v0] Exception saving photographer profile:', err);
    return null;
  }
}
