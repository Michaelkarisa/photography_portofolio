/**
 * INFERNO PHOTOGRAPHY — ADMIN JAVASCRIPT
 * All data reads/writes go to Supabase.
 * Every user action shows a visible toast notification.
 */

'use strict';

/* ══════════════════════════════════════════
   TOAST NOTIFICATION SYSTEM
══════════════════════════════════════════ */
function showToast(type, title, msg) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✓', error: '✗', info: 'ℹ', warning: '⚠' };
  const el = document.createElement('div');
  el.className = 'toast toast--' + type;
  el.innerHTML =
    '<span class="toast__icon">' + (icons[type] || '•') + '</span>' +
    '<div class="toast__body">' +
    (title ? '<div class="toast__title">' + title + '</div>' : '') +
    '<div class="toast__msg">' + msg + '</div>' +
    '</div>';
  container.appendChild(el);
  const timer = setTimeout(() => dismissToast(el), 4000);
  el.addEventListener('click', () => { clearTimeout(timer); dismissToast(el); });
}
function dismissToast(el) {
  el.classList.add('toast--out');
  setTimeout(() => el.remove(), 300);
}
const toast = {
  success: (msg, title) => showToast('success', title || 'Success', msg),
  error:   (msg, title) => showToast('error',   title || 'Error',   msg),
  info:    (msg, title) => showToast('info',     title || '',        msg),
  warning: (msg, title) => showToast('warning',  title || 'Warning', msg),
};

/* ══════════════════════════════════════════
   ACTIVITY LOG
══════════════════════════════════════════ */
const _activityLog = [];
function logActivity(type, msg) {
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  _activityLog.unshift({ type, msg, time });
  if (_activityLog.length > 40) _activityLog.pop();
  _renderActivityFeed();
}
function _renderActivityFeed() {
  const feed = document.getElementById('activityFeed');
  if (!feed) return;
  if (_activityLog.length === 0) {
    feed.innerHTML = '<p style="color:var(--grey-400);font-size:0.8rem;text-align:center;padding:16px;">No recent activity.</p>';
    return;
  }
  feed.innerHTML = _activityLog.slice(0, 15).map(function(a) {
    return '<div class="activity-item">' +
      '<div class="activity-dot activity-dot--' + a.type + '"></div>' +
      '<div class="activity-text">' + escHtml(a.msg) + '</div>' +
      '<div class="activity-time">' + a.time + '</div>' +
      '</div>';
  }).join('');
}

/* ══════════════════════════════════════════
   CONFIRM MODAL
══════════════════════════════════════════ */
var _confirmCb = null;
function showConfirm(title, body, confirmLabel, onConfirm) {
  var overlay = document.getElementById('confirm-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'confirm-modal-overlay';
    overlay.className = 'modal-overlay';
    overlay.innerHTML =
      '<div class="modal-box">' +
      '<h4 id="cm-title"></h4>' +
      '<p id="cm-body"></p>' +
      '<div class="modal-box__actions">' +
      '<button class="btn btn--outline btn--sm" id="cm-cancel">Cancel</button>' +
      '<button class="btn btn--danger btn--sm" id="cm-confirm">Delete</button>' +
      '</div></div>';
    document.body.appendChild(overlay);
    document.getElementById('cm-cancel').addEventListener('click', function() {
      overlay.style.display = 'none'; _confirmCb = null;
    });
    document.getElementById('cm-confirm').addEventListener('click', function() {
      overlay.style.display = 'none';
      if (_confirmCb) _confirmCb();
      _confirmCb = null;
    });
  }
  document.getElementById('cm-title').textContent   = title;
  document.getElementById('cm-body').textContent    = body;
  document.getElementById('cm-confirm').textContent = confirmLabel || 'Delete';
  _confirmCb = onConfirm;
  overlay.style.display = 'flex';
}

/* ══════════════════════════════════════════
   INLINE ALERT
══════════════════════════════════════════ */
function showAlert(elId, msg, type) {
  type = type || 'success';
  var el = document.getElementById(elId);
  if (!el) return;
  el.className = 'alert alert--' + type;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(function() { el.style.display = 'none'; }, 4500);
}

/* ══════════════════════════════════════════
   BUTTON LOADING
══════════════════════════════════════════ */
function btnLoading(btn, label) {
  if (!btn) return;
  btn._originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="btn-spinner"></span> ' + (label || 'Saving…');
}
function btnReset(btn) {
  if (!btn) return;
  btn.disabled = false;
  if (btn._originalHTML) btn.innerHTML = btn._originalHTML;
}

/* ══════════════════════════════════════════
   AUTH
══════════════════════════════════════════ */
async function handleLogin(e) {
  e.preventDefault();
  var email    = document.getElementById('username').value.trim();
  var password = document.getElementById('password').value;
  var errorEl  = document.getElementById('loginError');
  var btn      = document.querySelector('#loginForm button[type="submit"]');
  if (!email || !password) { showLoginError(errorEl, 'Please enter your email and password.'); return; }
  btnLoading(btn, 'Signing in…');
  try {
    var result = await window.supabaseClient.auth.signInWithPassword({ email, password });
    if (result.error || !result.data?.session) {
      showLoginError(errorEl, result.error?.message || 'Invalid credentials. Please try again.');
      document.getElementById('password').value = '';
      document.getElementById('password').focus();
      return;
    }
    window.location.href = 'dashboard.html';
  } catch (err) {
    console.error('[v0] Login error:', err);
    showLoginError(errorEl, 'Something went wrong. Please try again.');
  } finally {
    btnReset(btn);
    if (btn) btn.textContent = 'Sign In →';
  }
}
function showLoginError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
}
async function guardAuth() {
  try {
    var result = await window.supabaseClient.auth.getSession();
    if (!result.data.session) { window.location.href = 'index.html'; return false; }
    return true;
  } catch (err) { window.location.href = 'index.html'; return false; }
}
async function handleLogout() {
  showConfirm('Sign Out', 'Are you sure you want to sign out?', 'Sign Out', async function() {
    toast.info('Signing out…');
    try { await window.supabaseClient.auth.signOut(); } catch(e) {}
    window.location.href = 'index.html';
  });
}

