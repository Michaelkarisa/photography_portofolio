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
    await loadServiceSelect();
    await loadService();
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

      if (profileName)     profileName.textContent     = profile.name     || 'Photographer';
      if (profileBio)      profileBio.textContent      = profile.bio      || 'Editorial photographer & videographer';
      if (profileLocation) profileLocation.textContent = profile.location || 'Location';

      if (profileSocials) {

        const socials = [
          {
            handle: profile.instagram_handle,
            platform: 'Instagram',
            icon: 'fab fa-instagram'
          },
          {
            handle: profile.linkedin_handle,
            platform: 'LinkedIn',
            icon: 'fab fa-linkedin-in'
          },
          {
            handle: profile.twitter_handle,
            platform: 'Twitter/X',
            icon: 'fab fa-x-twitter'
          },
          {
            handle: profile.facebook_handle,
            platform: 'Facebook',
            icon: 'fab fa-facebook-f'
          },
          {
            handle: profile.portfolio_url,
            platform: 'Portfolio',
            icon: 'fas fa-globe'
          }
        ];

        profileSocials.innerHTML = socials
          .filter(s => s.handle)
          .map(s => {
            let url = s.handle;

            // optional: auto-build URLs if only username stored
            if (s.platform === 'Instagram' && !url.startsWith('http'))
              url = `${s.handle}`;

            if (s.platform === 'Twitter/X' && !url.startsWith('http'))
              url = `${s.handle}`;

            if (s.platform === 'LinkedIn' && !url.startsWith('http'))
              url = `${s.handle}`;

            if (s.platform === 'Facebook' && !url.startsWith('http'))
              url = `${s.handle}`;

            return `
              <a href="${url}" 
                 class="social-link" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 aria-label="${s.platform}">
                <i class="${s.icon}"></i>
              </a>
            `;
          })
          .join('');
      }

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

/* ─────────────────────────────────────────────
   HERO IMAGE SLIDESHOW
   Picks the first image per category and cycles
   every 5 seconds with a crossfade transition.
───────────────────────────────────────────── */
let _heroSlideTimer = null;

