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
    await loadLogo();
    const profile = await window.fetchPhotographerProfile();
    await loadPhotographerProfile();
    await loadAboutSection(profile);
    await loadGallery();
    await loadServices();
    await loadCollections();
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
      const profileName     = document.getElementById('profileName');
      const profileBio      = document.getElementById('profileBio');
      const profileSocials  = document.getElementById('profileSocials');
      const profileLocation = document.getElementById('profileLocation');

      if (profileName)     profileName.textContent     = profile.name || 'Photographer';
      if (profileBio)      profileBio.textContent      = profile.bio || 'Editorial photographer & videographer';
      if (profileLocation) profileLocation.textContent = profile.location || 'Location';

      if (profileSocials) {

        const socials = [
          { url: profile.instagram_handle, icon: 'fab fa-instagram', label: 'Instagram' },
          { url: profile.linkedin_handle,  icon: 'fab fa-linkedin-in', label: 'LinkedIn' },
          { url: profile.twitter_handle,   icon: 'fab fa-x-twitter', label: 'Twitter/X' },
          { url: profile.facebook_handle,  icon: 'fab fa-facebook-f', label: 'Facebook' },
          { url: profile.portfolio_url,    icon: 'fas fa-globe', label: 'Portfolio' }
        ];

        profileSocials.innerHTML = socials
          .filter(s => s.url)
          .map(s => `
            <a href="${s.url}" 
               class="social-link"
               target="_blank"
               rel="noopener noreferrer"
               aria-label="${s.label}">
              <i class="${s.icon}"></i>
            </a>
          `)
          .join('');
      }

      const heroBadge = document.getElementById('heroBadge');
      if (heroBadge && profile.services_offered?.length) {
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

/* ─────────────────────────────────────────────
   HERO IMAGE SLIDESHOW
   Picks the first image per category and cycles
   every 5 seconds with a crossfade transition.
───────────────────────────────────────────── */
let _heroSlideTimer = null;

function startHeroSlideshow(items) {
  const heroImage = document.getElementById('heroImage');
  if (!heroImage || !items || items.length === 0) return;

  // Collect the first image URL for each unique category
  const seen   = new Set();
  const slides = [];
  items.forEach(item => {
    if (!seen.has(item.category) && item.url) {
      seen.add(item.category);
      slides.push(item.url);
    }
  });

  if (slides.length === 0) return;

  // Display first slide immediately
  heroImage.src = slides[0];
  heroImage.style.opacity = '1';

  let index = 0;

  // Clear any previously running timer
  if (_heroSlideTimer) clearInterval(_heroSlideTimer);

  _heroSlideTimer = setInterval(() => {
    index = (index + 1) % slides.length;

    // Fade out
    heroImage.style.transition = 'opacity 0.7s ease';
    heroImage.style.opacity    = '0';

    setTimeout(() => {
      heroImage.src = slides[index];
      // Fade in after src swap
      heroImage.style.opacity = '1';
    }, 700);
  }, 5000);
}

/**
 * Load gallery images from Supabase
 */
async function loadGallery() {
  try {
    const mediaItems = await window.fetchAllMedia();
    allGalleryData = mediaItems;
    
    console.log('[v0] Loaded', mediaItems.length, 'media items from Supabase');
    
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
    
    // Start hero slideshow with loaded data
    startHeroSlideshow(mediaItems);

    // Render gallery grid
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
      filterButtons.forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
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
    const category   = item.dataset.category;
    const shouldShow = currentFilter === 'all' || category === currentFilter;
    item.style.display = shouldShow ? '' : 'none';
  });
}

/**
 * Format Cloudinary URL with transformations
 */
function getOptimizedCloudinaryUrl(url, options = {}) {
  const { width = 600, height = 600, quality = 'auto', format = 'auto' } = options;
  if (url && url.includes('cloudinary.com')) return url;
  return url;
}

