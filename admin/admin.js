/**
 * INFERNO PHOTOGRAPHY — ADMIN JAVASCRIPT
 * Handles: login auth, dashboard data, localStorage CRUD
 *
 * NOTE: Replace with real backend auth in production.
 * This is a demo-only client-side implementation.
 */

'use strict';

/* ══════════════════════════════════════════
   CONSTANTS & DEMO CREDENTIALS
   Replace with real backend auth in production.
══════════════════════════════════════════ */
const DEMO_USER = 'admin';
const DEMO_PASS = 'inferno123';
const AUTH_KEY  = 'inferno_admin_auth';

/* ══════════════════════════════════════════
   DEFAULT DATA — Seeded to localStorage on first run
══════════════════════════════════════════ */
const DEFAULTS = {
  inferno_projects: [
    { id: 1, title: 'Coastal Solitude', category: 'Nature', description: 'A meditative coastal series.', featured: true },
    { id: 2, title: 'Urban Fragments', category: 'Editorial', description: 'Architecture in absence.', featured: true },
    { id: 3, title: 'Quiet Faces', category: 'Portrait', description: 'Studio portrait series.', featured: false },
  ],
  inferno_gallery: [
    { id: 1, title: 'Soft Focus', category: 'Portrait', filename: 'potrait.jpg' },
    { id: 2, title: 'Golden Shore', category: 'Nature', filename: 'beach.jpg' },
    { id: 3, title: 'Reflections', category: 'Editorial', filename: 'mirror.jpg' },
    { id: 4, title: 'Into the Wild', category: 'Nature', filename: 'nature.jpg' },
    { id: 5, title: 'First Light', category: 'Nature', filename: 'pexels-jplenio-1103970.jpg' },
    { id: 6, title: 'Behind the Scene', category: 'Event', filename: 'behind.jpg' },
  ],
  inferno_testimonials: [
    { id: 1, name: 'Amara Osei', role: 'Creative Director, Lumi Brands', quote: 'Working with Inferno Photography was unlike anything I\'d experienced before. Alex has an uncanny ability to capture moments that feel genuinely lived.' },
    { id: 2, name: 'Njeri Kimani', role: 'Founder, Savanna Collective', quote: 'The portrait session for our team was seamless. Professional, warm, and the results were stunning.' },
    { id: 3, name: 'Tobias Mwenda', role: 'Events Lead, Nairobi Design Week', quote: 'Alex delivers something different — editorial-quality coverage with documentary-style honesty.' },
  ],
  inferno_services: [
    { id: 1, name: 'Portrait Session', price: 'KES 15,000', turnaround: '5–7 days', description: 'For individuals, families, and personal brands.', featured: false },
    { id: 2, name: 'Brand Editorial', price: 'KES 45,000', turnaround: '7–10 days', description: 'For businesses, startups, and creative studios.', featured: true },
    { id: 3, name: 'Event Coverage', price: 'KES 60,000', turnaround: '10–14 days', description: 'Weddings, launches, galas, and experiences.', featured: false },
  ],
  inferno_messages: [
    { id: 1, name: 'Sample Client', email: 'client@example.com', service: 'portrait', message: 'Hello! I\'m interested in a portrait session for my family.', date: '2025-06-01', read: false },
    { id: 2, name: 'Brand Agency', email: 'agency@example.com', service: 'brand', message: 'We have an exciting editorial project to discuss.', date: '2025-06-05', read: true },
  ]
};

/* ══════════════════════════════════════════
   STORAGE HELPERS
══════════════════════════════════════════ */
function getData(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    return false;
  }
}

function seedDefaults() {
  Object.entries(DEFAULTS).forEach(([key, value]) => {
    if (!localStorage.getItem(key)) {
      setData(key, value);
    }
  });
}

function resetToDefaults() {
  Object.entries(DEFAULTS).forEach(([key, value]) => {
    setData(key, value);
  });
}

/* ══════════════════════════════════════════
   AUTH — Login Handler
   NOTE: Replace with real backend auth in production.
══════════════════════════════════════════ */
function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('loginError');

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
   AUTH — Guard (run on dashboard page)
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
  // Hide all panels
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  // Show target
  const target = document.getElementById('panel-' + panelId);
  if (target) target.classList.add('active');

  // Update sidebar active state
  document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('active'));
  const activeLink = document.querySelector(`[data-panel="${panelId}"]`);
  if (activeLink) activeLink.classList.add('active');

  // Update topbar title
  const titles = {
    dashboard: 'Dashboard',
    projects: 'Projects',
    gallery: 'Gallery',
    testimonials: 'Testimonials',
    services: 'Services',
    messages: 'Messages',
    settings: 'Settings'
  };
  const titleEl = document.getElementById('topbarTitle');
  if (titleEl) titleEl.textContent = titles[panelId] || 'Dashboard';
}