/* ══════════════════════════════════════════
   NAV
══════════════════════════════════════════ */
function switchPanel(panelId) {
  document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
  var target = document.getElementById('panel-' + panelId);
  if (target) target.classList.add('active');
  document.querySelectorAll('.sidebar__link').forEach(function(l) { l.classList.remove('active'); });
  var link = document.querySelector('[data-panel="' + panelId + '"]');
  if (link) link.classList.add('active');
  var titles = { dashboard:'Dashboard', gallery:'Gallery', testimonials:'Testimonials',
    services:'Services', collections:'Collections', messages:'Messages',
    bookings:'Bookings', settings:'Settings', profile:'Photographer Profile', media:'Media' };
  var titleEl = document.getElementById('topbarTitle');
  if (titleEl) titleEl.textContent = titles[panelId] || 'Dashboard';
}

/* ══════════════════════════════════════════
   STATS
══════════════════════════════════════════ */
async function renderStats() {
  try {
    var fetchSvc = window.fetchAllServices || window.fetchServices;
    var results  = await Promise.all([window.fetchAllMedia(), window.fetchMessages(), fetchSvc()]);
    var media    = results[0], messages = results[1], services = results[2];
    var unread   = (messages || []).filter(function(m) { return !m.is_read; }).length;
    var el = function(id) { return document.getElementById(id); };
    if (el('stat-photos'))    el('stat-photos').textContent    = (media    || []).length;
    if (el('stat-inquiries')) el('stat-inquiries').textContent = (messages || []).length;
    if (el('stat-new'))       el('stat-new').textContent       = unread;
    if (el('stat-services'))  el('stat-services').textContent  = (services || []).filter(function(s){ return s.is_active !== false; }).length;
    var badge = document.getElementById('msgNavBadge');
    if (badge) { badge.textContent = unread > 0 ? unread : ''; badge.style.display = unread > 0 ? 'inline' : 'none'; }
  } catch (err) { console.error('[v0] renderStats:', err); }
}

