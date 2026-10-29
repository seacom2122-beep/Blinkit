'use strict';

/* ---------- Config & data ---------- */
const CONFIG = { currency: 'INR', locale: 'en-IN' };
const fmt = n => new Intl.NumberFormat(CONFIG.locale, { style: 'currency', currency: CONFIG.currency, maximumFractionDigits: 0 }).format(n);

const CATS = [
  { id: 'beer',   name: 'Beer',   note: 'Crisp, hazy, easy-going',  c: '#D9F56A', art: 'beer'   },
  { id: 'wine',   name: 'Wine',   note: 'Reds, rosés, table pours', c: '#CEC1E8', art: 'wine'   },
  { id: 'whisky', name: 'Whisky', note: 'Smoky and slow',           c: '#E8CFA3', art: 'whisky' },
  { id: 'vodka',  name: 'Vodka',  note: 'Clean and clear',          c: '#E4E0EC', art: 'vodka'  },
  { id: 'gin',    name: 'Gin',    note: 'Botanical and bright',     c: '#BFE3C8', art: 'gin'    },
  { id: 'mixers', name: 'Mixers', note: 'Tonics and sodas',         c: '#F4C4B5', art: 'mixer'  }
];
const PRODUCTS = [
  { id: 'p1', name: 'Copper Hour Lager',   cat: 'beer',   size: '6 × 330 ml', price: 540,  art: 'beer',   col: '#C98A2B' },
  { id: 'p2', name: 'Hazy Orchard IPA',    cat: 'beer',   size: '4 × 440 ml', price: 620,  art: 'can',    col: '#7FA33A' },
  { id: 'p3', name: 'Velvet Dusk Red',     cat: 'wine',   size: '750 ml',     price: 1150, art: 'wine',   col: '#8E4B6A' },
  { id: 'p4', name: 'Pale Terrace Rosé',   cat: 'wine',   size: '750 ml',     price: 980,  art: 'wine',   col: '#D98FA0' },
  { id: 'p5', name: 'Smoked Cedar Malt',   cat: 'whisky', size: '700 ml',     price: 3200, art: 'whisky', col: '#B9803A' },
  { id: 'p6', name: 'Glass Peak Vodka',    cat: 'vodka',  size: '700 ml',     price: 1450, art: 'vodka',  col: '#9FB6D1' },
  { id: 'p7', name: 'Juniper & Fig Gin',   cat: 'gin',    size: '700 ml',     price: 1850, art: 'gin',    col: '#5E9C78' },
  { id: 'p8', name: 'Ginger Spark Tonic',  cat: 'mixers', size: '4 × 200 ml', price: 360,  art: 'mixer',  col: '#E0A24A' }
];
const catName = id => (CATS.find(c => c.id === id) || {}).name || '';
const catColor = id => (CATS.find(c => c.id === id) || {}).c || '#CEC1E8';

/* ---------- Helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(area, k) { try { return window[area].getItem(k); } catch { return null; } },
  set(area, k, v) { try { window[area].setItem(k, v); } catch { /* storage unavailable */ } }
};
const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