// Expose globals
window.loadLogo                  = loadLogo;
window.loadPhotographerProfile   = loadPhotographerProfile;
window.loadGallery               = loadGallery;
window.renderGallery             = renderGallery;
window.setupGalleryFilters       = setupGalleryFilters;
window.applyFilter               = applyFilter;
window.startHeroSlideshow        = startHeroSlideshow;
window.allGalleryData            = allGalleryData;
/* ══════════════════════════════════════════
   SERVICES — render from Supabase
══════════════════════════════════════════ */
async function loadServices() {
  try {
    const services = await window.fetchServices();
    if (!services || services.length === 0) return;

    const grid = document.getElementById('servicesGrid');
    if (!grid) return;

    grid.innerHTML = services.map((s, idx) => {
      const isFeatured = s.is_featured;
      const items = Array.isArray(s.items_offered) ? s.items_offered : [];
      const price = s.base_price ? `KES ${Number(s.base_price).toLocaleString()}` : '';
      return `
        <div class="service-card ${isFeatured ? 'service-card--featured' : ''} reveal">
          <p class="service-card__type">${escFront(s.category || '')}</p>
          <h3>${escFront(s.name)}</h3>
          <p style="font-size:0.9rem;color:var(--grey-400);">${escFront(s.description || '')}</p>
          <div class="service-card__price">${price} <span>starting</span></div>
          <hr />
          <ul>${items.map(it => `<li>${escFront(it)}</li>`).join('')}</ul>
          ${s.turnaround ? `<p class="service-card__turnaround">⏱ ${escFront(s.turnaround)}</p>` : ''}
          <a href="#contact" class="link-ember">Book this session</a>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.service-card.reveal').forEach(el => {
      if (window.observer) window.observer.observe(el);
    });
  } catch (err) {
    console.error('[v0] loadServices:', err);
  }
}

/* ══════════════════════════════════════════
   COLLECTIONS — render from Supabase
══════════════════════════════════════════ */
async function loadCollections() {
  try {
    const cols = await window.fetchCollections();
    if (!cols || cols.length === 0) return;

    const container = document.getElementById('collectionsContainer');
    if (!container) return;

    container.innerHTML = cols.map((c, idx) => {
      const reversed = idx % 2 !== 0 ? 'featured__block--reverse' : '';
      return `
        <div class="featured__block ${reversed} reveal" style="margin-top: var(--sp-8);">
          <div class="featured__img">
            ${c.image_url
              ? `<img src="${escFront(c.image_url)}" alt="${escFront(c.title)}" />`
              : `<div style="width:100%;height:100%;background:var(--grey-100);display:flex;align-items:center;justify-content:center;color:var(--grey-400);">No image</div>`}
          </div>
          <div class="featured__text">
            <span class="section-label">${escFront(c.series_label || 'Series')}</span>
            <h3 class="section-title">${escFront(c.title)}</h3>
            ${c.description ? `<p>${escFront(c.description)}</p>` : ''}
            ${c.tagline ? `<p>${escFront(c.tagline)}</p>` : ''}
            <a href="${escFront(c.link_url || '#contact')}" class="link-ember">${escFront(c.link_label || 'See full series')}</a>
          </div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.featured__block.reveal').forEach(el => {
      if (window.observer) window.observer.observe(el);
    });
  } catch (err) {
    console.error('[v0] loadCollections:', err);
  }
}

