(() => {
'use strict';
const P = window.PHOTOS, C = window.COLLECTIONS;
const $ = (s, e = document) => e.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const photo = id => P.find(p => p.id === +id);

// ---------- favourites (localStorage) ----------
const KEY = 'snapspace.favs';
let fav = [];
try { fav = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { fav = []; }
if (!Array.isArray(fav)) fav = [];
const isFav = id => fav.includes(id);

// ---------- images and fallbacks ----------
const src = (p, w) => p.src || `https://images.unsplash.com/photo-${p.u}?auto=format&fit=crop&w=${w}&q=75`;
const HUE = { Nature: 150, Architecture: 210, 'Street Photography': 30, Travel: 190, Portraits: 15 };
function fallback(p) {
  const h = HUE[p.c], H = Math.round(800 / p.r);
  return 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 ${H}'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${h} 16% 80%)'/><stop offset='1' stop-color='hsl(${h} 20% 55%)'/></linearGradient></defs><rect width='800' height='${H}' fill='url(#g)'/><text x='400' y='${H / 2}' text-anchor='middle' font-family='Georgia,serif' font-size='36' fill='#fff'>${esc(p.t)}</text></svg>`);
}
document.addEventListener('load', e => { if (e.target.tagName === 'IMG') e.target.classList.add('in'); }, true);
document.addEventListener('error', e => {
  const t = e.target;
  if (t.tagName === 'IMG' && t.dataset.id) { const u = fallback(photo(t.dataset.id)); if (t.src !== u) t.src = u; }
}, true);

// ---------- components ----------
const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
const favLabel = p => (isFav(p.id) ? 'Remove ' : 'Save ') + p.t + (isFav(p.id) ? ' from favourites' : ' to favourites');
const tile = p => `<figure class="tile" style="aspect-ratio:${p.r}"><button class="open" data-open="${p.id}" aria-label="View ${esc(p.t)} larger"><img src="${esc(src(p, 900))}" data-id="${p.id}" alt="${esc(p.t)}, ${esc(p.c)} photograph" loading="lazy" decoding="async"></button><button class="fv${isFav(p.id) ? ' on' : ''}" data-fav="${p.id}" aria-pressed="${isFav(p.id)}" aria-label="${esc(favLabel(p))}">${HEART}</button><figcaption><b>${esc(p.t)}</b><span>${esc(p.c)}</span></figcaption></figure>`;
let cur = [];   // photo ids currently shown, used for lightbox navigation
const count = c => P.filter(p => p.c === c).length;

// ---------- views ----------
function vHome() {
  const F = P.filter(p => p.f); cur = F.map(p => p.id);
  return `<section class="intro"><h1>Light, quietly observed.</h1><p class="lead">SnapSpace is a small photography studio working across landscapes, buildings, streets and people. Here is a selection of recent work.</p><a class="btn" href="#/gallery">View the full gallery</a></section>
  <section><div class="masonry">${F.map(tile).join('')}</div></section>
  <section><h2>Collections</h2>${C.map(c => `<a class="crow" href="#/gallery/${encodeURIComponent(c)}"><span>${c}</span><small>${count(c)} photographs</small></a>`).join('')}</section>`;
}
function vGallery(arg) {
  const f = arg ? decodeURIComponent(arg) : 'All';
  const list = f === 'favourites' ? P.filter(p => isFav(p.id)) : f === 'All' || !C.includes(f) ? P : P.filter(p => p.c === f);
  cur = list.map(p => p.id);
  const on = k => (k === f || (k === 'All' && !C.includes(f) && f !== 'favourites')) ? ' aria-current="page"' : '';
  const body = list.length ? `<div class="masonry">${list.map(tile).join('')}</div>` : `<div class="empty"><h2>No favourites yet</h2><p>Tap the heart on any photograph to save it here.</p><a class="btn" href="#/gallery">Browse the gallery</a></div>`;
  return `<h1>Gallery</h1><div class="filters" role="navigation" aria-label="Collections"><a href="#/gallery"${on('All')}>All</a>${C.map(c => `<a href="#/gallery/${encodeURIComponent(c)}"${on(c)}>${c}</a>`).join('')}<a href="#/gallery/favourites"${on('favourites')}>Favourites (<span id="fc">${fav.length}</span>)</a></div>${body}`;
}
function vAbout() {
  const p = photo(21); cur = [p.id];
  return `<div class="split"><div>${tile(p)}</div><div><h1>About the studio</h1><p class="lead">SnapSpace is a photography studio built around patient observation: waiting for the light, the moment and the right frame.</p><p>The work moves between quiet landscapes, architectural detail, unplanned street scenes and portraits made in natural light. Every photograph is edited by hand and kept deliberately natural.</p>
  <ul class="list"><li>Editorial and portrait commissions <span>Available</span></li><li>Architecture and interiors <span>Available</span></li><li>Prints and licensing <span>On request</span></li></ul><a class="btn" href="#/contact">Get in touch</a></div></div>`;
}
function vContact() {
  return `<h1>Contact</h1><p class="lead">Tell us about your project. This is a demo form: nothing is sent or stored.</p>
  <form id="cf" novalidate><label>Name<input name="name" autocomplete="name" aria-describedby="e-name"><span class="err" id="e-name"></span></label>
  <label>Email<input name="email" type="email" autocomplete="email" aria-describedby="e-email"><span class="err" id="e-email"></span></label>
  <label>Topic<select name="topic"><option>Booking a shoot</option><option>Print enquiry</option><option>Licensing</option><option>Something else</option></select></label>
  <label>Message<textarea name="message" aria-describedby="e-message"></textarea><span class="err" id="e-message"></span></label>
  <button class="btn" type="submit">Send message</button></form>`;
}

// ---------- contact form validation ----------
const rules = {
  name: v => v.trim().length < 2 ? 'Please enter your name.' : '',
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address, such as name@example.com.',
  message: v => v.trim().length < 10 ? 'Please write at least 10 characters.' : ''
};
function check(el) {
  const msg = rules[el.name] ? rules[el.name](el.value) : '';
  el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  $('#e-' + el.name).textContent = msg;
  return !msg;
}
document.addEventListener('focusout', e => { if (e.target.form && e.target.form.id === 'cf' && rules[e.target.name]) check(e.target); });
document.addEventListener('input', e => { if (rules[e.target.name] && e.target.getAttribute('aria-invalid') === 'true') check(e.target); });
document.addEventListener('submit', e => {
  if (e.target.id !== 'cf') return;
  e.preventDefault();
  const f = e.target, bad = ['name', 'email', 'message'].map(n => f.elements[n]).filter(el => !check(el));
  if (bad.length) { bad[0].focus(); return; }
  const name = esc(f.elements.name.value.trim());
  f.outerHTML = `<div class="ok" role="status" tabindex="-1" id="okbox"><h2>Thank you, ${name}</h2><p>This is a demo site, so your message was not sent. In a live version, this is where you would receive a confirmation.</p><button class="btn ghost" data-act="again">Fill in the form again</button></div>`;
  $('#okbox').focus();
});

// ---------- lightbox ----------
let idx = -1, opener = null;
const lb = $('#lb'), lbimg = $('#lbimg');
function showLb() {
  const p = photo(cur[idx]);
  lbimg.classList.remove('in'); lbimg.dataset.id = p.id; lbimg.alt = p.t + ', ' + p.c + ' photograph'; lbimg.src = src(p, 1800);
  $('#lbcap').innerHTML = `<b>${esc(p.t)}</b><span>${esc(p.c)}</span>`;
  $('#lbc').textContent = `${idx + 1} of ${cur.length}`;
  const b = $('#lbf'); b.setAttribute('aria-pressed', isFav(p.id)); b.textContent = isFav(p.id) ? 'Saved to favourites' : 'Save to favourites';
  $('#lbp').hidden = $('#lbn').hidden = cur.length < 2;
}
function openLb(id) {
  idx = cur.indexOf(+id); if (idx < 0) return;
  opener = document.activeElement; showLb(); lb.hidden = false; document.body.style.overflow = 'hidden'; $('#lbx').focus();
}
function closeLb() {
  if (lb.hidden) return;
  lb.hidden = true; document.body.style.overflow = '';
  if (opener && opener.focus) opener.focus();
  if (location.hash.startsWith('#/gallery/favourites')) render();
}
const step = d => { idx = (idx + d + cur.length) % cur.length; showLb(); };
document.addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') closeLb();
  else if (e.key === 'ArrowLeft') step(-1);
  else if (e.key === 'ArrowRight') step(1);
  else if (e.key === 'Tab') {
    const f = [...lb.querySelectorAll('button:not([hidden])')], i = f.indexOf(document.activeElement);
    e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
  }
});
let tx = 0;
lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); });
lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lbf')) closeLb(); });
$('#lbx').onclick = closeLb; $('#lbp').onclick = () => step(-1); $('#lbn').onclick = () => step(1);
$('#lbf').onclick = () => toggleFav(cur[idx]);

// ---------- favourites toggle ----------
function toggleFav(id) {
  id = +id;
  fav = isFav(id) ? fav.filter(x => x !== id) : [...fav, id];
  try { localStorage.setItem(KEY, JSON.stringify(fav)); } catch (e) {}
  const p = photo(id);
  document.querySelectorAll(`[data-fav="${id}"]`).forEach(b => { b.classList.toggle('on', isFav(id)); b.setAttribute('aria-pressed', isFav(id)); b.setAttribute('aria-label', favLabel(p)); });
  if ($('#fc')) $('#fc').textContent = fav.length;
  if (!lb.hidden) showLb(); else if (location.hash.startsWith('#/gallery/favourites')) render();
}

// ---------- router ----------
let last = '';
function render() {
  const [p, arg] = (location.hash.slice(2) || '').split('/');
  const r = p || 'home', V = { home: vHome, gallery: () => vGallery(arg), about: vAbout, contact: vContact };
  if (!lb.hidden && last !== location.hash) { lb.hidden = true; document.body.style.overflow = ''; }
  $('#app').innerHTML = (V[r] || vHome)();
  const T = { gallery: 'Gallery', about: 'About', contact: 'Contact' };
  document.title = (T[r] ? T[r] + ' – SnapSpace' : 'SnapSpace – Photography portfolio');
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('on', a.dataset.r === r));
  document.querySelectorAll('#app img').forEach(i => { if (i.complete && i.naturalWidth) i.classList.add('in'); });
  if (last !== location.hash) window.scrollTo(0, 0);
  last = location.hash;
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-open],[data-fav],[data-act]');
  if (!b) return;
  if (b.dataset.open) openLb(b.dataset.open);
  else if (b.dataset.fav) toggleFav(b.dataset.fav);
  else if (b.dataset.act === 'again') render();
});
window.addEventListener('hashchange', render);
render();
})();