function startHeroSlideshow(items) {
  const heroImage = document.getElementById('heroImage');
  if (!heroImage || !items || items.length === 0) return;

  const seen = new Set();
  const slides = [];

  items.forEach(item => {
    if (!item.url) return;

    // Check if media is an image
    const isImage =
      item.media_type === 'image' ||
      /\.(jpg|jpeg|png|webp|gif)$/i.test(item.url);

    if (!isImage) return;

    if (!seen.has(item.category)) {
      seen.add(item.category);
      slides.push(item.url);
    }
  });

  if (slides.length === 0) return;

  heroImage.src = slides[0];
  heroImage.style.opacity = '1';

  let index = 0;

  if (_heroSlideTimer) clearInterval(_heroSlideTimer);

  _heroSlideTimer = setInterval(() => {
    index = (index + 1) % slides.length;

    heroImage.style.transition = 'opacity 0.7s ease';
    heroImage.style.opacity = '0';

    setTimeout(() => {
      heroImage.src = slides[index];
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

  galleryGrid.innerHTML = items.map((item, index) => {
    const categoryLabel =
      item.category.charAt(0).toUpperCase() + item.category.slice(1);

    const isVideo =
      item.media_type === 'video' ||
      /\.(mp4|webm|ogg)$/i.test(item.url);

    return `
      <div class="gallery__item" data-category="${item.category}">
        <figure class="gallery__media-wrap" data-index="${index}">
          ${
            isVideo
              ? `
                <video
                  class="gallery__media gallery__video"
                  src="${item.url}"
                  muted
                  playsinline
                  preload="metadata"
                  style="width: 100%; height: 100%; object-fit: cover;"
                ></video>
              `
              : `
                <img
                  class="gallery__media"
                  src="${item.url}"
                  alt="${item.caption || categoryLabel}"
                  loading="lazy"
                  style="width: 100%; height: 100%; object-fit: cover;"
                />
              `
          }
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

  document.querySelectorAll('.gallery__media-wrap').forEach(wrap => {
    const video = wrap.querySelector('video');
    const index = Number(wrap.dataset.index);
    const item = items[index];

    if (video) {
      wrap.addEventListener('mouseenter', () => {
        video.play().catch(() => {});
      });

      wrap.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
      });

      wrap.addEventListener('focusin', () => {
        video.play().catch(() => {});
      });

      wrap.addEventListener('focusout', () => {
        video.pause();
        video.currentTime = 0;
      });
    }

    wrap.addEventListener('click', () => {
      openGalleryModal(item);
    });
  });
}

function openGalleryModal(item) {
  let modal = document.getElementById('galleryModal');

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'galleryModal';
    modal.className = 'gallery-modal';
    modal.innerHTML = `
      <div class="gallery-modal__backdrop"></div>
      <div class="gallery-modal__content">
        <button class="gallery-modal__close" aria-label="Close modal">&times;</button>
        <div class="gallery-modal__body"></div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.gallery-modal__close').addEventListener('click', closeGalleryModal);
    modal.querySelector('.gallery-modal__backdrop').addEventListener('click', closeGalleryModal);
  }

  const body = modal.querySelector('.gallery-modal__body');
  const isVideo =
    item.media_type === 'video' ||
    /\.(mp4|webm|ogg)$/i.test(item.url);

  body.innerHTML = isVideo
    ? `
      <video
        src="${item.url}"
        controls
        autoplay
        playsinline
        style="width: 500px; height: 500px; object-fit: cover;"
      ></video>
    `
    : `
      <img
        src="${item.url}"
        alt="${item.caption || 'Gallery media'}"
        style="width: 500px; height: 500px; object-fit: cover;"
      />
    `;

  modal.classList.add('is-open');
}

function closeGalleryModal() {
  const modal = document.getElementById('galleryModal');
  if (!modal) return;

  const video = modal.querySelector('video');
  if (video) {
    video.pause();
  }

  modal.classList.remove('is-open');
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

async function loadService() {
  try {
    const services = await window.fetchServices();
    console.log('[v0] Loaded services:', services);

    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) {
      console.error('[v0] servicesGrid not found');
      return;
    }

    servicesGrid.style.display = 'grid';
    servicesGrid.style.opacity = '1';
    servicesGrid.style.visibility = 'visible';

    if (!Array.isArray(services) || services.length === 0) {
      servicesGrid.innerHTML = `
        <div class="service-card">
          <h3>No services yet</h3>
          <p>Services will appear here once added.</p>
        </div>
      `;
      return;
    }

    const sorted = [...services]
      .filter(service => service.is_active !== false)
      .sort((a, b) => (b.sort_order ?? 0)-(a.sort_order ?? 0));

    const safe = (value) => String(value ?? '');

    servicesGrid.innerHTML = sorted.map((service) => {
  const isFeatured = service.is_featured ? 'service-card--featured' : '';
  const price = service.base_price
    ? `KES ${Number(service.base_price).toLocaleString()}`
    : 'Custom Quote';

  const items = Array.isArray(service.items_offered) && service.items_offered.length > 0
    ? service.items_offered.map(item => `<li>${safe(item)}</li>`).join('')
    : `<li>${safe(service.description || 'Professional photography service')}</li>`;

  return `
    <article class="service-card ${isFeatured}">
      <div class="service-card__type">${safe(service.category || 'Photography')}</div>
      <h3>${safe(service.name || 'Untitled Service')}</h3>

      <div class="service-card__price">
        ${price}
        <span>${service.duration_hours ? ` / ${service.duration_hours} hr` : ''}</span>
      </div>

      <hr>

      <ul>
        ${items}
      </ul>

      ${
        service.turnaround
          ? `<div class="service-card__turnaround">Turnaround: ${safe(service.turnaround)}</div>`
          : ''
      }

      <a href="#contact" class="link-ember">Book this session</a>
    </article>
  `;
}).join('');

    servicesGrid.closest('.reveal')?.classList.add('visible');

    console.log('[v0] Services rendered successfully');
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

    console.log('[v0] Loaded collections:', cols);

    if (!Array.isArray(cols) || cols.length === 0) {
      console.log('[v0] No collections found');
      return;
    }

    const container = document.getElementById('collectionsContainer');

    if (!container) {
      console.error('[v0] collectionsContainer not found in DOM');
      return;
    }

    const safeEsc = typeof escFront === 'function'
      ? escFront
      : (value) => String(value ?? '');

    const sortedCols = [...cols].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );

    container.innerHTML = sortedCols.map((c, idx) => {
      const reversed = idx % 2 !== 0 ? 'featured__block--reverse' : '';

      return `
        <div class="featured__block ${reversed} reveal" style="margin-top: var(--sp-8);">
          <div class="featured__img">
            ${
              c.image_url
                ? `<img src="${safeEsc(c.image_url)}" alt="${safeEsc(c.title)}" />`
                : `<div style="width:100%;height:100%;background:var(--grey-100);display:flex;align-items:center;justify-content:center;color:var(--grey-400);">No image</div>`
            }
          </div>

          <div class="featured__text">
            <span class="section-label">${safeEsc(c.series_label || 'Series')}</span>
            <h3 class="section-title">${safeEsc(c.title || 'Untitled')}</h3>
            ${c.description ? `<p>${safeEsc(c.description)}</p>` : ''}
            ${c.tagline ? `<p>${safeEsc(c.tagline)}</p>` : ''}
            <a href="${safeEsc(c.link_url || '#contact')}" class="link-ember">
              ${safeEsc(c.link_label || 'See full series')}
            </a>
          </div>
        </div>
      `;
    }).join('');

    const blocks = container.querySelectorAll('.featured__block.reveal');

    blocks.forEach((el) => {
      if (window.observer) {
        window.observer.observe(el);
      } else {
        el.classList.add('visible');
      }
    });

    console.log('[v0] Collections rendered successfully');
  } catch (err) {
    console.error('[v0] loadCollections error:', err);
  }
}

/* ══════════════════════════════════════════
   ABOUT — render from Supabase profile
══════════════════════════════════════════ */
async function loadAboutSection(profile) {
  if (!profile) return;

  // ── Hero profile card avatar ──
  const avatarEl = document.getElementById('profileAvatar');
  if (avatarEl) {
    if (profile.avatar_url) {
      avatarEl.style.backgroundImage = `url('${profile.avatar_url}')`;
      avatarEl.style.backgroundSize = 'cover';
      avatarEl.style.backgroundPosition = 'center';
      avatarEl.textContent = '';
    } else if (profile.name) {
      avatarEl.textContent = profile.name.charAt(0).toUpperCase();
    }
  }

  // ── About section portrait image ──
  const aboutPortraitImg = document.querySelector('.about__portrait-img img');
  if (aboutPortraitImg && profile.avatar_url) {
    aboutPortraitImg.src = profile.avatar_url;
    aboutPortraitImg.alt = profile.name || 'Photographer';
  }

  // ── About portrait signature ──
  const aboutSigName = document.querySelector('.about__portrait-sig strong');
  if (aboutSigName && profile.name) aboutSigName.textContent = profile.name;

  // ── About headline ──
  const aboutTitle = document.querySelector('.about__content .section-title');
  if (aboutTitle && profile.about_title) {
    aboutTitle.innerHTML = profile.about_title.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
  }

  // ── About body paragraphs ──
  if (profile.about_body) {
    const paragraphs = profile.about_body.split('\n\n').filter(Boolean);
    const contentDiv = document.querySelector('.about__content');
    if (contentDiv) {
      contentDiv.querySelectorAll('.about-body-p').forEach(el => el.remove());
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

  // ── Artistic philosophy ──
  if (profile.philosophy) {
    const philoEl = document.getElementById('aboutPhilosophy');
    if (philoEl) philoEl.innerHTML = `<strong>Artistic philosophy:</strong> ${escFront(profile.philosophy)}`;
  }

  // ── Skills tags ──
  if (profile.skills && profile.skills.length > 0) {
    const skillsEl = document.querySelector('.about__skills');
    if (skillsEl) {
      skillsEl.innerHTML = profile.skills.map(sk => `<span class="skill-tag">${escFront(sk)}</span>`).join('');
    }
  }

  // ── Clients note ──
  if (profile.clients_note) {
    const clientsEl = document.getElementById('aboutClientsNote');
    if (clientsEl) clientsEl.innerHTML = `<strong>Clients include:</strong> ${escFront(profile.clients_note)}`;
  }

  // ── Contact section ──
  loadContactDetails(profile);
}

/* ══════════════════════════════════════════
   CONTACT — populate "Get in Touch" from DB
══════════════════════════════════════════ */
function loadContactDetails(profile) {
  // Email
  const emailWrap = document.getElementById('contactDetailEmail');
  const emailVal  = document.getElementById('contactEmail');
  if (emailWrap && emailVal) {
    if (profile.email) {
      emailVal.textContent    = profile.email;
      emailWrap.style.display = '';
    } else {
      emailWrap.style.display = 'none';
    }
  }

  // Phone
  const phoneWrap = document.getElementById('contactDetailPhone');
  const phoneVal  = document.getElementById('contactPhone');
  if (phoneWrap && phoneVal) {
    if (profile.phone) {
      phoneVal.textContent    = profile.phone;
      phoneWrap.style.display = '';
    } else {
      phoneWrap.style.display = 'none';
    }
  }

  // Location
  const locWrap = document.getElementById('contactDetailLocation');
  const locVal  = document.getElementById('contactLocation');
  if (locWrap && locVal) {
    if (profile.location) {
      locVal.textContent    = profile.location;
      locWrap.style.display = '';
    } else {
      locWrap.style.display = 'none';
    }
  }

  // Social links
  const socialLinksEl = document.getElementById('contactSocialLinks');
  if (socialLinksEl) {
    const links = [];
    const mkLink = (handle, baseUrl, icon, label) => {
      if (!handle) return;
      const href = handle.startsWith('http') ? handle : `${baseUrl}${handle.replace('@', '')}`;
      links.push(`<a href="${href}" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="${label}"><i class="${icon}"></i></a>`);
    };
    mkLink(profile.instagram_handle, '',  'fab fa-instagram',  'Instagram');
    mkLink(profile.linkedin_handle,  '','fab fa-linkedin-in', 'LinkedIn');
    mkLink(profile.twitter_handle,   '',    'fab fa-x-twitter',  'Twitter/X');
    mkLink(profile.facebook_handle,  '',   'fab fa-facebook-f', 'Facebook');
    socialLinksEl.innerHTML = links.length
      ? links.join('')
      : '<span style="color:var(--grey-400);font-size:0.85rem;">No social links added yet.</span>';
  }
}

document.addEventListener('click', e => {

  if (!e.target.matches('.link-ember')) return;

  const card = e.target.closest('.service-card');
  if (!card) return;

  const serviceName = card.querySelector('h3')?.textContent;

  const select = document.getElementById('service');

  if (select && serviceName) {
    select.value = serviceName;
  }

});

async function loadServiceSelect() {
  try {
    const services = await window.fetchServices();
    const select = document.getElementById('service');

    if (!select) return;

    select.innerHTML = '<option value="">Select a service...</option>';

    if (services && services.length > 0) {
      services.forEach(s => {
        const opt = document.createElement('option');

        opt.value = s.name;
        opt.textContent = s.name + (s.base_price ? ` — KES ${Number(s.base_price).toLocaleString()}` : '');

        select.appendChild(opt);
      });
    }

    // Always keep a catch-all option
    const other = document.createElement('option');
    other.value = 'other';
    other.textContent = 'Other / Custom';
    select.appendChild(other);

  } catch (err) {
    console.error('[v0] loadServiceSelect:', err);
  }
}

function escFront(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

window.loadServices      = loadServices;
window.loadCollections   = loadCollections;
window.loadAboutSection  = loadAboutSection;
window.loadContactDetails = loadContactDetails;
window.loadServiceSelect  = loadServiceSelect;
