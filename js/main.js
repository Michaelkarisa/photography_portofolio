/**
 * Main Frontend Logic
 * Fetches photographer profile and gallery data from Supabase
 * Populates hero section and gallery grid
 */

'use strict';

// Track current filter
let currentFilter = 'all';
let allGalleryData = [];

/**
 * Initialize app on page load
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[v0] Initializing Inferno Pictures...');
  
  try {
    // Load logo
    await loadLogo();
    
    // Fetch and display photographer profile
    await loadPhotographerProfile();
    
    // Fetch and display gallery
    await loadGallery();
    
    // Setup gallery filters
    setupGalleryFilters();
    
  } catch (err) {
    console.error('[v0] Error initializing app:', err);
  }
});

/**
 * Load logo from Supabase
 */
async function loadLogo() {
  try {
    const profile = await window.fetchPhotographerProfile();

    if (profile?.logo_url) {
      // Set as favicon (app icon) instead of navbar
      let favicon = document.querySelector("link[rel='icon']");
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = profile.logo_url;
    }
  } catch (err) {
    console.error('[v0] Error loading logo:', err);
  }
}
/**
 * Load photographer profile from Supabase
 */
async function loadPhotographerProfile() {
  try {
    const profile = await window.fetchPhotographerProfile();
    
    if (profile) {
      // Update hero profile card
      const profileName = document.getElementById('profileName');
      const profileBio = document.getElementById('profileBio');
      const profileSocials = document.getElementById('profileSocials');
      const profileLocation = document.getElementById('profileLocation');
      
      if (profileName) profileName.textContent = profile.name || 'Photographer';
      if (profileBio) profileBio.textContent = profile.bio || 'Editorial photographer & videographer';
      if (profileLocation) profileLocation.textContent = profile.location || 'Location';
      
      // Update social media handles
      if (profileSocials) {
        let socialsHTML = '';
        
        const socials = [
          { handle: profile.instagram_handle, platform: 'Instagram', icon: '📷' },
          { handle: profile.twitter_handle, platform: 'Twitter', icon: '𝕏' },
          { handle: profile.linkedin_handle, platform: 'LinkedIn', icon: '💼' },
          { handle: profile.portfolio_url, platform: 'Portfolio', icon: '🌐' }
        ];
        
        socials.forEach(social => {
          if (social.handle) {
            let url = social.handle;
            
            // Format URLs properly
            if (social.platform === 'Instagram') {
              url = `https://instagram.com/${social.handle}`;
            } else if (social.platform === 'Twitter') {
              url = `https://twitter.com/${social.handle}`;
            } else if (social.platform === 'LinkedIn') {
              url = `https://linkedin.com/in/${social.handle}`;
            }
            
            socialsHTML += `
              <a href="${url}" target="_blank" rel="noopener noreferrer" 
                 class="social-link" title="${social.platform}">
                ${social.icon}
              </a>
            `;
          }
        });
        
        profileSocials.innerHTML = socialsHTML;
      }
      
      // Update hero image if available
      const heroBadge = document.getElementById('heroBadge');
      if (heroBadge && profile.services_offered && profile.services_offered.length > 0) {
        heroBadge.textContent = `Available for: ${profile.services_offered.join(' • ')}`;
      }
      
      console.log('[v0] Photographer profile loaded:', profile.name);
    } else {
      console.log('[v0] No photographer profile found - using defaults');
    }
  } catch (err) {
    console.error('[v0] Error loading photographer profile:', err);
  }
}

/**
 * Load gallery images from Supabase
 */
async function loadGallery() {
  try {
    const mediaItems = await window.fetchAllMedia();
    allGalleryData = mediaItems;
    
    console.log('[v0] Loaded', mediaItems.length, 'media items from Supabase');
    
    // If no data from Supabase, show a message
    if (mediaItems.length === 0) {
      const galleryGrid = document.getElementById('galleryGrid');
      if (galleryGrid) {
        galleryGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #666;">
            <p style="font-size: 16px; margin: 0;">No images available yet.</p>
            <p style="font-size: 14px; margin: 10px 0 0 0; opacity: 0.7;">Check back soon or visit the admin dashboard to upload images.</p>
          </div>
        `;
      }
      return;
    }
    
    // Render gallery
    renderGallery(mediaItems);
  } catch (err) {
    console.error('[v0] Error loading gallery:', err);
  }
}

/**
 * Render gallery grid with media items
 */
function renderGallery(items) {
  const galleryGrid = document.getElementById('galleryGrid');
  if (!galleryGrid) return;
  
  galleryGrid.innerHTML = items.map(item => {
    const categoryLabel = item.category.charAt(0).toUpperCase() + item.category.slice(1);
    
    return `
      <div class="gallery__item" data-category="${item.category}">
        <figure>
          <img 
            src="${item.url}" 
            alt="${item.caption || categoryLabel}"
            loading="lazy"
            style="width: 100%; height: 100%; object-fit: cover;"
          />
          <figcaption class="gallery__overlay">
            <div class="gallery__caption">
              <h4>${item.caption || categoryLabel}</h4>
              <span class="pill">${categoryLabel}</span>
            </div>
          </figcaption>
        </figure>
      </div>
    `;
  }).join('');
  
  // Re-observe new elements for scroll animations
  if (window.observer) {
    document.querySelectorAll('.gallery__item').forEach(el => {
      window.observer.observe(el);
    });
  }
}

/**
 * Setup gallery filter functionality
 */
function setupGalleryFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      // Update active button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      
      // Filter gallery
      currentFilter = e.target.dataset.filter;
      applyFilter();
    });
  });
}

/**
 * Apply filter to gallery
 */
function applyFilter() {
  const galleryItems = document.querySelectorAll('.gallery__item');
  
  galleryItems.forEach(item => {
    const category = item.dataset.category;
    const shouldShow = currentFilter === 'all' || category === currentFilter;
    
    item.style.display = shouldShow ? '' : 'none';
  });
}

/**
 * Format Cloudinary URL with transformations
 */
function getOptimizedCloudinaryUrl(url, options = {}) {
  const {
    width = 600,
    height = 600,
    quality = 'auto',
    format = 'auto'
  } = options;
  
  // If it's already a Cloudinary URL, it's ready to use
  if (url && url.includes('cloudinary.com')) {
    return url;
  }
  
  return url;
}

// Make functions available globally
window.loadLogo = loadLogo;
window.loadPhotographerProfile = loadPhotographerProfile;
window.loadGallery = loadGallery;
window.renderGallery = renderGallery;
window.setupGalleryFilters = setupGalleryFilters;
window.applyFilter = applyFilter;
window.allGalleryData = allGalleryData;