/* ---------- Inline SVG product art ---------- */
const BODY = {
  beer:   '<path d="M43 6h14v30l9 16v76a8 8 0 0 1-8 8H42a8 8 0 0 1-8-8V52l9-16z"/>',
  can:    '<rect x="26" y="20" width="48" height="108" rx="9"/><path d="M30 20q20-8 40 0"/>',
  wine:   '<path d="M44 4h12v34c0 12 14 18 14 40v52a8 8 0 0 1-8 8H38a8 8 0 0 1-8-8V78c0-22 14-28 14-40z"/>',
  whisky: '<rect x="40" y="6" width="20" height="16" rx="4"/><path d="M42 22h16l14 18v88a8 8 0 0 1-8 8H36a8 8 0 0 1-8-8V40z"/>',
  vodka:  '<path d="M42 6h16v22l12 14v86a8 8 0 0 1-8 8H38a8 8 0 0 1-8-8V42l12-14z"/>',
  gin:    '<rect x="42" y="6" width="16" height="14" rx="3"/><path d="M44 20h12v14c14 4 18 12 18 26v68a8 8 0 0 1-8 8H34a8 8 0 0 1-8-8V60c0-14 4-22 18-26z"/>',
  mixer:  '<path d="M42 40h16v14l8 12v60a8 8 0 0 1-8 8H42a8 8 0 0 1-8-8V66l8-12z"/><rect x="40" y="30" width="20" height="10" rx="3"/>',
  bag:    '<path d="M32 50V38a18 18 0 0 1 36 0v12" fill="none"/><path d="M18 50h64l-6 82H24z"/>',
  bottle: '<path d="M43 6h14v34c10 8 16 14 16 34v54a8 8 0 0 1-8 8H35a8 8 0 0 1-8-8V74c0-20 6-26 16-34z"/>'
};
function art(type, color, label) {
  const dark = type === 'bag';
  const lab = dark ? '' : '<rect x="34" y="82" width="32" height="30" rx="5" fill="#FAF6EF" stroke="none"/>';
  const arrow = `<path d="M${dark ? 34 : 41} ${dark ? 112 : 106}l${dark ? 32 : 18}-${dark ? 36 : 16}M${dark ? 46 : 46} ${dark ? 74 : 92}h${dark ? 20 : 13}v${dark ? 18 : 12}" fill="none" stroke="${dark ? '#D9F56A' : '#211425'}" stroke-width="${dark ? 6 : 3}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const a11y = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"';
  return `<svg viewBox="0 0 100 140" ${a11y} focusable="false"><g fill="${color}" stroke="#211425" stroke-width="2.5" stroke-linejoin="round">${BODY[type]}${lab}</g>${arrow}</svg>`;
}
function paintArt(root = document) {
  $$('[data-art]', root).forEach(el => { if (!el.firstChild) el.innerHTML = art(el.dataset.art, el.dataset.c || '#CEC1E8'); });
}

/* ---------- State ---------- */
const state = { cat: 'all', q: '', cart: loadCart() };

function loadCart() {
  try {
    const raw = JSON.parse(store.get('localStorage', 'drinkit-cart') || '{}');
    const out = {};
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      for (const p of PRODUCTS) {
        const n = Math.floor(Number(raw[p.id]));
        if (n > 0 && n <= 99) out[p.id] = n;
      }
    }
    return out;
  } catch { store.set('localStorage', 'drinkit-cart', '{}'); return {}; }
}
const saveCart = () => store.set('localStorage', 'drinkit-cart', JSON.stringify(state.cart));
const cartCount = () => Object.values(state.cart).reduce((a, b) => a + b, 0);
const cartTotal = () => PRODUCTS.reduce((s, p) => s + p.price * (state.cart[p.id] || 0), 0);

/* ---------- Toast / status ---------- */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ---------- Catalog rendering ---------- */
function actHTML(p) {
  const n = state.cart[p.id] || 0;
  return n
    ? `<div class="step" role="group" aria-label="${esc(p.name)} quantity"><button type="button" data-dec aria-label="Decrease ${esc(p.name)}">−</button><output aria-live="polite">${n}</output><button type="button" data-inc aria-label="Increase ${esc(p.name)}">+</button></div>`
    : `<button class="add" type="button" data-add aria-label="Add ${esc(p.name)} to basket">Add</button>`;
}
function filtered() {
  const q = state.q.trim().toLowerCase();
  return PRODUCTS.filter(p => (state.cat === 'all' || p.cat === state.cat) &&
    (!q || p.name.toLowerCase().includes(q) || catName(p.cat).toLowerCase().includes(q)));
}
function renderProducts() {
  const list = filtered();
  const grid = $('#grid');
  grid.innerHTML = list.map((p, i) => `
    <article class="card" data-id="${p.id}" style="--i:${i};--c:${catColor(p.cat)}">
      <div class="card-art">${art(p.art, p.col, p.name + ', illustration')}</div>
      <div class="card-body">
        <p class="c">${catName(p.cat)}</p><h3>${esc(p.name)}</h3><p class="size">${p.size}</p>
        <div class="buy"><span class="price">${fmt(p.price)}<small>sample price</small></span><span class="act">${actHTML(p)}</span></div>
      </div>
    </article>`).join('');
  $('#empty').hidden = list.length > 0;
  $('#count').textContent = `Showing ${list.length} of ${PRODUCTS.length}. All prices are sample prices for demonstration only.`;
}
function renderCategories() {
  $('#cat-rail').innerHTML = [{ id: 'all', name: 'All', note: 'Every shelf', c: '#FAF6EF', art: 'bottle' }, ...CATS].map(c => `
    <button class="cat" type="button" data-cat="${c.id}" aria-pressed="${state.cat === c.id}" style="--c:${c.c}">
      <span class="ill">${art(c.art, c.id === 'all' ? '#CEC1E8' : '#FAF6EF')}</span><b>${c.name}</b><small>${c.note}</small>
    </button>`).join('');
}
function setCategory(id, scroll) {
  state.cat = id;
  $$('.cat').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cat === id)));
  renderProducts(); $('#grid').classList.add('ready');
  if (scroll) $('#collection').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
}

/* ---------- Cart ---------- */
function changeQty(id, delta, announce) {
  const p = PRODUCTS.find(x => x.id === id); if (!p) return;
  const n = Math.max(0, Math.min(99, (state.cart[id] || 0) + delta));
  if (n) state.cart[id] = n; else delete state.cart[id];
  saveCart(); updateCartUI(id);
  if (announce) toast(`${p.name} added to demo basket`);
}
function updateCartUI(changedId) {
  const count = cartCount();
  const badge = $('#badge');
  badge.textContent = count;
  $('#cart-btn').setAttribute('aria-label', `Open basket, ${count} item${count === 1 ? '' : 's'}`);
  badge.classList.add('bump'); setTimeout(() => badge.classList.remove('bump'), 200);
  if (changedId) {
    const card = $(`.card[data-id="${changedId}"] .act`);
    const p = PRODUCTS.find(x => x.id === changedId);
    if (card) {
      const hadFocus = card.contains(document.activeElement);
      const was = document.activeElement && document.activeElement.hasAttribute('data-inc') ? '[data-inc]' : document.activeElement && document.activeElement.hasAttribute('data-dec') ? '[data-dec]' : '[data-inc]';
      card.innerHTML = actHTML(p);
      if (hadFocus) (card.querySelector(was) || card.querySelector('[data-add]'))?.focus();
    }
  }
  renderCart();
}
function renderCart() {
  const items = PRODUCTS.filter(p => state.cart[p.id]);
  $('#lines').innerHTML = items.map(p => `
    <li data-id="${p.id}" style="--c:${catColor(p.cat)}">
      <span class="th">${art(p.art, p.col)}</span>
      <div><b>${esc(p.name)}</b><small>${p.size} · ${fmt(p.price)} sample</small>
        <div class="step" role="group" aria-label="${esc(p.name)} quantity"><button type="button" data-dec aria-label="Decrease ${esc(p.name)}">−</button><output>${state.cart[p.id]}</output><button type="button" data-inc aria-label="Increase ${esc(p.name)}">+</button></div></div>
      <div style="text-align:right"><b>${fmt(p.price * state.cart[p.id])}</b><br><button class="rm" type="button" data-rm aria-label="Remove ${esc(p.name)}">Remove</button></div>
    </li>`).join('');
  $('#cart-empty').hidden = items.length > 0;
  $('#d-foot').hidden = items.length === 0;
  $('#lines').hidden = items.length === 0;
  $('#sub').textContent = fmt(cartTotal());
}
function initCart() {
  $('#grid').addEventListener('click', e => {
    const id = e.target.closest('.card')?.dataset.id; if (!id) return;
    if (e.target.closest('[data-add]')) changeQty(id, 1, true);
    else if (e.target.closest('[data-inc]')) changeQty(id, 1);
    else if (e.target.closest('[data-dec]')) changeQty(id, -1);
  });
  $('#lines').addEventListener('click', e => {
    const li = e.target.closest('li'); if (!li) return;
    const id = li.dataset.id;
    if (e.target.closest('[data-inc]')) changeQty(id, 1);
    else if (e.target.closest('[data-dec]')) changeQty(id, -1);
    else if (e.target.closest('[data-rm]')) { changeQty(id, -(state.cart[id] || 0)); toast('Item removed'); }
  });
  $('#review-btn').addEventListener('click', () => {
    $('#review').textContent = `Demo basket: ${cartCount()} item${cartCount() === 1 ? '' : 's'}, sample subtotal ${fmt(cartTotal())}. Nothing was ordered. Payment, legal verification, stock checks and delivery booking require a production backend.`;
  });
  $('#cart-btn').addEventListener('click', () => $('#cart').showModal());
}

/* ---------- Dialogs ---------- */
function initDialogs() {
  $$('dialog').forEach(d => {
    d.addEventListener('click', e => { if (e.target === d && d.id !== 'age') d.close(); });
    $$('[data-close]', d).forEach(b => b.addEventListener('click', () => d.close()));
  });
  const age = $('#age');
  age.addEventListener('cancel', e => e.preventDefault());   // Escape never dismisses age gate
  $('#age-yes').addEventListener('click', () => { store.set('sessionStorage', 'drinkit-age', 'ok'); age.close(); unlock(); });
  $('#age-no').addEventListener('click', () => {
    age.close(); $('#app').hidden = true; $('#exit').hidden = false; $('#exit h1').setAttribute('tabindex', '-1'); $('#exit h1').focus();
  });
  // location
  const dlg = $('#loc-dlg'), input = $('#loc-in');
  const showLoc = v => { $('#loc-label').textContent = v || 'Set location'; };
  showLoc(store.get('sessionStorage', 'drinkit-loc'));
  $('#loc-btn').addEventListener('click', () => { input.value = store.get('sessionStorage', 'drinkit-loc') || ''; $('#loc-msg').textContent = ''; dlg.showModal(); });
  $('#loc-form').addEventListener('submit', e => {
    e.preventDefault();
    const v = input.value.trim().slice(0, 60);
    if (!v) { $('#loc-msg').textContent = 'Enter a locality or postal code.'; input.focus(); return; }
    store.set('sessionStorage', 'drinkit-loc', v); showLoc(v);
    $('#loc-msg').textContent = 'Demo location saved — availability not verified.';
    toast('Demo location saved — availability not verified.');
    setTimeout(() => dlg.close(), 900);
  });
}
function lock(on) { ['#header', 'main', '.footer'].forEach(s => { const el = $(s); if (el) el.inert = on; }); }
function unlock() { lock(false); }

/* ---------- Navigation ---------- */
function initNav() {
  const header = $('#header');
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;height:24px;width:1px;pointer-events:none';
  document.body.prepend(sentinel);
  new IntersectionObserver(([en]) => header.classList.toggle('solid', !en.isIntersecting)).observe(sentinel);

  const btn = $('#menu-btn'), menu = $('#menu');
  const setMenu = open => { menu.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open)); btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); };
  btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); btn.focus(); } });
  $('#search-btn').addEventListener('click', () => {
    setMenu(false);
    $('#collection').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    setTimeout(() => $('#q').focus({ preventScroll: true }), reduceMotion ? 0 : 450);
  });
}

/* ---------- Filters & search ---------- */
function initFilters() {
  $('#cat-rail').addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (b) setCategory(b.dataset.cat === state.cat && b.dataset.cat !== 'all' ? 'all' : b.dataset.cat); });
  $('#q').addEventListener('input', e => { state.q = e.target.value; renderProducts(); $('#grid').classList.add('ready'); });
  $('#search-form').addEventListener('submit', e => e.preventDefault());
  $('#reset').addEventListener('click', () => { state.q = ''; $('#q').value = ''; setCategory('all'); $('#q').focus(); });
  $$('[data-occ]').forEach(b => b.addEventListener('click', () => { state.q = ''; $('#q').value = ''; setCategory(b.dataset.occ, true); toast(`Showing ${catName(b.dataset.occ).toLowerCase()}`); }));
}

/* ---------- Scroll animation ---------- */
function initScroll() {
  const reveals = $$('.reveal');
  if (!('IntersectionObserver' in window)) { reveals.forEach(r => r.classList.add('in')); $('#grid').classList.add('ready'); return; }
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .15 });
  reveals.forEach(r => io.observe(r));
  const gio = new IntersectionObserver(([en]) => { if (en.isIntersecting) { $('#grid').classList.add('ready'); gio.disconnect(); } }, { threshold: .05 });
  gio.observe($('#grid'));

  const steps = $$('.steps li'), panel = $('#panel'), prog = $('#prog');
  const sio = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const n = en.target.dataset.step;
    steps.forEach(s => s.classList.toggle('on', s === en.target));
    panel.dataset.stage = n; prog.style.transform = `scaleY(${n / 3})`;
  }), { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(s => sio.observe(s));
  steps[0].classList.add('on');
}

/* ---------- Hero pointer motion ---------- */
function initParallax() {
  if (reduceMotion || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  const stage = $('#stage'), hero = $('.hero');
  $$('[data-depth]', stage).forEach(el => el.style.setProperty('--d', el.dataset.depth));
  let raf = 0;
  hero.addEventListener('pointermove', e => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      const r = hero.getBoundingClientRect();
      stage.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3));
      stage.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3));
      raf = 0;
    });
  });
  hero.addEventListener('pointerleave', () => { stage.style.setProperty('--px', 0); stage.style.setProperty('--py', 0); });
}

/* ---------- FAQ ---------- */
function initFaq() {
  $('#faq-list').addEventListener('click', e => {
    const b = e.target.closest('button[aria-expanded]'); if (!b) return;
    const open = b.getAttribute('aria-expanded') === 'true';
    b.setAttribute('aria-expanded', String(!open));
    document.getElementById(b.getAttribute('aria-controls')).hidden = open;
  });
}

/* ---------- Init ---------- */
function init() {
  paintArt();
  renderCategories(); renderProducts(); renderCart(); updateCartUI();
  initCart(); initDialogs(); initNav(); initFilters(); initScroll(); initParallax(); initFaq();
  if (store.get('sessionStorage', 'drinkit-age') === 'ok') unlock();
  else { lock(true); $('#age').showModal(); $('#age-yes').focus(); }
}
document.addEventListener('DOMContentLoaded', init);