/* ══════════════════════════════════════════
   DASHBOARD — Render summary stats
══════════════════════════════════════════ */
function renderStats() {
  const projects    = getData('inferno_projects') || [];
  const gallery     = getData('inferno_gallery') || [];
  const messages    = getData('inferno_messages') || [];
  const featured    = projects.filter(p => p.featured).length;
  const newMessages = messages.filter(m => !m.read).length;

  document.getElementById('stat-projects').textContent = projects.length;
  document.getElementById('stat-photos').textContent = gallery.length;
  document.getElementById('stat-inquiries').textContent = messages.length;
  document.getElementById('stat-new').textContent = newMessages;
}

/* ══════════════════════════════════════════
   MESSAGES — Render table
══════════════════════════════════════════ */
function renderMessages() {
  const messages = getData('inferno_messages') || [];
  const tbody = document.getElementById('messagesTableBody');
  if (!tbody) return;

  if (messages.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="color:var(--grey-400); text-align:center; padding:32px;">No messages yet.</td></tr>';
    return;
  }

  tbody.innerHTML = messages.map(m => `
    <tr>
      <td><strong>${escHtml(m.name)}</strong></td>
      <td style="color:var(--grey-500)">${escHtml(m.email)}</td>
      <td>${escHtml(m.service || '—')}</td>
      <td>${escHtml(m.date || '—')}</td>
      <td>
        <span class="badge ${m.read ? 'badge--read' : 'badge--new'}">${m.read ? 'Read' : 'New'}</span>
        &nbsp;
        <button class="btn btn--outline btn--sm" onclick="markRead(${m.id})">Mark Read</button>
        <button class="btn btn--danger btn--sm" onclick="deleteMessage(${m.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function markRead(id) {
  const messages = getData('inferno_messages') || [];
  const msg = messages.find(m => m.id === id);
  if (msg) {
    msg.read = true;
    setData('inferno_messages', messages);
    renderMessages();
    renderStats();
  }
}

function deleteMessage(id) {
  if (!confirm('Delete this message?')) return;
  let messages = getData('inferno_messages') || [];
  messages = messages.filter(m => m.id !== id);
  setData('inferno_messages', messages);
  renderMessages();
  renderStats();
}

/* ══════════════════════════════════════════
   PROJECTS — Render & CRUD
══════════════════════════════════════════ */
function renderProjects() {
  const projects = getData('inferno_projects') || [];
  const list = document.getElementById('projectsList');
  if (!list) return;

  if (projects.length === 0) {
    list.innerHTML = '<p style="color:var(--grey-400);">No projects yet.</p>';
    return;
  }

  list.innerHTML = projects.map(p => `
    <div class="item-row">
      <div class="item-row__info">
        <div class="item-row__title">${escHtml(p.title)}</div>
        <div class="item-row__meta">${escHtml(p.category)} ${p.featured ? '· <span style="color:var(--ember)">Featured</span>' : ''}</div>
      </div>
      <div class="item-row__actions">
        <button class="btn btn--outline btn--sm" onclick="editProject(${p.id})">Edit</button>
        <button class="btn btn--danger btn--sm" onclick="deleteProject(${p.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function saveProject() {
  const id    = parseInt(document.getElementById('proj-id').value) || null;
  const title = document.getElementById('proj-title').value.trim();
  const cat   = document.getElementById('proj-cat').value.trim();
  const desc  = document.getElementById('proj-desc').value.trim();
  const feat  = document.getElementById('proj-featured').checked;

  if (!title) { alert('Title is required.'); return; }

  let projects = getData('inferno_projects') || [];

  if (id) {
    projects = projects.map(p => p.id === id ? { ...p, title, category: cat, description: desc, featured: feat } : p);
    showAlert('projAlert', 'Project updated.', 'success');
  } else {
    const newId = Date.now();
    projects.push({ id: newId, title, category: cat, description: desc, featured: feat });
    showAlert('projAlert', 'Project added.', 'success');
  }

  setData('inferno_projects', projects);
  renderProjects();
  renderStats();
  clearProjectForm();
}

function editProject(id) {
  const projects = getData('inferno_projects') || [];
  const p = projects.find(x => x.id === id);
  if (!p) return;

  document.getElementById('proj-id').value = p.id;
  document.getElementById('proj-title').value = p.title;
  document.getElementById('proj-cat').value = p.category;
  document.getElementById('proj-desc').value = p.description;
  document.getElementById('proj-featured').checked = p.featured;
}

function deleteProject(id) {
  if (!confirm('Delete this project?')) return;
  let projects = getData('inferno_projects') || [];
  projects = projects.filter(p => p.id !== id);
  setData('inferno_projects', projects);
  renderProjects();
  renderStats();
}

function clearProjectForm() {
  ['proj-id','proj-title','proj-cat','proj-desc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const feat = document.getElementById('proj-featured');
  if (feat) feat.checked = false;
}

/* ══════════════════════════════════════════
   TESTIMONIALS — Render & CRUD
══════════════════════════════════════════ */
function renderTestimonials() {
  const items = getData('inferno_testimonials') || [];
  const list  = document.getElementById('testimonialsList');
  if (!list) return;

  if (items.length === 0) {
    list.innerHTML = '<p style="color:var(--grey-400);">No testimonials yet.</p>';
    return;
  }

  list.innerHTML = items.map(t => `
    <div class="item-row">
      <div class="item-row__info">
        <div class="item-row__title">${escHtml(t.name)}</div>
        <div class="item-row__meta">${escHtml(t.role)}</div>
      </div>
      <div class="item-row__actions">
        <button class="btn btn--outline btn--sm" onclick="editTestimonial(${t.id})">Edit</button>
        <button class="btn btn--danger btn--sm" onclick="deleteTestimonial(${t.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function saveTestimonial() {
  const id    = parseInt(document.getElementById('test-id').value) || null;
  const name  = document.getElementById('test-name').value.trim();
  const role  = document.getElementById('test-role').value.trim();
  const quote = document.getElementById('test-quote').value.trim();

  if (!name || !quote) { alert('Name and quote are required.'); return; }

  let items = getData('inferno_testimonials') || [];

  if (id) {
    items = items.map(t => t.id === id ? { ...t, name, role, quote } : t);
    showAlert('testAlert', 'Testimonial updated.', 'success');
  } else {
    items.push({ id: Date.now(), name, role, quote });
    showAlert('testAlert', 'Testimonial added.', 'success');
  }

  setData('inferno_testimonials', items);
  renderTestimonials();
  clearTestimonialForm();
}

function editTestimonial(id) {
  const items = getData('inferno_testimonials') || [];
  const t = items.find(x => x.id === id);
  if (!t) return;
  document.getElementById('test-id').value = t.id;
  document.getElementById('test-name').value = t.name;
  document.getElementById('test-role').value = t.role;
  document.getElementById('test-quote').value = t.quote;
}

function deleteTestimonial(id) {
  if (!confirm('Delete this testimonial?')) return;
  let items = getData('inferno_testimonials') || [];
  items = items.filter(t => t.id !== id);
  setData('inferno_testimonials', items);
  renderTestimonials();
}

function clearTestimonialForm() {
  ['test-id','test-name','test-role','test-quote'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

/* ══════════════════════════════════════════
   SERVICES — Render & CRUD
══════════════════════════════════════════ */
function renderServices() {
  const items = getData('inferno_services') || [];
  const list  = document.getElementById('servicesList');
  if (!list) return;

  if (items.length === 0) {
    list.innerHTML = '<p style="color:var(--grey-400);">No services yet.</p>';
    return;
  }

  list.innerHTML = items.map(s => `
    <div class="item-row">
      <div class="item-row__info">
        <div class="item-row__title">${escHtml(s.name)}</div>
        <div class="item-row__meta">${escHtml(s.price)} · ${escHtml(s.turnaround)} ${s.featured ? '· <span style="color:var(--ember)">Featured</span>' : ''}</div>
      </div>
      <div class="item-row__actions">
        <button class="btn btn--outline btn--sm" onclick="editService(${s.id})">Edit</button>
        <button class="btn btn--danger btn--sm" onclick="deleteService(${s.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function saveService() {
  const id    = parseInt(document.getElementById('svc-id').value) || null;
  const name  = document.getElementById('svc-name').value.trim();
  const price = document.getElementById('svc-price').value.trim();
  const turn  = document.getElementById('svc-turn').value.trim();
  const desc  = document.getElementById('svc-desc').value.trim();
  const feat  = document.getElementById('svc-featured').checked;

  if (!name || !price) { alert('Name and price are required.'); return; }

  let items = getData('inferno_services') || [];

  if (id) {
    items = items.map(s => s.id === id ? { ...s, name, price, turnaround: turn, description: desc, featured: feat } : s);
    showAlert('svcAlert', 'Service updated.', 'success');
  } else {
    items.push({ id: Date.now(), name, price, turnaround: turn, description: desc, featured: feat });
    showAlert('svcAlert', 'Service added.', 'success');
  }

  setData('inferno_services', items);
  renderServices();
  clearServiceForm();
}

function editService(id) {
  const items = getData('inferno_services') || [];
  const s = items.find(x => x.id === id);
  if (!s) return;
  document.getElementById('svc-id').value = s.id;
  document.getElementById('svc-name').value = s.name;
  document.getElementById('svc-price').value = s.price;
  document.getElementById('svc-turn').value = s.turnaround;
  document.getElementById('svc-desc').value = s.description;
  document.getElementById('svc-featured').checked = s.featured;
}

function deleteService(id) {
  if (!confirm('Delete this service?')) return;
  let items = getData('inferno_services') || [];
  items = items.filter(s => s.id !== id);
  setData('inferno_services', items);
  renderServices();
}

function clearServiceForm() {
  ['svc-id','svc-name','svc-price','svc-turn','svc-desc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const feat = document.getElementById('svc-featured');
  if (feat) feat.checked = false;
}

/* ══════════════════════════════════════════
   GALLERY — Render & CRUD
══════════════════════════════════════════ */
function renderGallery() {
  const items = getData('inferno_gallery') || [];
  const list  = document.getElementById('galleryList');
  if (!list) return;

  if (items.length === 0) {
    list.innerHTML = '<p style="color:var(--grey-400);">No gallery items yet.</p>';
    return;
  }

  list.innerHTML = items.map(g => `
    <div class="item-row">
      <div style="width:48px; height:48px; border-radius:8px; overflow:hidden; flex-shrink:0;">
        <img src="../img/${escHtml(g.filename)}" alt="${escHtml(g.title)}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'" />
      </div>
      <div class="item-row__info">
        <div class="item-row__title">${escHtml(g.title)}</div>
        <div class="item-row__meta">${escHtml(g.category)} · ${escHtml(g.filename)}</div>
      </div>
      <div class="item-row__actions">
        <button class="btn btn--outline btn--sm" onclick="editGalleryItem(${g.id})">Edit</button>
        <button class="btn btn--danger btn--sm" onclick="deleteGalleryItem(${g.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function saveGalleryItem() {
  const id       = parseInt(document.getElementById('gal-id').value) || null;
  const title    = document.getElementById('gal-title').value.trim();
  const cat      = document.getElementById('gal-cat').value.trim();
  const filename = document.getElementById('gal-filename').value.trim();

  if (!title || !filename) { alert('Title and filename are required.'); return; }

  let items = getData('inferno_gallery') || [];

  if (id) {
    items = items.map(g => g.id === id ? { ...g, title, category: cat, filename } : g);
    showAlert('galAlert', 'Gallery item updated.', 'success');
  } else {
    items.push({ id: Date.now(), title, category: cat, filename });
    showAlert('galAlert', 'Gallery item added.', 'success');
  }

  setData('inferno_gallery', items);
  renderGallery();
  renderStats();
  clearGalleryForm();
}

function editGalleryItem(id) {
  const items = getData('inferno_gallery') || [];
  const g = items.find(x => x.id === id);
  if (!g) return;
  document.getElementById('gal-id').value = g.id;
  document.getElementById('gal-title').value = g.title;
  document.getElementById('gal-cat').value = g.category;
  document.getElementById('gal-filename').value = g.filename;
}

function deleteGalleryItem(id) {
  if (!confirm('Delete this gallery item?')) return;
  let items = getData('inferno_gallery') || [];
  items = items.filter(g => g.id !== id);
  setData('inferno_gallery', items);
  renderGallery();
  renderStats();
}

function clearGalleryForm() {
  ['gal-id','gal-title','gal-cat','gal-filename'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

/* ══════════════════════════════════════════
   SETTINGS
══════════════════════════════════════════ */
function handleResetDefaults() {
  if (!confirm('This will reset ALL content to defaults and cannot be undone. Continue?')) return;
  resetToDefaults();
  renderAll();
  showAlert('settingsAlert', 'Content reset to defaults successfully.', 'success');
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

function renderAll() {
  renderStats();
  renderMessages();
  renderProjects();
  renderTestimonials();
  renderServices();
  renderGallery();
}

/* ══════════════════════════════════════════
   INIT — Called on dashboard load
══════════════════════════════════════════ */
function initDashboard() {
  if (!guardAuth()) return;

  // Seed default data on first visit
  seedDefaults();

  // Set admin username in UI
  const userEl = document.getElementById('adminUser');
  if (userEl) userEl.textContent = sessionStorage.getItem('inferno_admin_user') || 'admin';

  // Render all sections
  renderAll();

  // Show dashboard panel by default
  switchPanel('dashboard');
}
