/**
 * Supabase Client Configuration
 * Initializes Supabase client for data fetching
 */

// Supabase Configuration
const SUPABASE_URL = 'https://pkeqoyqojprzakncxlyv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2wANbLcu4dQeDIKhcdPgeA_FVDa1Bgs';

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
async function createMediaItem(url, cloudinaryPublicId, category, caption, mediaType = 'image') {
  try {
    const { data, error } = await supabase
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

/**
 * Fetch all services
 */
async function fetchServices() {
  try {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