/* ══════════════════════════════════════════
   MESSAGES
══════════════════════════════════════════ */
async function loadMessages() {
  var tbody = document.getElementById('messagesTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--grey-400);">Loading…</td></tr>';
  try {
    var messages = await window.fetchMessages();
    if (!messages || messages.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="color:var(--grey-400);text-align:center;padding:32px;">No messages yet.</td></tr>';
      return;
    }
    tbody.innerHTML = messages.map(function(m) {
      return '<tr style="' + (m.is_read ? '' : 'background:rgba(255,77,46,0.04);') + '">' +
        '<td><strong>' + escHtml(m.name) + '</strong></td>' +
        '<td style="color:var(--grey-500);font-size:0.83rem;">' + escHtml(m.email) + '</td>' +
        '<td>' + escHtml(m.subject || '—') + '</td>' +
        '<td style="max-width:200px;font-size:0.8rem;color:var(--grey-500);">' + escHtml((m.message || '').substring(0,80)) + ((m.message||'').length>80?'…':'') + '</td>' +
        '<td style="font-size:0.82rem;">' + new Date(m.created_at).toLocaleDateString() + '</td>' +
        '<td>' +
        '<span class="badge ' + (m.is_read ? 'badge--read' : 'badge--new') + '" style="margin-right:6px;">' + (m.is_read ? 'Read' : 'New') + '</span>' +
        (!m.is_read ? '<button class="btn btn--outline btn--sm" onclick="markRead(\'' + m.id + '\',this)">Mark Read</button>' : '') +
        '<button class="btn btn--danger btn--sm" style="margin-left:4px;" onclick="deleteMsg(\'' + m.id + '\',\'' + escHtml(m.name) + '\')">Delete</button>' +
        '</td></tr>';
    }).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" style="color:red;text-align:center;padding:32px;">Failed to load messages.</td></tr>';
    toast.error('Failed to load messages.');
  }
}
async function markRead(id, btn) {
  btnLoading(btn, 'Updating…');
  try {
    await window.markMessageAsRead(id);
    toast.success('Message marked as read.');
    logActivity('success', 'Message marked as read.');
    loadMessages(); loadDashboardMessages(); renderStats();
  } catch(e) { toast.error('Failed to mark as read.'); btnReset(btn); }
}
function deleteMsg(id, name) {
  showConfirm('Delete Message', 'Delete the message from "' + name + '"? This cannot be undone.', 'Delete', async function() {
    try {
      await window.deleteMessage(id);
      toast.success('Message from ' + name + ' deleted.');
      logActivity('info', 'Deleted message from ' + name);
      loadMessages(); loadDashboardMessages(); renderStats();
    } catch(e) { toast.error('Failed to delete message.'); }
  });
}

/* ══════════════════════════════════════════
   SERVICES
══════════════════════════════════════════ */
async function loadServices() {
  var list = document.getElementById('servicesList');
  if (!list) return;
  list.innerHTML = '<p style="color:var(--grey-400);">Loading…</p>';
  try {
    var fetchFn = window.fetchAllServices || window.fetchServices;
    var items = await fetchFn();
    if (!items || items.length === 0) { list.innerHTML = '<p style="color:var(--grey-400);">No services yet. Add one below.</p>'; return; }
    list.innerHTML = items.map(function(s) {
      return '<div class="item-row">' +
        '<div class="item-row__info">' +
        '<div class="item-row__title">' + escHtml(s.name) + (s.is_featured ? ' <span style="color:var(--ember);font-size:0.75rem;">★ Featured</span>' : '') + '</div>' +
        '<div class="item-row__meta">' +
        (s.category ? '<span style="background:var(--grey-100);padding:2px 6px;border-radius:4px;font-size:0.75rem;">' + escHtml(s.category) + '</span> ' : '') +
        (s.base_price ? 'KES ' + Number(s.base_price).toLocaleString() : '') +
        (s.is_active ? '' : ' · <span style="color:var(--grey-400);">Inactive</span>') +
        '</div>' +
        (s.description ? '<div style="font-size:0.8rem;color:var(--grey-500);margin-top:4px;">' + escHtml(s.description) + '</div>' : '') +
        '</div>' +
        '<div class="item-row__actions">' +
        '<button class="btn btn--outline btn--sm" onclick="editService(\'' + s.id + '\')">Edit</button>' +
        '<button class="btn btn--danger btn--sm" onclick="removeService(\'' + s.id + '\',\'' + escHtml(s.name) + '\')">Delete</button>' +
        '</div></div>';
    }).join('');
  } catch(e) { toast.error('Failed to load services.'); }
}
async function saveService() {
  var id       = document.getElementById('svc-id')?.value;
  var name     = document.getElementById('svc-name')?.value.trim();
  if (!name) { toast.warning('Service name is required.'); return; }
  var payload = {
    name, category: document.getElementById('svc-category')?.value.trim() || null,
    base_price: parseFloat((document.getElementById('svc-price')?.value||'').replace(/[^0-9.]/g,'')) || null,
    turnaround: document.getElementById('svc-turn')?.value.trim() || null,
    description: document.getElementById('svc-desc')?.value.trim() || null,
    items_offered: (document.getElementById('svc-items')?.value||'').split('\n').map(function(s){return s.trim();}).filter(Boolean),
    is_active: document.getElementById('svc-featured')?.checked ?? true,
    is_featured: document.getElementById('svc-is-featured')?.checked ?? false,
  };
  var btn = document.querySelector('[onclick="saveService()"]');
  btnLoading(btn, id ? 'Updating…' : 'Saving…');
  try {
    if (id) { await window.updateService(id, payload); showAlert('svcAlert','✓ Service updated.','success'); toast.success('Service "'+name+'" updated.'); logActivity('success','Updated service: '+name); }
    else    { await window.createService(payload);     showAlert('svcAlert','✓ Service added.', 'success'); toast.success('Service "'+name+'" added.');   logActivity('success','Added service: '+name); }
    clearServiceForm(); loadServices(); renderStats();
  } catch(e) { showAlert('svcAlert','Error saving service.','error'); toast.error('Failed to save service.'); }
  finally { btnReset(btn); }
}
function editService(id) {
  (window.fetchAllServices || window.fetchServices)().then(function(items) {
    var s = items.find(function(x){ return x.id === id; });
    if (!s) return;
    var set = function(elId, val) { var el = document.getElementById(elId); if (el) el.value = val || ''; };
    set('svc-id',s.id); set('svc-name',s.name); set('svc-category',s.category); set('svc-price',s.base_price||'');
    set('svc-turn',s.turnaround||''); set('svc-desc',s.description||'');
    set('svc-items', Array.isArray(s.items_offered) ? s.items_offered.join('\n') : '');
    if (document.getElementById('svc-featured'))    document.getElementById('svc-featured').checked    = s.is_active;
    if (document.getElementById('svc-is-featured')) document.getElementById('svc-is-featured').checked = s.is_featured;
    document.getElementById('svc-name')?.scrollIntoView({ behavior:'smooth', block:'center' });
    toast.info('Editing service: ' + s.name);
  });
}
function removeService(id, name) {
  showConfirm('Delete Service','Delete "' + name + '"? This cannot be undone.','Delete', async function() {
    try { await window.deleteService(id); toast.success('Service "'+name+'" deleted.'); logActivity('info','Deleted service: '+name); loadServices(); renderStats(); }
    catch(e) { toast.error('Failed to delete service.'); }
  });
}
function clearServiceForm() {
  ['svc-id','svc-name','svc-category','svc-price','svc-turn','svc-desc','svc-items'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.value='';
  });
  if(document.getElementById('svc-featured'))    document.getElementById('svc-featured').checked    = true;
  if(document.getElementById('svc-is-featured')) document.getElementById('svc-is-featured').checked = false;
}

