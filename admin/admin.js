/**
 * INFERNO PHOTOGRAPHY — ADMIN JAVASCRIPT
 * All data reads/writes go to Supabase.
 * localStorage is no longer used for content.
 */

'use strict';

/* ══════════════════════════════════════════
   AUTH CONSTANTS
══════════════════════════════════════════ */
const DEMO_USER = 'admin';
const DEMO_PASS = 'inferno123';
const AUTH_KEY  = 'inferno_admin_auth';

/* ══════════════════════════════════════════
   AUTH — Login
══════════════════════════════════════════ */
function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorEl  = document.getElementById('loginError');

  if (username === DEMO_USER && password === DEMO_PASS) {
    sessionStorage.setItem(AUTH_KEY, 'true');
    sessionStorage.setItem('inferno_admin_user', username);
    window.location.href = 'dashboard.html';
  } else {
    errorEl.classList.add('show');
    document.getElementById('password').value = '';
    document.getElementById('password').focus();
  }
}

/* ══════════════════════════════════════════
   AUTH — Guard
══════════════════════════════════════════ */
function guardAuth() {
  if (sessionStorage.getItem(AUTH_KEY) !== 'true') {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

/* ══════════════════════════════════════════
   AUTH — Logout
══════════════════════════════════════════ */
function handleLogout() {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem('inferno_admin_user');
  window.location.href = 'index.html';
}

/* ══════════════════════════════════════════
   NAV — Section Switching
══════════════════════════════════════════ */
function switchPanel(panelId) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('panel-' + panelId);
  if (target) target.classList.add('active');

  document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('active'));
  const activeLink = document.querySelector(`[data-panel="${panelId}"]`);
  if (activeLink) activeLink.classList.add('active');

  const titles = {
    dashboard: 'Dashboard', gallery: 'Gallery', testimonials: 'Testimonials',
    services: 'Services', collections: 'Collections', messages: 'Messages',
    bookings: 'Bookings', settings: 'Settings', profile: 'Photographer Profile', media: 'Media'
  };
  const titleEl = document.getElementById('topbarTitle');
  if (titleEl) titleEl.textContent = titles[panelId] || 'Dashboard';

  // Load data for the panel being switched to
  if (panelId === 'messages')     loadMessages();
  if (panelId === 'gallery')      loadMediaGallery();
  if (panelId === 'services')     loadServices();
  if (panelId === 'testimonials') loadTestimonials();
  if (panelId === 'bookings')     loadBookings();
  if (panelId === 'settings')     loadProfileForm();
}

/* ══════════════════════════════════════════
   DASHBOARD — Stats from Supabase
══════════════════════════════════════════ */
async function renderStats() {
  try {
    const [media, messages, services, bookings] = await Promise.all([
      window.fetchAllMedia(),
      window.fetchMessages(),
      window.fetchServices(),
      window.fetchBookings(),
    ]);

    const unread = (messages || []).filter(m => !m.is_read).length;

    const el = id => document.getElementById(id);
    if (el('stat-photos'))    el('stat-photos').textContent    = (media    || []).length;
    if (el('stat-inquiries')) el('stat-inquiries').textContent = (messages || []).length;
    if (el('stat-new'))       el('stat-new').textContent       = unread;
    if (el('stat-services'))  el('stat-services').textContent  = (services || []).length;
    if (el('stat-bookings'))  el('stat-bookings').textContent  = (bookings || []).length;
  } catch (err) {
    console.error('[v0] Error loading stats:', err);
  }
}

