/**
 * Supabase Client Configuration
 * Initializes Supabase client for data fetching
 */

// Supabase Configuration
const SUPABASE_URL = 'https://pkeqoyqojprzakncxlyv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2wANbLcu4dQeDIKhcdPgeA_FVDa1Bgs';

// Initialize Supabase Client (store in window to make it global)
// Use a property name that doesn't clash with the window.supabase CDN object
if (!window.supabaseClient) {
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Alias for use within this file
const _db = window.supabaseClient;

/**
 * Fetch photographer profile from users table
 */
async function fetchPhotographerProfile() {
  try {
    const { data, error } = await _db
      .from('users')
      .select('*')
      .limit(1)
      .maybeSingle();

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
 * Update logo URL in users table
 */
async function updateLogoUrl(logoUrl) {
  try {
    const { data: existing } = await _db
      .from('users')
      .select('id')
      .limit(1)
      .single();

    let result;
    if (existing) {
      // Update existing
      result = await _db
        .from('users')
        .update({ logo_url: logoUrl })
        .eq('id', existing.id)
        .select();
    } else {
      // Create new user record with logo
      result = await _db
        .from('users')
        .insert([{ logo_url: logoUrl }])
        .select();
    }

    if (result.error) {
      console.error('[v0] Error updating logo:', result.error);
      return null;
    }

    return result.data?.[0] || null;
  } catch (err) {
    console.error('[v0] Exception updating logo:', err);
    return null;
  }
}

/**
 * Fetch all media items from media table
 */
async function fetchAllMedia() {
  try {
    const { data, error } = await _db
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
    const { data, error } = await _db
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
async function createMediaItem(url, cloudinaryPublicId, category, caption, mediaType = 'image') {
  try {
    const { data, error } = await _db
      .from('media')
      .insert([
        {
          url,
          cloudinary_public_id: cloudinaryPublicId,
          media_type: mediaType,
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
    const { data, error } = await _db
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
    const { error } = await _db
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
    const { data: existing } = await _db
      .from('users')
      .select('id')
      .limit(1)
      .single();

    let result;
    if (existing) {
      // Update existing
      result = await _db
        .from('users')
        .update(profileData)
        .eq('id', existing.id)
        .select();
    } else {
      // Create new
      result = await _db
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

/**
 * Fetch all services
 */
async function fetchServices() {
  try {
    const { data, error } = await _db
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('[v0] Error fetching services:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[v0] Exception fetching services:', err);
    return [];
  }
}

/**
 * Create new service (admin only)
 */
async function createService(serviceData) {
  try {
    const { data, error } = await _db
      .from('services')
      .insert([serviceData])
      .select();

    if (error) {
      console.error('[v0] Error creating service:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (err) {
    console.error('[v0] Exception creating service:', err);
    return null;
  }
}

/**
 * Update service
 */
async function updateService(id, updates) {
  try {
    const { data, error } = await _db
      .from('services')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('[v0] Error updating service:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (err) {
    console.error('[v0] Exception updating service:', err);
    return null;
  }
}

/**
 * Delete service
 */
async function deleteService(id) {
  try {
    const { error } = await _db
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[v0] Error deleting service:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[v0] Exception deleting service:', err);
    return false;
  }
}

/**
 * Submit contact form message
 */
async function submitMessage(messageData) {
  try {
    const { data, error } = await _db
      .from('messages')
      .insert([messageData])
      .select();

    if (error) {
      console.error('[v0] Error submitting message:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (err) {
    console.error('[v0] Exception submitting message:', err);
    return null;
  }
}

/**
 * Fetch all messages (admin only)
 */
async function fetchMessages() {
  try {
    const { data, error } = await _db
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[v0] Error fetching messages:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[v0] Exception fetching messages:', err);
    return [];
  }
}

/**
 * Mark message as read
 */
async function markMessageAsRead(id) {
  try {
    const { data, error } = await _db
      .from('messages')
      .update({ is_read: true })
      .eq('id', id)
      .select();

    if (error) {
      console.error('[v0] Error marking message as read:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (err) {
    console.error('[v0] Exception marking message as read:', err);
    return null;
  }
}

/**
 * Delete message
 */
async function deleteMessage(id) {
  try {
    const { error } = await _db
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[v0] Error deleting message:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[v0] Exception deleting message:', err);
    return false;
  }
}

/**
 * Fetch testimonials
 */
async function fetchTestimonials() {
  try {
    const { data, error } = await _db
      .from('testimonials')
      .select('*')
      .eq('is_approved', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[v0] Error fetching testimonials:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[v0] Exception fetching testimonials:', err);
    return [];
  }
}

/**
 * Create testimonial
 */
async function createTestimonial(testimonialData) {
  try {
    const { data, error } = await _db
      .from('testimonials')
      .insert([testimonialData])
      .select();

    if (error) {
      console.error('[v0] Error creating testimonial:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (err) {
    console.error('[v0] Exception creating testimonial:', err);
    return null;
  }
}

/**
 * Update testimonial
 */
async function updateTestimonial(id, updates) {
  try {
    const { data, error } = await _db
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('[v0] Error updating testimonial:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (err) {
    console.error('[v0] Exception updating testimonial:', err);
    return null;
  }
}

/**
 * Create booking
 */
async function createBooking(bookingData) {
  try {
    const { data, error } = await _db
      .from('bookings')
      .insert([bookingData])
      .select();

    if (error) {
      console.error('[v0] Error creating booking:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (err) {
    console.error('[v0] Exception creating booking:', err);
    return null;
  }
}

/**
 * Fetch all bookings (admin only)
 */
async function fetchBookings() {
  try {
    const { data, error } = await _db
      .from('bookings')
      .select('*, services(name, base_price)')
      .order('event_date', { ascending: true });

    if (error) {
      console.error('[v0] Error fetching bookings:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[v0] Exception fetching bookings:', err);
    return [];
  }
}

/**
 * Update booking status
 */
async function updateBookingStatus(id, status) {
  try {
    const { data, error } = await _db
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      console.error('[v0] Error updating booking status:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (err) {
    console.error('[v0] Exception updating booking status:', err);
    return null;
  }
}

/* ══════════════════════════════════════════
   MAKE FUNCTIONS GLOBALLY ACCESSIBLE
══════════════════════════════════════════ */
// window.supabaseClient is already set above via createClient
window.fetchPhotographerProfile = fetchPhotographerProfile;
window.updateLogoUrl = updateLogoUrl;
window.savePhotographerProfile = savePhotographerProfile;
window.fetchServices = fetchServices;
window.createService = createService;
window.updateService = updateService;
window.deleteService = deleteService;
window.fetchAllMedia = fetchAllMedia;
window.createMediaItem = createMediaItem;
window.deleteMediaItem = deleteMediaItem;
window.submitMessage = submitMessage;
window.fetchMessages = fetchMessages;
window.markMessageAsRead = markMessageAsRead;
window.deleteMessage = deleteMessage;
window.fetchTestimonials = fetchTestimonials;
window.createTestimonial = createTestimonial;
window.updateTestimonial = updateTestimonial;
window.createBooking = createBooking;
window.fetchBookings = fetchBookings;
window.updateBookingStatus = updateBookingStatus;

/* ══════════════════════════════════════════
   COLLECTIONS — Curated Series
══════════════════════════════════════════ */
async function fetchCollections() {
  try {
    const { data, error } = await _db
      .from('collections')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) { console.error('[v0] fetchCollections:', error); return []; }
    return data || [];
  } catch (err) { console.error('[v0] fetchCollections exception:', err); return []; }
}

async function fetchAllCollections() {
  try {
    const { data, error } = await _db
      .from('collections')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) { console.error('[v0] fetchAllCollections:', error); return []; }
    return data || [];
  } catch (err) { console.error('[v0] fetchAllCollections exception:', err); return []; }
}

async function createCollection(payload) {
  try {
    const { data, error } = await _db.from('collections').insert([payload]).select();
    if (error) { console.error('[v0] createCollection:', error); return null; }
    return data?.[0] || null;
  } catch (err) { console.error('[v0] createCollection exception:', err); return null; }
}

async function updateCollection(id, updates) {
  try {
    const { data, error } = await _db.from('collections').update(updates).eq('id', id).select();
    if (error) { console.error('[v0] updateCollection:', error); return null; }
    return data?.[0] || null;
  } catch (err) { console.error('[v0] updateCollection exception:', err); return null; }
}

async function deleteCollection(id) {
  try {
    const { error } = await _db.from('collections').delete().eq('id', id);
    if (error) { console.error('[v0] deleteCollection:', error); return false; }
    return true;
  } catch (err) { console.error('[v0] deleteCollection exception:', err); return false; }
}

/* ══════════════════════════════════════════
   AVATAR — Profile avatar upload
══════════════════════════════════════════ */
async function updateAvatarUrl(avatarUrl) {
  try {
    const { data: existing } = await _db.from('users').select('id').limit(1).single();
    let result;
    if (existing) {
      result = await _db.from('users').update({ avatar_url: avatarUrl }).eq('id', existing.id).select();
    } else {
      result = await _db.from('users').insert([{ avatar_url: avatarUrl }]).select();
    }
    if (result.error) { console.error('[v0] updateAvatarUrl:', result.error); return null; }
    return result.data?.[0] || null;
  } catch (err) { console.error('[v0] updateAvatarUrl exception:', err); return null; }
}

/* ══════════════════════════════════════════
   SERVICES — fetch all (including inactive for admin)
══════════════════════════════════════════ */
async function fetchAllServices() {
  try {
    const { data, error } = await _db
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });
    if (error) { console.error('[v0] fetchAllServices:', error); return []; }
    return data || [];
  } catch (err) { console.error('[v0] fetchAllServices exception:', err); return []; }
}

/* Re-export deletions for testimonials */
async function deleteTestimonial(id) {
  try {
    const { error } = await _db.from('testimonials').delete().eq('id', id);
    if (error) { console.error('[v0] deleteTestimonial:', error); return false; }
    return true;
  } catch (err) { console.error('[v0] deleteTestimonial exception:', err); return false; }
}

window.fetchCollections      = fetchCollections;
window.fetchAllCollections   = fetchAllCollections;
window.createCollection      = createCollection;
window.updateCollection      = updateCollection;
window.deleteCollection      = deleteCollection;
window.updateAvatarUrl       = updateAvatarUrl;
window.fetchAllServices      = fetchAllServices;
window.deleteTestimonial     = deleteTestimonial;
