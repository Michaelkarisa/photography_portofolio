/**
 * Cloudinary Upload Utility
 * Handles unsigned image uploads to Cloudinary and returns URLs
 */

const CLOUDINARY_CLOUD_NAME = 'dtwfhkkhm';
const CLOUDINARY_UPLOAD_PRESET = 'aovvovqk'; // You need to set this in Cloudinary dashboard

/**
 * Upload file (image or video) to Cloudinary using unsigned upload
 * @param {File} file - Image or video file to upload
 * @param {string} folder - Cloudinary folder path (optional)
 * @returns {Promise<Object>} - Object with url, public_id, resource_type, and metadata
 */
async function uploadToCloudinary(file, folder = 'inferno_pictures') {
  try {
    // Determine resource type based on file
    const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);
    formData.append('resource_type', resourceType);

    // Use appropriate upload endpoint
    const endpoint = resourceType === 'video' ? 'video' : 'image';
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${endpoint}/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      url: data.secure_url,
      public_id: data.public_id,
      resource_type: resourceType,
      width: data.width,
      height: data.height,
      duration: data.duration, // For videos
      bytes: data.bytes
    };
  } catch (err) {
    console.error('[v0] Cloudinary upload error:', err);
    throw err;
  }
}

/**
 * Delete image from Cloudinary
 * NOTE: This requires authenticated requests with API key
 * For now, deletion should be done from admin panel with backend verification
 */
async function deleteFromCloudinary(publicId) {
  // This would require a backend endpoint that authenticates with Cloudinary API
  // For security, never expose API secret in client-side code
  console.log('[v0] To delete from Cloudinary, use the admin backend endpoint');
  return false;
}

/**
 * Get optimized image URL from Cloudinary with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} - Optimized image URL
 */
function getOptimizedImageUrl(publicId, options = {}) {
  const {
    width = 800,
    height = null,
    quality = 'auto',
    format = 'auto',
    crop = 'fill'
  } = options;

  let transformations = `w_${width}`;
  if (height) transformations += `,h_${height}`;
  transformations += `,q_${quality},f_${format},c_${crop}`;

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
}

/**
 * Validate image or video file
 * @param {File} file - File to validate
 * @returns {Object} - { valid: boolean, error: string, type: 'image' | 'video' }
 */
function validateImageFile(file) {
  const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB
  const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];

  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return { valid: false, error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF, MP4, WebM, QuickTime' };
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    const maxSizeMB = isVideo ? 500 : 50;
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }

  return { valid: true, error: null, type: isVideo ? 'video' : 'image' };
}

/* Make functions globally accessible */
window.uploadToCloudinary = uploadToCloudinary;
window.validateImageFile = validateImageFile;