/* ══════════════════════════════════════════
   ABOUT — render from Supabase profile
══════════════════════════════════════════ */
async function loadAboutSection(profile) {
  if (!profile) return;

  // Avatar in hero profile card
  const avatarEl = document.getElementById('profileAvatar');
  if (avatarEl) {
    if (profile.avatar_url) {
      avatarEl.style.backgroundImage = `url('${profile.avatar_url}')`;
      avatarEl.style.backgroundSize = 'cover';
      avatarEl.style.backgroundPosition = 'center';
    } else if (profile.name) {
      avatarEl.textContent = profile.name.charAt(0).toUpperCase();
    }
  }

  // About portrait in about section
  const aboutPortraitImg = document.querySelector('.about__portrait-img img');
  if (aboutPortraitImg && profile.avatar_url) {
    aboutPortraitImg.src = profile.avatar_url;
    aboutPortraitImg.alt = profile.name || 'Photographer';
  }

  const aboutSigName = document.querySelector('.about__portrait-sig strong');
  if (aboutSigName && profile.name) aboutSigName.textContent = profile.name;

  const aboutTitle = document.querySelector('.about__content .section-title');
  if (aboutTitle && profile.about_title) aboutTitle.innerHTML = profile.about_title.replace(/\n/g, '<br>');

  const aboutBodies = document.querySelectorAll('.about__content .about-body-p');
  if (profile.about_body) {
    const paragraphs = profile.about_body.split('\n\n').filter(Boolean);
    // Inject dynamically
    const contentDiv = document.querySelector('.about__content');
    if (contentDiv) {
      const existingBodies = contentDiv.querySelectorAll('.about-body-p');
      existingBodies.forEach(el => el.remove());
      const skillsDiv = contentDiv.querySelector('.about__skills');
      paragraphs.forEach(para => {
        const p = document.createElement('p');
        p.className = 'about-body-p';
        p.textContent = para;
        if (skillsDiv) contentDiv.insertBefore(p, skillsDiv);
        else contentDiv.appendChild(p);
      });
    }
  }

  if (profile.philosophy) {
    const philoEl = document.getElementById('aboutPhilosophy');
    if (philoEl) philoEl.innerHTML = `<strong>Artistic philosophy:</strong> ${escFront(profile.philosophy)}`;
  }

  if (profile.skills && profile.skills.length > 0) {
    const skillsEl = document.querySelector('.about__skills');
    if (skillsEl) {
      skillsEl.innerHTML = profile.skills.map(sk => `<span class="skill-tag">${escFront(sk)}</span>`).join('');
    }
  }

  if (profile.clients_note) {
    const clientsEl = document.getElementById('aboutClientsNote');
    if (clientsEl) clientsEl.innerHTML = `<strong>Clients include:</strong> ${escFront(profile.clients_note)}`;
  }

  // Contact info from profile
  if (profile.email) {
    const emailEl = document.querySelector('.contact__detail--email strong');
    if (emailEl) emailEl.textContent = profile.email;
  }
  if (profile.phone) {
    const phoneEl = document.querySelector('.contact__detail--phone strong');
    if (phoneEl) phoneEl.textContent = profile.phone;
  }
  if (profile.location) {
    const locEl = document.querySelector('.contact__detail--location strong');
    if (locEl) locEl.textContent = profile.location;
  }

  // Social links with Font Awesome icons
  if (profile.instagram_handle || profile.twitter_handle || profile.linkedin_handle || profile.facebook_handle) {
    const socialLinksEl = document.querySelector('.contact__socials .social-links');
    if (socialLinksEl) {
      const links = [];
      if (profile.instagram_handle) links.push(`<a href="${profile.instagram_handle.replace('@','')}" target="_blank" class="social-link" aria-label="Instagram"><i class="fab fa-instagram"></i></a>`);
      if (profile.linkedin_handle)  links.push(`<a href="${profile.linkedin_handle}" target="_blank" class="social-link" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>`);
      if (profile.twitter_handle)   links.push(`<a href="${profile.twitter_handle.replace('@','')}" target="_blank" class="social-link" aria-label="Twitter/X"><i class="fab fa-x-twitter"></i></a>`);
      if (profile.facebook_handle)  links.push(`<a href="${profile.facebook_handle}" target="_blank" class="social-link" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>`);
      socialLinksEl.innerHTML = links.join('');
    }
  }
}

function escFront(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

window.loadServices    = loadServices;
window.loadCollections = loadCollections;
window.loadAboutSection = loadAboutSection;