/* ══════════════════════════════════════════
   TESTIMONIALS
══════════════════════════════════════════ */
async function loadTestimonials() {
  var list = document.getElementById('testimonialsList');
  if (!list) return;
  list.innerHTML = '<p style="color:var(--grey-400);">Loading…</p>';
  try {
    var items = await window.fetchTestimonials();
    if (!items || items.length === 0) { list.innerHTML = '<p style="color:var(--grey-400);">No testimonials yet. Add one below.</p>'; return; }
    list.innerHTML = items.map(function(t) {
      return '<div class="item-row">' +
        '<div class="item-row__info">' +
        '<div class="item-row__title">' + escHtml(t.client_name) + (t.is_featured ? ' · <span style="color:var(--ember)">★ Featured</span>' : '') + '</div>' +
        '<div class="item-row__meta">' + escHtml(t.client_title||'') + '</div>' +
        '<div style="font-size:0.8rem;color:var(--grey-500);margin-top:4px;">"' + escHtml((t.quote||'').substring(0,90)) + ((t.quote||'').length>90?'…':'') + '"</div>' +
        '</div><div class="item-row__actions">' +
        '<button class="btn btn--outline btn--sm" onclick="editTestimonial(\'' + t.id + '\')">Edit</button>' +
        '<button class="btn btn--danger btn--sm" onclick="removeTestimonial(\'' + t.id + '\',\'' + escHtml(t.client_name) + '\')">Delete</button>' +
        '</div></div>';
    }).join('');
  } catch(e) { toast.error('Failed to load testimonials.'); }
}
async function saveTestimonial() {
  var id    = document.getElementById('test-id')?.value;
  var name  = document.getElementById('test-name')?.value.trim();
  var role  = document.getElementById('test-role')?.value.trim();
  var quote = document.getElementById('test-quote')?.value.trim();
  var feat  = document.getElementById('test-featured')?.checked ?? false;
  if (!name)  { toast.warning('Client name is required.');       return; }
  if (!quote) { toast.warning('Testimonial quote is required.'); return; }
  var payload = { client_name:name, client_title:role, quote, is_featured:feat, is_approved:true };
  var btn = document.querySelector('[onclick="saveTestimonial()"]');
  btnLoading(btn, id ? 'Updating…' : 'Saving…');
  try {
    if (id) { await window.updateTestimonial(id, payload); showAlert('testAlert','✓ Testimonial updated.','success'); toast.success('Testimonial by '+name+' updated.'); logActivity('success','Updated testimonial: '+name); }
    else    { await window.createTestimonial(payload);     showAlert('testAlert','✓ Testimonial added.', 'success'); toast.success('Testimonial by '+name+' added.');   logActivity('success','Added testimonial: '+name); }
    clearTestimonialForm(); loadTestimonials();
  } catch(e) { showAlert('testAlert','Error saving testimonial.','error'); toast.error('Failed to save testimonial.'); }
  finally { btnReset(btn); }
}
function editTestimonial(id) {
  window.fetchTestimonials().then(function(items) {
    var t = items.find(function(x){ return x.id === id; });
    if (!t) return;
    document.getElementById('test-id').value    = t.id;
    document.getElementById('test-name').value  = t.client_name;
    document.getElementById('test-role').value  = t.client_title || '';
    document.getElementById('test-quote').value = t.quote;
    if (document.getElementById('test-featured')) document.getElementById('test-featured').checked = t.is_featured;
    document.getElementById('test-name')?.scrollIntoView({ behavior:'smooth', block:'center' });
    toast.info('Editing testimonial by ' + t.client_name);
  });
}
function removeTestimonial(id, name) {
  showConfirm('Delete Testimonial','Remove the testimonial by "' + name + '"? This cannot be undone.','Delete', async function() {
    try { await window.deleteTestimonial(id); toast.success('Testimonial by '+name+' deleted.'); logActivity('info','Deleted testimonial: '+name); loadTestimonials(); }
    catch(e) { toast.error('Failed to delete testimonial.'); }
  });
}
function clearTestimonialForm() {
  ['test-id','test-name','test-role','test-quote'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
  if(document.getElementById('test-featured')) document.getElementById('test-featured').checked = false;
}

/* ══════════════════════════════════════════
   BOOKINGS
══════════════════════════════════════════ */
async function loadBookings() {
  var tbody = document.getElementById('bookingsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--grey-400);">Loading…</td></tr>';
  try {
    var bookings = await window.fetchBookings();
    if (!bookings || bookings.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="color:var(--grey-400);text-align:center;padding:32px;">No bookings yet.</td></tr>'; return; }
    tbody.innerHTML = bookings.map(function(b) {
      return '<tr><td><strong>' + escHtml(b.client_name) + '</strong></td>' +
        '<td>' + escHtml(b.client_email) + '</td><td>' + escHtml(b.services?.name||'—') + '</td>' +
        '<td>' + (b.event_date ? new Date(b.event_date).toLocaleDateString() : '—') + '</td>' +
        '<td><span class="badge badge--' + b.status + '">' + escHtml(b.status) + '</span></td>' +
        '<td><select onchange="updateStatus(\'' + b.id + '\',this.value,this)" style="font-size:0.8rem;padding:5px 8px;border-radius:4px;border:1px solid var(--grey-200);">' +
        ['pending','confirmed','in-progress','completed','cancelled'].map(function(s){ return '<option value="'+s+'"'+(b.status===s?' selected':'')+'>'+s+'</option>'; }).join('') +
        '</select><button class="btn btn--danger btn--sm" style="margin-left:4px;" onclick="removeBooking(\'' + b.id + '\',\'' + escHtml(b.client_name) + '\')">Delete</button></td></tr>';
    }).join('');
  } catch(e) { toast.error('Failed to load bookings.'); }
}
async function updateStatus(id, status) {
  try { await window.updateBookingStatus(id, status); toast.success('Booking status updated to "' + status + '".'); logActivity('success','Booking status → '+status); loadBookings(); renderStats(); }
  catch(e) { toast.error('Failed to update booking status.'); }
}
function removeBooking(id, name) {
  showConfirm('Delete Booking','Delete booking from "' + name + '"?','Delete', async function() {
    try {
      var r = await window.supabaseClient.from('bookings').delete().eq('id',id);
      if (r.error) throw r.error;
      toast.success('Booking from ' + name + ' deleted.'); logActivity('info','Deleted booking: '+name); loadBookings(); renderStats();
    } catch(e) { toast.error('Failed to delete booking.'); }
  });
}

/* ══════════════════════════════════════════
   MEDIA — Supabase + Cloudinary
══════════════════════════════════════════ */
async function loadMediaGallery() {
  var gallery = document.getElementById('mediaGallery');
  if (!gallery) return;
  gallery.innerHTML = '<p style="color:var(--grey-400);grid-column:1/-1;padding:24px;">Loading…</p>';
  try {
    var items = await window.fetchAllMedia();
    if (!items || items.length === 0) { gallery.innerHTML = '<p style="color:var(--grey-400);grid-column:1/-1;padding:24px;">No media uploaded yet.</p>'; return; }
    gallery.innerHTML = items.map(function(item) {
      var media = item.media_type === 'video'
        ? '<video src="' + escHtml(item.url) + '" style="width:100%;height:100%;object-fit:cover;" muted></video>'
        : '<img src="' + escHtml(item.url) + '" alt="' + escHtml(item.caption||'') + '" loading="lazy" />';
      return '<div class="media-thumb">' + media +
        '<div class="media-thumb__overlay">' +
        '<span class="media-thumb__caption">' + escHtml(item.caption||'Untitled') + '</span>' +
        '<button class="media-thumb__del" onclick="deleteMediaFromAdmin(\'' + item.id + '\',\'' + escHtml(item.caption||'this item') + '\')">✕ Delete</button>' +
        '</div></div>';
    }).join('');
  } catch(e) { gallery.innerHTML = '<p style="color:red;grid-column:1/-1;padding:24px;">Failed to load media.</p>'; toast.error('Failed to load media gallery.'); }
}

async function uploadMediaItem() {
  var fileInput  = document.getElementById('mediaFile');
  var caption    = (document.getElementById('mediaCaption')?.value || '').trim();
  var category   = (document.getElementById('mediaCategory')?.value || '').trim();
  var statusEl   = document.getElementById('uploadStatus');
  var uploadBtn  = document.getElementById('uploadButton');
  var progWrap   = document.getElementById('uploadProgressWrap');
  var progBar    = document.getElementById('uploadProgressBar');
  if (!fileInput?.files.length) { toast.warning('Please select a file to upload.'); return; }
  if (!category)                { toast.warning('Please select a category.'); return; }
  var file       = fileInput.files[0];
  var validation = validateImageFile(file);
  if (!validation.valid) { toast.warning(validation.error); return; }
  btnLoading(uploadBtn, 'Uploading…');
  if (statusEl) { statusEl.textContent = 'Uploading to Cloudinary…'; statusEl.style.color = 'var(--grey-500)'; }
  if (progWrap) progWrap.style.display = 'block';
  var pct = 0;
  var interval = setInterval(function() {
    pct = Math.min(pct + Math.random() * 15 + 5, 90);
    if (progBar) progBar.style.width = pct + '%';
  }, 200);
  try {
    var cloudRes = await uploadToCloudinary(file, 'inferno_pictures');
    clearInterval(interval);
    if (progBar) progBar.style.width = '95%';
    if (statusEl) statusEl.textContent = 'Saving to database…';
    var mediaItem = await window.createMediaItem(cloudRes.url, cloudRes.public_id, category,
      caption || (category + ' ' + (validation.type==='video' ? 'Video' : 'Photo')),
      cloudRes.resource_type || validation.type);
    if (mediaItem) {
      if (progBar) progBar.style.width = '100%';
      setTimeout(function(){ if(progWrap) progWrap.style.display='none'; if(progBar) progBar.style.width='0%'; }, 500);
      if (statusEl) { statusEl.textContent = '✓ Uploaded successfully!'; statusEl.style.color = 'var(--ember)'; }
      fileInput.value = '';
      if (document.getElementById('mediaCaption'))  document.getElementById('mediaCaption').value  = '';
      if (document.getElementById('mediaCategory')) document.getElementById('mediaCategory').value = '';
      var pw = document.getElementById('mediaPreviewWrap'); if(pw) pw.style.display='none';
      toast.success('"' + (caption||category+' photo') + '" uploaded to gallery.');
      logActivity('success','Uploaded media: '+(caption||category+' photo'));
      await loadMediaGallery(); renderStats();
      setTimeout(function(){ if(statusEl) statusEl.textContent=''; }, 3500);
    } else { throw new Error('Failed to save to database'); }
  } catch(err) {
    clearInterval(interval);
    if(progWrap) progWrap.style.display='none'; if(progBar) progBar.style.width='0%';
    if(statusEl){ statusEl.textContent='✗ Upload failed: '+err.message; statusEl.style.color='#dc2626'; }
    toast.error('Upload failed: '+err.message);
    logActivity('error','Upload failed: '+err.message);
  } finally { btnReset(uploadBtn); }
}

function deleteMediaFromAdmin(mediaId, caption) {
  showConfirm('Delete Media','Delete "'+caption+'"? This removes it from Cloudinary and your gallery.','Delete', async function() {
    try {
      var ok = await window.deleteMediaItem(mediaId);
      if (ok) { toast.success('"'+caption+'" deleted.'); logActivity('info','Deleted media: '+caption); await loadMediaGallery(); renderStats(); }
      else { toast.error('Failed to delete media.'); }
    } catch(e) { toast.error('Failed to delete media.'); }
  });
}

/* ══════════════════════════════════════════
   PROFILE
══════════════════════════════════════════ */
async function loadProfileForm() {
  try {
    var profile = await window.fetchPhotographerProfile();
    if (!profile) return;
    var set = function(id,val){ var el=document.getElementById(id); if(el) el.value=val||''; };
    set('profileName',profile.name); set('profileBio',profile.bio); set('profileLocation',profile.location);
    set('profileInstagram',profile.instagram_handle); set('profileTwitter',profile.twitter_handle);
    set('profileLinkedin',profile.linkedin_handle); set('profilePortfolio',profile.portfolio_url);
    if(document.getElementById('profileServices')) document.getElementById('profileServices').value=(profile.services_offered||[]).join(', ');
    loadLogoPreview();
  } catch(e) { console.error('[v0] loadProfileForm:',e); }
}
async function handleSaveProfile() {
  var g = function(id){ return (document.getElementById(id)?.value||'').trim(); };
  var profileData = {
    name:g('profileName'), bio:g('profileBio'), location:g('profileLocation'),
    about_title:g('profileAboutTitle').replace(/\\n/g,'\n'), about_body:g('profileAboutBody'),
    philosophy:g('profilePhilosophy'), clients_note:g('profileClientsNote'),
    email:g('profileEmail'), phone:g('profilePhone'),
    instagram_handle:g('profileInstagram'), twitter_handle:g('profileTwitter'),
    linkedin_handle:g('profileLinkedin'), facebook_handle:g('profileFacebook'),
    portfolio_url:g('profilePortfolio'),
    services_offered:g('profileServices').split(',').map(function(s){return s.trim();}).filter(Boolean),
    skills:g('profileSkills').split(',').map(function(s){return s.trim();}).filter(Boolean),
  };
  if (!profileData.name) { toast.warning('Name is required.'); return; }
  var btn = document.querySelector('[onclick="handleSaveProfile()"]');
  btnLoading(btn, 'Saving…');
  try {
    var result = await window.savePhotographerProfile(profileData);
    if (result) { showAlert('profileAlert','✓ Profile saved!','success'); toast.success('Profile for "'+profileData.name+'" saved.'); logActivity('success','Profile updated: '+profileData.name); }
    else { showAlert('profileAlert','Failed to save profile.','error'); toast.error('Failed to save profile.'); }
  } catch(e) { showAlert('profileAlert','Error: '+e.message,'error'); toast.error('Error saving profile.'); }
  finally { btnReset(btn); }
}

/* ══════════════════════════════════════════
   LOGO UPLOAD
══════════════════════════════════════════ */
async function handleLogoUpload() {
  var fileInput = document.getElementById('logoFile');
  var statusEl  = document.getElementById('logoUploadStatus');
  var uploadBtn = document.getElementById('uploadLogoButton');
  if (!fileInput?.files.length) { toast.warning('Please select a logo file.'); return; }
  var file = fileInput.files[0];
  if (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)) { toast.warning('Please upload JPEG, PNG, WebP, or GIF.'); return; }
  if (file.size > 10*1024*1024) { toast.warning('File exceeds 10MB.'); return; }
  btnLoading(uploadBtn,'Uploading…');
  if(statusEl){ statusEl.textContent='Uploading to Cloudinary…'; statusEl.style.color='var(--grey-500)'; }
  try {
    var res = await uploadToCloudinary(file,'inferno_pictures_logos');
    if(statusEl) statusEl.textContent='Saving to database…';
    var saved = await window.updateLogoUrl(res.url);
    if (saved) {
      if(statusEl){ statusEl.textContent='✓ Logo uploaded!'; statusEl.style.color='var(--ember)'; }
      fileInput.value=''; loadLogoPreview();
      toast.success('Logo updated successfully.'); logActivity('success','Logo uploaded.');
      setTimeout(function(){ if(statusEl) statusEl.textContent=''; },3000);
    } else { throw new Error('Failed to save logo URL'); }
  } catch(e) {
    if(statusEl){ statusEl.textContent='✗ Upload failed: '+e.message; statusEl.style.color='#dc2626'; }
    toast.error('Logo upload failed: '+e.message); logActivity('error','Logo upload failed.');
  } finally { btnReset(uploadBtn); }
}
async function loadLogoPreview() {
  try {
    var profile = await window.fetchPhotographerProfile();
    var preview = document.getElementById('logoPreview');
    var noLogo  = document.getElementById('noLogo');
    if (!preview) return;
    if (profile?.logo_url) { preview.src=profile.logo_url; preview.style.display='block'; if(noLogo) noLogo.style.display='none'; }
    else { preview.style.display='none'; if(noLogo) noLogo.style.display='block'; }
  } catch(e) { console.error('[v0] loadLogoPreview:',e); }
}

/* ══════════════════════════════════════════
   AVATAR UPLOAD
══════════════════════════════════════════ */
async function handleAvatarUpload() {
  var fileInput = document.getElementById('avatarFile');
  var statusEl  = document.getElementById('avatarUploadStatus');
  var uploadBtn = document.getElementById('uploadAvatarButton');
  if (!fileInput?.files.length) { toast.warning('Please select an avatar file.'); return; }
  var file = fileInput.files[0];
  if (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)) { toast.warning('Please upload JPEG, PNG, WebP, or GIF.'); return; }
  if (file.size > 10*1024*1024) { toast.warning('File exceeds 10MB.'); return; }
  btnLoading(uploadBtn,'Uploading…');
  if(statusEl){ statusEl.textContent='Uploading…'; statusEl.style.color='var(--grey-500)'; }
  try {
    var res   = await uploadToCloudinary(file,'inferno_avatars');
    var saved = await window.updateAvatarUrl(res.url);
    if (saved) {
      if(statusEl){ statusEl.textContent='✓ Avatar uploaded!'; statusEl.style.color='var(--ember)'; }
      fileInput.value=''; loadAvatarPreview();
      toast.success('Profile avatar updated.'); logActivity('success','Avatar uploaded.');
      setTimeout(function(){ if(statusEl) statusEl.textContent=''; },3000);
    } else { throw new Error('Failed to save avatar URL'); }
  } catch(e) {
    if(statusEl){ statusEl.textContent='✗ Upload failed: '+e.message; statusEl.style.color='#dc2626'; }
    toast.error('Avatar upload failed: '+e.message);
  } finally { btnReset(uploadBtn); }
}
async function loadAvatarPreview() {
  try {
    var profile = await window.fetchPhotographerProfile();
    var preview = document.getElementById('avatarPreview');
    var initial = document.getElementById('avatarInitial');
    if (!preview) return;
    if (profile?.avatar_url) { preview.src=profile.avatar_url; preview.style.display='block'; if(initial) initial.style.display='none'; }
    else { preview.style.display='none'; if(initial){ initial.style.display=''; initial.textContent=profile?.name?profile.name.charAt(0).toUpperCase():'?'; } }
  } catch(e) { console.error('[v0] loadAvatarPreview:',e); }
}

/* ══════════════════════════════════════════
   COLLECTIONS CRUD
══════════════════════════════════════════ */
async function loadCollectionsAdmin() {
  var list = document.getElementById('collectionsList');
  if (!list) return;
  list.innerHTML = '<p style="color:var(--grey-400);">Loading…</p>';
  try {
    var items = await window.fetchAllCollections();
    if (!items || items.length === 0) { list.innerHTML = '<p style="color:var(--grey-400);">No collections yet. Add one below.</p>'; return; }
    list.innerHTML = items.map(function(c) {
      var thumb = c.image_url
        ? '<img src="'+escHtml(c.image_url)+'" style="width:56px;height:40px;object-fit:cover;border-radius:4px;flex-shrink:0;" />'
        : '<div style="width:56px;height:40px;background:var(--grey-100);border-radius:4px;flex-shrink:0;"></div>';
      return '<div class="item-row">' +
        '<div class="item-row__info" style="display:flex;align-items:center;gap:12px;">' + thumb +
        '<div><div class="item-row__title">' + escHtml(c.title) + (!c.is_active?' <span style="color:var(--grey-400);font-size:0.75rem;">Inactive</span>':'') + '</div>' +
        '<div class="item-row__meta">' + escHtml(c.series_label||'') + (c.description?' · '+escHtml(c.description.substring(0,60))+'…':'') + '</div></div></div>' +
        '<div class="item-row__actions">' +
        '<button class="btn btn--outline btn--sm" onclick="editCollection(\'' + c.id + '\')">Edit</button>' +
        '<button class="btn btn--danger btn--sm" onclick="removeCollection(\'' + c.id + '\',\'' + escHtml(c.title) + '\')">Delete</button>' +
        '</div></div>';
    }).join('');
  } catch(e) { list.innerHTML='<p style="color:red;">Failed to load collections.</p>'; toast.error('Failed to load collections.'); }
}
async function saveCollection() {
  var id    = document.getElementById('col-id')?.value;
  var title = document.getElementById('col-title')?.value.trim();
  if (!title) { toast.warning('Collection title is required.'); return; }
  var g = function(elId){ return (document.getElementById(elId)?.value||'').trim(); };
  var imageFile = document.getElementById('col-image-file')?.files[0];
  var imageUrl=null, imagePubId=null;
  var btn = document.querySelector('[onclick="saveCollection()"]');
  if (imageFile) {
    var stEl = document.getElementById('colImageStatus');
    if(stEl){ stEl.textContent='Uploading image…'; stEl.style.color='var(--grey-500)'; }
    btnLoading(btn,'Uploading image…');
    try {
      var r = await uploadToCloudinary(imageFile,'inferno_collections');
      imageUrl=r.url; imagePubId=r.public_id;
      if(stEl){ stEl.textContent='✓ Image uploaded'; stEl.style.color='var(--ember)'; }
    } catch(e) { toast.error('Image upload failed: '+e.message); btnReset(btn); return; }
  }
  if (!imageUrl && id) {
    var all = await window.fetchAllCollections();
    var ex  = all.find(function(c){ return c.id===id; });
    imageUrl = ex?.image_url || null;
  }
  var payload = { title,
    series_label:g('col-series-label')||null, description:g('col-description')||null,
    tagline:g('col-tagline')||null, link_label:g('col-link-label')||'See full series',
    link_url:g('col-link-url')||'#contact', sort_order:parseInt(g('col-sort-order'))||0,
    is_active:document.getElementById('col-active')?.checked??true,
    image_url:imageUrl, cloudinary_public_id:imagePubId||null };
  btnLoading(btn, id?'Updating…':'Saving…');
  try {
    if (id) { await window.updateCollection(id,payload); showAlert('colAlert','✓ Collection updated.','success'); toast.success('Collection "'+title+'" updated.'); logActivity('success','Updated collection: '+title); }
    else    { await window.createCollection(payload);    showAlert('colAlert','✓ Collection added.', 'success'); toast.success('Collection "'+title+'" added.');   logActivity('success','Added collection: '+title); }
    clearCollectionForm(); loadCollectionsAdmin();
  } catch(e) { showAlert('colAlert','Error saving collection.','error'); toast.error('Failed to save collection.'); }
  finally { btnReset(btn); }
}
function editCollection(id) {
  window.fetchAllCollections().then(function(items) {
    var c = items.find(function(x){ return x.id===id; });
    if (!c) return;
    var set=function(elId,val){ var el=document.getElementById(elId); if(el) el.value=val||''; };
    set('col-id',c.id); set('col-title',c.title); set('col-series-label',c.series_label);
    set('col-description',c.description); set('col-tagline',c.tagline);
    set('col-link-label',c.link_label); set('col-link-url',c.link_url); set('col-sort-order',c.sort_order);
    if(document.getElementById('col-active')) document.getElementById('col-active').checked=c.is_active;
    var prev=document.getElementById('colImagePreview');
    if(prev&&c.image_url) prev.innerHTML='<img src="'+escHtml(c.image_url)+'" style="max-width:200px;max-height:120px;border-radius:6px;object-fit:cover;margin-bottom:8px;" />';
    document.getElementById('col-title')?.scrollIntoView({ behavior:'smooth', block:'center' });
    toast.info('Editing collection: '+c.title);
  });
}
function removeCollection(id, title) {
  showConfirm('Delete Collection','Delete "'+title+'"? This cannot be undone.','Delete', async function() {
    try { await window.deleteCollection(id); toast.success('Collection "'+title+'" deleted.'); logActivity('info','Deleted collection: '+title); loadCollectionsAdmin(); }
    catch(e) { toast.error('Failed to delete collection.'); }
  });
}
function clearCollectionForm() {
  ['col-id','col-title','col-series-label','col-description','col-tagline','col-link-label','col-link-url','col-sort-order'].forEach(function(id){
    var el=document.getElementById(id);
    if(el) el.value = id==='col-link-label'?'See full series':id==='col-link-url'?'#contact':'';
  });
  if(document.getElementById('col-active')) document.getElementById('col-active').checked=true;
  if(document.getElementById('col-image-file')) document.getElementById('col-image-file').value='';
  var prev=document.getElementById('colImagePreview'); if(prev) prev.innerHTML='';
  var st=document.getElementById('colImageStatus'); if(st) st.textContent='';
}

/* ══════════════════════════════════════════
   PROFILE PANEL FULL
══════════════════════════════════════════ */
async function loadProfilePanelFull() {
  try {
    var profile = await window.fetchPhotographerProfile();
    if (!profile) return;
    var set=function(id,val){ var el=document.getElementById(id); if(el) el.value=val||''; };
    set('profileName',profile.name); set('profileBio',profile.bio); set('profileLocation',profile.location);
    set('profileAboutTitle',profile.about_title); set('profileAboutBody',profile.about_body);
    set('profilePhilosophy',profile.philosophy); set('profileClientsNote',profile.clients_note);
    set('profileEmail',profile.email); set('profilePhone',profile.phone);
    set('profileInstagram',profile.instagram_handle); set('profileTwitter',profile.twitter_handle);
    set('profileLinkedin',profile.linkedin_handle); set('profileFacebook',profile.facebook_handle);
    set('profilePortfolio',profile.portfolio_url);
    if(document.getElementById('profileServices')) document.getElementById('profileServices').value=(profile.services_offered||[]).join(', ');
    if(document.getElementById('profileSkills'))   document.getElementById('profileSkills').value=(profile.skills||[]).join(', ');
    await window.loadLogoPreview();
    await loadAvatarPreview();
  } catch(e) { console.error('[v0] loadProfilePanelFull:',e); }
}

/* ══════════════════════════════════════════
   SETTINGS
══════════════════════════════════════════ */
async function loadSettingsPanel() {
  try {
    var r = await window.supabaseClient.auth.getUser();
    var emailEl = document.getElementById('settingsEmail');
    if(emailEl && r.data.user?.email) emailEl.textContent = r.data.user.email;
  } catch(e) { console.error('[v0] loadSettingsPanel:',e); }
}
async function handleChangePassword() {
  var newPwd = (document.getElementById('newPassword')?.value||'').trim();
  if (!newPwd || newPwd.length < 6) { showAlert('passwordAlert','Password must be at least 6 characters.','error'); toast.warning('Password must be at least 6 characters.'); return; }
  var btn = document.querySelector('[onclick="handleChangePassword()"]');
  btnLoading(btn,'Updating…');
  try {
    var r = await window.supabaseClient.auth.updateUser({ password: newPwd });
    if (r.error) { showAlert('passwordAlert','Error: '+r.error.message,'error'); toast.error('Password update failed.'); }
    else { showAlert('passwordAlert','✓ Password updated successfully.','success'); document.getElementById('newPassword').value=''; toast.success('Admin password changed.'); logActivity('success','Admin password updated.'); }
  } catch(e) { showAlert('passwordAlert','Something went wrong.','error'); toast.error('Error updating password.'); }
  finally { btnReset(btn); }
}

/* ══════════════════════════════════════════
   PASSWORD TOGGLE
══════════════════════════════════════════ */
function togglePassword() {
  var p=document.getElementById('password'), eo=document.getElementById('eyeOpen'), ec=document.getElementById('eyeClosed');
  if(p.type==='password'){ p.type='text'; eo.style.display='none'; ec.style.display='block'; }
  else { p.type='password'; eo.style.display='block'; ec.style.display='none'; }
}

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
function escHtml(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
async function initDashboard() {
  var authed = await guardAuth();
  if (!authed) return;
  try {
    var r = await window.supabaseClient.auth.getUser();
    var userEl = document.getElementById('adminUser');
    if(userEl && r.data.user?.email) userEl.textContent = r.data.user.email;
  } catch(e) { console.error('[v0] Could not fetch user:',e); }
  switchPanel('dashboard');
  await renderStats();
}

/* ══════════════════════════════════════════
   GLOBAL EXPORTS
══════════════════════════════════════════ */
window.switchPanel=switchPanel; window.handleLogout=handleLogout; window.handleSaveProfile=handleSaveProfile;
window.handleLogoUpload=handleLogoUpload; window.loadLogoPreview=loadLogoPreview; window.loadProfileForm=loadProfileForm;
window.uploadMediaItem=uploadMediaItem; window.loadMediaGallery=loadMediaGallery; window.deleteMediaFromAdmin=deleteMediaFromAdmin;
window.saveService=saveService; window.editService=editService; window.removeService=removeService; window.clearServiceForm=clearServiceForm;
window.saveTestimonial=saveTestimonial; window.editTestimonial=editTestimonial; window.removeTestimonial=removeTestimonial; window.clearTestimonialForm=clearTestimonialForm;
window.loadBookings=loadBookings; window.updateStatus=updateStatus; window.removeBooking=removeBooking;
window.markRead=markRead; window.deleteMsg=deleteMsg; window.loadMessages=loadMessages; window.renderStats=renderStats;
window.handleAvatarUpload=handleAvatarUpload; window.loadAvatarPreview=loadAvatarPreview;
window.loadCollectionsAdmin=loadCollectionsAdmin; window.saveCollection=saveCollection;
window.editCollection=editCollection; window.removeCollection=removeCollection; window.clearCollectionForm=clearCollectionForm;
window.loadProfilePanelFull=loadProfilePanelFull; window.loadSettingsPanel=loadSettingsPanel;
window.handleChangePassword=handleChangePassword; window.showToast=showToast; window.toast=toast; window.logActivity=logActivity;