/* ══════════════════════════════════════════
   MESSAGES — Supabase CRUD
══════════════════════════════════════════ */
async function loadMessages() {
  const tbody = document.getElementById('messagesTableBody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:32px; color:var(--grey-400);">Loading...</td></tr>';

  try {
    const messages = await window.fetchMessages();

    if (!messages || messages.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="color:var(--grey-400); text-align:center; padding:32px;">No messages yet.</td></tr>';
      return;
    }

    tbody.innerHTML = messages.map(m => `
      <tr>
        <td><strong>${escHtml(m.name)}</strong></td>
        <td style="color:var(--grey-500)">${escHtml(m.email)}</td>
        <td>${escHtml(m.subject || '—')}</td>
        <td>${new Date(m.created_at).toLocaleDateString()}</td>
        <td>
          <span class="badge ${m.is_read ? 'badge--read' : 'badge--new'}">${m.is_read ? 'Read' : 'New'}</span>
          &nbsp;
          <button class="btn btn--outline btn--sm" onclick="markRead('${m.id}')">Mark Read</button>
          <button class="btn btn--danger btn--sm" onclick="deleteMessage('${m.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('[v0] Error loading messages:', err);
    tbody.innerHTML = '<tr><td colspan="5" style="color:red; text-align:center; padding:32px;">Failed to load messages.</td></tr>';
  }
}

async function markRead(id) {
  await window.markMessageAsRead(id);
  loadMessages();
  renderStats();
}

async function deleteMessage(id) {
  if (!confirm('Delete this message?')) return;
  await window.deleteMessage(id);
  loadMessages();
  renderStats();
}

/* ══════════════════════════════════════════
   SERVICES — Supabase CRUD
══════════════════════════════════════════ */
async function loadServices() {
  const list = document.getElementById('servicesList');
  if (!list) return;

  list.innerHTML = '<p style="color:var(--grey-400);">Loading...</p>';

  try {
    const fetchFn = window.fetchAllServices || window.fetchServices;
    const items = await fetchFn();

    if (!items || items.length === 0) {
      list.innerHTML = '<p style="color:var(--grey-400);">No services yet.</p>';
      return;
    }

    list.innerHTML = items.map(s => `
      <div class="item-row">
        <div class="item-row__info">
          <div class="item-row__title">${escHtml(s.name)} ${s.is_featured ? '<span style="color:var(--ember);font-size:0.75rem;">★ Featured</span>' : ''}</div>
          <div class="item-row__meta">
            ${s.category ? `<span style="background:var(--grey-100);padding:2px 6px;border-radius:4px;font-size:0.75rem;">${escHtml(s.category)}</span> ` : ''}
            ${s.base_price ? 'KES ' + Number(s.base_price).toLocaleString() : ''}
            ${s.items_offered?.length ? ` · ${s.items_offered.length} items` : ''}
            ${s.is_active ? '' : ' · <span style="color:var(--grey-400);">Inactive</span>'}
          </div>
          ${s.description ? `<div style="font-size:0.8rem;color:var(--grey-500);margin-top:4px;">${escHtml(s.description)}</div>` : ''}
        </div>
        <div class="item-row__actions">
          <button class="btn btn--outline btn--sm" onclick="editService('${s.id}')">Edit</button>
          <button class="btn btn--danger btn--sm" onclick="removeService('${s.id}')">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('[v0] Error loading services:', err);
  }
}

async function saveService() {
  const id       = document.getElementById('svc-id')?.value;
  const name     = document.getElementById('svc-name')?.value.trim();
  const category = document.getElementById('svc-category')?.value.trim();
  const price    = document.getElementById('svc-price')?.value.trim();
  const turnaround = document.getElementById('svc-turn')?.value.trim();
  const desc     = document.getElementById('svc-desc')?.value.trim();
  const itemsRaw = document.getElementById('svc-items')?.value || '';
  const active   = document.getElementById('svc-featured')?.checked ?? true;
  const featured = document.getElementById('svc-is-featured')?.checked ?? false;

  if (!name) { alert('Service name is required.'); return; }

  const items_offered = itemsRaw.split('\n').map(s => s.trim()).filter(Boolean);

  const payload = {
    name,
    category: category || null,
    base_price: price ? parseFloat(price.replace(/[^0-9.]/g, '')) : null,
    turnaround: turnaround || null,
    description: desc || null,
    items_offered,
    is_active: active,
    is_featured: featured,
  };

  try {
    if (id) {
      await window.updateService(id, payload);
      showAlert('svcAlert', 'Service updated.', 'success');
    } else {
      await window.createService(payload);
      showAlert('svcAlert', 'Service added.', 'success');
    }
    clearServiceForm();
    loadServices();
  } catch (err) {
    console.error('[v0] Error saving service:', err);
    showAlert('svcAlert', 'Error saving service.', 'error');
  }
}

function editService(id) {
  (window.fetchAllServices || window.fetchServices)().then(items => {
    const s = items.find(x => x.id === id);
    if (!s) return;
    const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val || ''; };
    set('svc-id',       s.id);
    set('svc-name',     s.name);
    set('svc-category', s.category);
    set('svc-price',    s.base_price || '');
    set('svc-turn',     s.turnaround || '');
    set('svc-desc',     s.description || '');
    set('svc-items',    Array.isArray(s.items_offered) ? s.items_offered.join('\n') : '');
    if (document.getElementById('svc-featured'))    document.getElementById('svc-featured').checked    = s.is_active;
    if (document.getElementById('svc-is-featured')) document.getElementById('svc-is-featured').checked = s.is_featured;
    document.getElementById('svc-name')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

async function removeService(id) {
  if (!confirm('Delete this service?')) return;
  await window.deleteService(id);
  loadServices();
}

function clearServiceForm() {
  ['svc-id','svc-name','svc-category','svc-price','svc-turn','svc-desc','svc-items'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const feat = document.getElementById('svc-featured');
  if (feat) feat.checked = true;
  const isFeat = document.getElementById('svc-is-featured');
  if (isFeat) isFeat.checked = false;
}

/* ══════════════════════════════════════════
   TESTIMONIALS — Supabase CRUD
══════════════════════════════════════════ */
async function loadTestimonials() {
  const list = document.getElementById('testimonialsList');
  if (!list) return;

  list.innerHTML = '<p style="color:var(--grey-400);">Loading...</p>';

  try {
    const items = await window.fetchTestimonials();

    if (!items || items.length === 0) {
      list.innerHTML = '<p style="color:var(--grey-400);">No testimonials yet.</p>';
      return;
    }

    list.innerHTML = items.map(t => `
      <div class="item-row">
        <div class="item-row__info">
          <div class="item-row__title">${escHtml(t.client_name)}</div>
          <div class="item-row__meta">${escHtml(t.client_title || '')} ${t.is_featured ? '· <span style="color:var(--ember)">Featured</span>' : ''}</div>
          <div style="font-size:0.8rem; color:var(--grey-500); margin-top:4px;">"${escHtml((t.quote || '').substring(0, 80))}..."</div>
        </div>
        <div class="item-row__actions">
          <button class="btn btn--outline btn--sm" onclick="editTestimonial('${t.id}')">Edit</button>
          <button class="btn btn--danger btn--sm" onclick="removeTestimonial('${t.id}')">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('[v0] Error loading testimonials:', err);
  }
}

async function saveTestimonial() {
  const id    = document.getElementById('test-id')?.value;
  const name  = document.getElementById('test-name')?.value.trim();
  const role  = document.getElementById('test-role')?.value.trim();
  const quote = document.getElementById('test-quote')?.value.trim();
  const featured = document.getElementById('test-featured')?.checked ?? false;

  if (!name || !quote) { alert('Name and quote are required.'); return; }

  const payload = {
    client_name: name,
    client_title: role,
    quote,
    is_featured: featured,
    is_approved: true,
  };

  try {
    if (id) {
      await window.updateTestimonial(id, payload);
      showAlert('testAlert', 'Testimonial updated.', 'success');
    } else {
      await window.createTestimonial(payload);
      showAlert('testAlert', 'Testimonial added.', 'success');
    }
    clearTestimonialForm();
    loadTestimonials();
  } catch (err) {
    console.error('[v0] Error saving testimonial:', err);
    showAlert('testAlert', 'Error saving testimonial.', 'error');
  }
}

function editTestimonial(id) {
  window.fetchTestimonials().then(items => {
    const t = items.find(x => x.id === id);
    if (!t) return;
    document.getElementById('test-id').value    = t.id;
    document.getElementById('test-name').value  = t.client_name;
    document.getElementById('test-role').value  = t.client_title || '';
    document.getElementById('test-quote').value = t.quote;
    if (document.getElementById('test-featured'))
      document.getElementById('test-featured').checked = t.is_featured;
  });
}

async function removeTestimonial(id) {
  if (!confirm('Delete this testimonial?')) return;
  await window.deleteTestimonial(id);
  loadTestimonials();
}

function clearTestimonialForm() {
  ['test-id','test-name','test-role','test-quote'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const feat = document.getElementById('test-featured');
  if (feat) feat.checked = false;
}

/* ══════════════════════════════════════════
   BOOKINGS — Supabase CRUD
══════════════════════════════════════════ */
async function loadBookings() {
  const tbody = document.getElementById('bookingsTableBody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--grey-400);">Loading...</td></tr>';

  try {
    const bookings = await window.fetchBookings();

    if (!bookings || bookings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="color:var(--grey-400); text-align:center; padding:32px;">No bookings yet.</td></tr>';
      return;
    }

    tbody.innerHTML = bookings.map(b => `
      <tr>
        <td><strong>${escHtml(b.client_name)}</strong></td>
        <td>${escHtml(b.client_email)}</td>
        <td>${escHtml(b.services?.name || '—')}</td>
        <td>${b.event_date ? new Date(b.event_date).toLocaleDateString() : '—'}</td>
        <td><span class="badge badge--${b.status}">${escHtml(b.status)}</span></td>
        <td>
          <select onchange="updateStatus('${b.id}', this.value)" style="font-size:0.8rem; padding:4px 8px; border-radius:4px; border:1px solid var(--grey-200);">
            ${['pending','confirmed','in-progress','completed','cancelled'].map(s =>
              `<option value="${s}" ${b.status === s ? 'selected' : ''}>${s}</option>`
            ).join('')}
          </select>
          <button class="btn btn--danger btn--sm" style="margin-left:4px;" onclick="removeBooking('${b.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('[v0] Error loading bookings:', err);
    tbody.innerHTML = '<tr><td colspan="6" style="color:red; text-align:center; padding:32px;">Failed to load bookings.</td></tr>';
  }
}

async function updateStatus(id, status) {
  try {
    await window.updateBookingStatus(id, status);
    showAlert('bookingsAlert', 'Booking status updated.', 'success');
    renderStats();
  } catch (err) {
    console.error('[v0] Error updating booking:', err);
  }
}

async function removeBooking(id) {
  if (!confirm('Delete this booking?')) return;
  // deleteBooking is already on window from supabase-client.js — use a local wrapper name
  try {
    const { error } = await window.supabaseClient.from('bookings').delete().eq('id', id);
    if (error) throw error;
    loadBookings();
    renderStats();
  } catch (err) {
    console.error('[v0] Error deleting booking:', err);
  }
}

/* ══════════════════════════════════════════
   GALLERY / MEDIA — Supabase + Cloudinary
══════════════════════════════════════════ */
async function loadMediaGallery() {
  const gallery = document.getElementById('mediaGallery');
  if (!gallery) return;

  gallery.innerHTML = '<p style="color:var(--grey-400); grid-column:1/-1;">Loading...</p>';

  try {
    const mediaItems = await window.fetchAllMedia();

    if (!mediaItems || mediaItems.length === 0) {
      gallery.innerHTML = '<p style="color:var(--grey-400); grid-column:1/-1;">No media uploaded yet.</p>';
      return;
    }

    gallery.innerHTML = mediaItems.map(item => `
      <div style="position:relative; overflow:hidden; border-radius:8px; aspect-ratio:1;">
        ${item.media_type === 'video'
          ? `<video src="${item.url}" style="width:100%; height:100%; object-fit:cover;" muted></video>`
          : `<img src="${item.url}" alt="${escHtml(item.caption || '')}" style="width:100%; height:100%; object-fit:cover;" />`
        }
        <div style="position:absolute; bottom:0; left:0; right:0; background:linear-gradient(transparent, rgba(0,0,0,0.7)); padding:8px; color:white; font-size:0.75rem;">
          <strong>${escHtml(item.caption || 'Untitled')}</strong>
          <span style="opacity:0.7; margin-left:6px;">${escHtml(item.category)}</span>
        </div>
        <button onclick="deleteMediaFromAdmin('${item.id}')" style="position:absolute; top:4px; right:4px; background:rgba(255,77,46,0.9); color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:0.75rem;">Delete</button>
      </div>
    `).join('');
  } catch (err) {
    console.error('[v0] Error loading media gallery:', err);
    gallery.innerHTML = '<p style="color:red; grid-column:1/-1;">Failed to load media.</p>';
  }
}

async function uploadMediaItem() {
  const fileInput = document.getElementById('mediaFile');
  const caption   = (document.getElementById('mediaCaption')?.value || '').trim();
  const category  = (document.getElementById('mediaCategory')?.value || '').trim();
  const statusEl  = document.getElementById('uploadStatus');
  const uploadBtn = document.getElementById('uploadButton');

  if (!fileInput?.files.length) { alert('Please select a file.'); return; }
  if (!category) { alert('Please select a category.'); return; }

  const file = fileInput.files[0];
  const validation = validateImageFile(file);
  if (!validation.valid) { alert(validation.error); return; }

  uploadBtn.disabled = true;
  statusEl.textContent = 'Uploading to Cloudinary...';
  statusEl.style.color = 'var(--grey-500)';

  try {
    const cloudinaryResult = await uploadToCloudinary(file, 'inferno_pictures');
    statusEl.textContent = 'Saving to database...';

    const mediaItem = await window.createMediaItem(
      cloudinaryResult.url,
      cloudinaryResult.public_id,
      category,
      caption || `${category} ${validation.type === 'video' ? 'Video' : 'Photo'}`,
      cloudinaryResult.resource_type || validation.type
    );

    if (mediaItem) {
      statusEl.textContent = '✓ Uploaded successfully!';
      statusEl.style.color = 'var(--ember)';
      fileInput.value = '';
      if (document.getElementById('mediaCaption')) document.getElementById('mediaCaption').value = '';
      if (document.getElementById('mediaCategory')) document.getElementById('mediaCategory').value = '';
      await loadMediaGallery();
      renderStats();
      setTimeout(() => { statusEl.textContent = ''; }, 3000);
    } else {
      throw new Error('Failed to save to database');
    }
  } catch (err) {
    console.error('[v0] Upload error:', err);
    statusEl.textContent = '✗ Upload failed: ' + err.message;
    statusEl.style.color = 'var(--red-500)';
  } finally {
    uploadBtn.disabled = false;
  }
}

async function deleteMediaFromAdmin(mediaId) {
  if (!confirm('Delete this media item?')) return;
  try {
    const success = await window.deleteMediaItem(mediaId);
    if (success) {
      await loadMediaGallery();
      renderStats();
    } else {
      alert('Failed to delete media.');
    }
  } catch (err) {
    console.error('[v0] Error deleting media:', err);
  }
}

/* ══════════════════════════════════════════
   SETTINGS — Profile (Supabase)
══════════════════════════════════════════ */
async function loadProfileForm() {
  try {
    const profile = await window.fetchPhotographerProfile();
    if (!profile) return;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    set('profileName',      profile.name);
    set('profileBio',       profile.bio);
    set('profileLocation',  profile.location);
    set('profileInstagram', profile.instagram_handle);
    set('profileTwitter',   profile.twitter_handle);
    set('profileLinkedin',  profile.linkedin_handle);
    set('profilePortfolio', profile.portfolio_url);
    if (document.getElementById('profileServices'))
      document.getElementById('profileServices').value = (profile.services_offered || []).join(', ');

    loadLogoPreview();
  } catch (err) {
    console.error('[v0] Error loading profile form:', err);
  }
}

async function handleSaveProfile() {
  const g = id => (document.getElementById(id)?.value || '').trim();

  const profileData = {
    name:              g('profileName'),
    bio:               g('profileBio'),
    location:          g('profileLocation'),
    about_title:       g('profileAboutTitle').replace(/\\n/g, '\n'),
    about_body:        g('profileAboutBody'),
    philosophy:        g('profilePhilosophy'),
    clients_note:      g('profileClientsNote'),
    email:             g('profileEmail'),
    phone:             g('profilePhone'),
    instagram_handle:  g('profileInstagram'),
    twitter_handle:    g('profileTwitter'),
    linkedin_handle:   g('profileLinkedin'),
    facebook_handle:   g('profileFacebook'),
    portfolio_url:     g('profilePortfolio'),
    services_offered:  g('profileServices').split(',').map(s => s.trim()).filter(Boolean),
    skills:            g('profileSkills').split(',').map(s => s.trim()).filter(Boolean),
  };

  if (!profileData.name) { alert('Name is required.'); return; }

  try {
    const result = await window.savePhotographerProfile(profileData);
    if (result) {
      showAlert('profileAlert', 'Profile saved successfully!', 'success');
    } else {
      showAlert('profileAlert', 'Failed to save profile.', 'error');
    }
  } catch (err) {
    console.error('[v0] Error saving profile:', err);
    showAlert('profileAlert', 'Error: ' + err.message, 'error');
  }
}

async function handleLogoUpload() {
  const fileInput = document.getElementById('logoFile');
  const statusEl  = document.getElementById('logoUploadStatus');
  const uploadBtn = document.getElementById('uploadLogoButton');

  if (!fileInput?.files.length) { alert('Please select a logo file.'); return; }

  const file = fileInput.files[0];
  const maxSize = 10 * 1024 * 1024;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (!allowedTypes.includes(file.type)) { alert('Please upload a JPEG, PNG, WebP, or GIF.'); return; }
  if (file.size > maxSize) { alert('File size exceeds 10MB.'); return; }

  uploadBtn.disabled = true;
  statusEl.textContent = 'Uploading to Cloudinary...';
  statusEl.style.color = 'var(--grey-500)';

  try {
    const cloudinaryResult = await uploadToCloudinary(file, 'inferno_pictures_logos');
    statusEl.textContent = 'Saving to database...';

    const result = await window.updateLogoUrl(cloudinaryResult.url);
    if (result) {
      statusEl.textContent = '✓ Logo uploaded successfully!';
      statusEl.style.color = 'var(--ember)';
      fileInput.value = '';
      loadLogoPreview();
      setTimeout(() => { statusEl.textContent = ''; }, 3000);
    } else {
      throw new Error('Failed to save logo URL to database');
    }
  } catch (err) {
    console.error('[v0] Logo upload error:', err);
    statusEl.textContent = '✗ Upload failed: ' + err.message;
    statusEl.style.color = 'var(--red-500)';
  } finally {
    uploadBtn.disabled = false;
  }
}

async function loadLogoPreview() {
  try {
    const profile = await window.fetchPhotographerProfile();
    const preview = document.getElementById('logoPreview');
    const noLogo  = document.getElementById('noLogo');
    if (!preview) return;

    if (profile?.logo_url) {
      preview.src = profile.logo_url;
      preview.style.display = 'block';
      if (noLogo) noLogo.style.display = 'none';
    } else {
      preview.style.display = 'none';
      if (noLogo) noLogo.style.display = 'block';
    }
  } catch (err) {
    console.error('[v0] Error loading logo preview:', err);
  }
}

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
function escHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showAlert(elId, msg, type = 'success') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.className = `alert alert--${type}`;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3000);
}

/* ══════════════════════════════════════════
   INIT — Dashboard load
══════════════════════════════════════════ */
async function initDashboard() {
  if (!guardAuth()) return;

  const userEl = document.getElementById('adminUser');
  if (userEl) userEl.textContent = sessionStorage.getItem('inferno_admin_user') || 'admin';

  switchPanel('dashboard');
  await renderStats();
}

/* ══════════════════════════════════════════
   GLOBAL EXPORTS
══════════════════════════════════════════ */
window.switchPanel         = switchPanel;
window.handleLogout        = handleLogout;
window.handleSaveProfile   = handleSaveProfile;
window.handleLogoUpload    = handleLogoUpload;
window.loadLogoPreview     = loadLogoPreview;
window.loadProfileForm     = loadProfileForm;
window.uploadMediaItem     = uploadMediaItem;
window.loadMediaGallery    = loadMediaGallery;
window.deleteMediaFromAdmin = deleteMediaFromAdmin;
window.saveService         = saveService;
window.editService         = editService;
window.removeService       = removeService;
window.saveTestimonial     = saveTestimonial;
window.editTestimonial     = editTestimonial;
window.removeTestimonial   = removeTestimonial;
window.loadBookings        = loadBookings;
window.updateStatus        = updateStatus;
window.removeBooking       = removeBooking;
window.markRead            = markRead;
window.deleteMessage       = deleteMessage;
window.loadMessages        = loadMessages;
window.renderStats         = renderStats;
/* ══════════════════════════════════════════
   AVATAR UPLOAD
══════════════════════════════════════════ */
async function handleAvatarUpload() {
  const fileInput = document.getElementById('avatarFile');
  const statusEl  = document.getElementById('avatarUploadStatus');
  const uploadBtn = document.getElementById('uploadAvatarButton');

  if (!fileInput?.files.length) { alert('Please select an avatar file.'); return; }

  const file = fileInput.files[0];
  if (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)) {
    alert('Please upload a JPEG, PNG, WebP, or GIF.'); return;
  }
  if (file.size > 10 * 1024 * 1024) { alert('File size exceeds 10MB.'); return; }

  uploadBtn.disabled = true;
  statusEl.textContent = 'Uploading...';
  statusEl.style.color = 'var(--grey-500)';

  try {
    const cloudinaryResult = await uploadToCloudinary(file, 'inferno_avatars');
    const result = await window.updateAvatarUrl(cloudinaryResult.url);
    if (result) {
      statusEl.textContent = '✓ Avatar uploaded!';
      statusEl.style.color = 'var(--ember)';
      fileInput.value = '';
      loadAvatarPreview();
      setTimeout(() => { statusEl.textContent = ''; }, 3000);
    } else {
      throw new Error('Failed to save avatar URL');
    }
  } catch (err) {
    console.error('[v0] Avatar upload error:', err);
    statusEl.textContent = '✗ Upload failed: ' + err.message;
    statusEl.style.color = 'red';
  } finally {
    uploadBtn.disabled = false;
  }
}

async function loadAvatarPreview() {
  try {
    const profile = await window.fetchPhotographerProfile();
    const preview  = document.getElementById('avatarPreview');
    const initial  = document.getElementById('avatarInitial');
    if (!preview) return;
    if (profile?.avatar_url) {
      preview.src = profile.avatar_url;
      preview.style.display = 'block';
      if (initial) initial.style.display = 'none';
    } else {
      preview.style.display = 'none';
      if (initial) {
        initial.style.display = '';
        initial.textContent = profile?.name ? profile.name.charAt(0).toUpperCase() : '?';
      }
    }
  } catch (err) {
    console.error('[v0] loadAvatarPreview:', err);
  }
}

/* ══════════════════════════════════════════
   COLLECTIONS CRUD
══════════════════════════════════════════ */
async function loadCollectionsAdmin() {
  const list = document.getElementById('collectionsList');
  if (!list) return;
  list.innerHTML = '<p style="color:var(--grey-400);">Loading...</p>';
  try {
    const items = await window.fetchAllCollections();
    if (!items || items.length === 0) {
      list.innerHTML = '<p style="color:var(--grey-400);">No collections yet. Add one below.</p>';
      return;
    }
    list.innerHTML = items.map(c => `
      <div class="item-row">
        <div class="item-row__info" style="display:flex;align-items:center;gap:12px;">
          ${c.image_url ? `<img src="${escHtml(c.image_url)}" style="width:56px;height:40px;object-fit:cover;border-radius:4px;flex-shrink:0;" />` : `<div style="width:56px;height:40px;background:var(--grey-100);border-radius:4px;flex-shrink:0;"></div>`}
          <div>
            <div class="item-row__title">${escHtml(c.title)} ${c.is_active ? '' : '<span style="color:var(--grey-400);font-size:0.75rem;">Inactive</span>'}</div>
            <div class="item-row__meta">${escHtml(c.series_label || '')} ${c.description ? '· ' + escHtml(c.description.substring(0,60)) + '...' : ''}</div>
          </div>
        </div>
        <div class="item-row__actions">
          <button class="btn btn--outline btn--sm" onclick="editCollection('${c.id}')">Edit</button>
          <button class="btn btn--danger btn--sm" onclick="removeCollection('${c.id}')">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('[v0] loadCollectionsAdmin:', err);
    list.innerHTML = '<p style="color:red;">Failed to load collections.</p>';
  }
}

async function saveCollection() {
  const id    = document.getElementById('col-id')?.value;
  const title = document.getElementById('col-title')?.value.trim();
  const g = elId => (document.getElementById(elId)?.value || '').trim();

  if (!title) { alert('Title is required.'); return; }

  // Handle optional image upload first
  const imageFile = document.getElementById('col-image-file')?.files[0];
  let imageUrl = null;
  let imagePubId = null;

  if (imageFile) {
    const statusEl = document.getElementById('colImageStatus');
    if (statusEl) { statusEl.textContent = 'Uploading image...'; statusEl.style.color = 'var(--grey-500)'; }
    try {
      const res = await uploadToCloudinary(imageFile, 'inferno_collections');
      imageUrl  = res.url;
      imagePubId = res.public_id;
      if (statusEl) { statusEl.textContent = '✓ Image uploaded'; statusEl.style.color = 'var(--ember)'; }
    } catch (err) {
      alert('Image upload failed: ' + err.message); return;
    }
  }

  // If editing, fetch existing image url to keep it if no new image
  let existingImageUrl = null;
  if (id && !imageUrl) {
    const all = await window.fetchAllCollections();
    const existing = all.find(c => c.id === id);
    existingImageUrl = existing?.image_url || null;
  }

  const payload = {
    title,
    series_label: g('col-series-label') || null,
    description:  g('col-description') || null,
    tagline:      g('col-tagline') || null,
    link_label:   g('col-link-label') || 'See full series',
    link_url:     g('col-link-url') || '#contact',
    sort_order:   parseInt(g('col-sort-order')) || 0,
    is_active:    document.getElementById('col-active')?.checked ?? true,
    image_url:    imageUrl || existingImageUrl,
    cloudinary_public_id: imagePubId || null,
  };

  try {
    if (id) {
      await window.updateCollection(id, payload);
      showAlert('colAlert', 'Collection updated.', 'success');
    } else {
      await window.createCollection(payload);
      showAlert('colAlert', 'Collection added.', 'success');
    }
    clearCollectionForm();
    loadCollectionsAdmin();
  } catch (err) {
    console.error('[v0] saveCollection:', err);
    showAlert('colAlert', 'Error saving collection.', 'error');
  }
}

function editCollection(id) {
  window.fetchAllCollections().then(items => {
    const c = items.find(x => x.id === id);
    if (!c) return;
    const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val || ''; };
    set('col-id',           c.id);
    set('col-title',        c.title);
    set('col-series-label', c.series_label);
    set('col-description',  c.description);
    set('col-tagline',      c.tagline);
    set('col-link-label',   c.link_label);
    set('col-link-url',     c.link_url);
    set('col-sort-order',   c.sort_order);
    if (document.getElementById('col-active')) document.getElementById('col-active').checked = c.is_active;
    const prev = document.getElementById('colImagePreview');
    if (prev && c.image_url) {
      prev.innerHTML = `<img src="${escHtml(c.image_url)}" style="max-width:200px;max-height:120px;border-radius:6px;object-fit:cover;" />`;
    }
    document.getElementById('col-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

async function removeCollection(id) {
  if (!confirm('Delete this collection?')) return;
  await window.deleteCollection(id);
  loadCollectionsAdmin();
}

function clearCollectionForm() {
  ['col-id','col-title','col-series-label','col-description','col-tagline','col-link-label','col-link-url','col-sort-order'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = id === 'col-link-label' ? 'See full series' : id === 'col-link-url' ? '#contact' : '';
  });
  if (document.getElementById('col-active')) document.getElementById('col-active').checked = true;
  if (document.getElementById('col-image-file')) document.getElementById('col-image-file').value = '';
  const prev = document.getElementById('colImagePreview');
  if (prev) prev.innerHTML = '';
  const status = document.getElementById('colImageStatus');
  if (status) status.textContent = '';
}

/* ══════════════════════════════════════════
   PROFILE PANEL — load all new fields
══════════════════════════════════════════ */
async function loadProfilePanelFull() {
  try {
    const profile = await window.fetchPhotographerProfile();
    if (!profile) return;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    set('profileName',       profile.name);
    set('profileBio',        profile.bio);
    set('profileLocation',   profile.location);
    set('profileAboutTitle', profile.about_title);
    set('profileAboutBody',  profile.about_body);
    set('profilePhilosophy', profile.philosophy);
    set('profileClientsNote',profile.clients_note);
    set('profileEmail',      profile.email);
    set('profilePhone',      profile.phone);
    set('profileInstagram',  profile.instagram_handle);
    set('profileTwitter',    profile.twitter_handle);
    set('profileLinkedin',   profile.linkedin_handle);
    set('profileFacebook',   profile.facebook_handle);
    set('profilePortfolio',  profile.portfolio_url);
    if (document.getElementById('profileServices'))
      document.getElementById('profileServices').value = (profile.services_offered || []).join(', ');
    if (document.getElementById('profileSkills'))
      document.getElementById('profileSkills').value = (profile.skills || []).join(', ');
    await window.loadLogoPreview();
    await loadAvatarPreview();
  } catch (err) {
    console.error('[v0] loadProfilePanelFull:', err);
  }
}

window.handleAvatarUpload   = handleAvatarUpload;
window.loadAvatarPreview    = loadAvatarPreview;
window.loadCollectionsAdmin = loadCollectionsAdmin;
window.saveCollection       = saveCollection;
window.editCollection       = editCollection;
window.removeCollection     = removeCollection;
window.clearCollectionForm  = clearCollectionForm;
window.loadProfilePanelFull = loadProfilePanelFull;
