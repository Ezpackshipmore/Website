/* ==========================================================================
   EZ Pack Ship and More – site script
   ========================================================================== */

/* ---------- Icon set (used as <svg class="icon"><use href="#i-name"/></svg>) ---------- */
const ICONS = {
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
  truck: '<path d="M1 4h14v12H1zM15 8h4l4 4v4h-8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  pen: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.6 7.6"/><circle cx="11" cy="11" r="2"/>',
  printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  mailbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  shirt: '<path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
  plus: '<circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  left: '<path d="M15 18l-6-6 6-6"/>',
  right: '<path d="M9 18l6-6-6-6"/>',
  directions: '<path d="M3 11l19-9-9 19-2-8-8-2z"/>'
};
(function injectIcons() {
  const symbols = Object.entries(ICONS)
    .map(([name, body]) => `<symbol id="i-${name}" viewBox="0 0 24 24">${body}</symbol>`)
    .join('');
  const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">${symbols}</svg>`;
  document.body.insertAdjacentHTML('afterbegin', sprite);
})();

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Small helpers ---------- */
  const today = document.querySelectorAll('.hours-list li[data-day="' + new Date().getDay() + '"]');
  today.forEach(li => li.classList.add('today'));

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  /* ---------- Quote estimate ---------- */
  const RATE = 14; // price per lb (USD)
  const DEFAULT_MSG = 'Enter your weight and destination to see your estimate.';
  let lastEstimate = '';
  const estimateBtn = document.getElementById('estimateBtn');
  const out = document.getElementById('estimateResult');
  const typeSel = document.getElementById('shipmentType');
  const destInput = document.querySelector('[name="destination"]');

  const resetEstimate = () => { lastEstimate = ''; if (out) out.textContent = DEFAULT_MSG; };
  ['weight', 'shipmentType'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', resetEstimate);
  });
  if (destInput) destInput.addEventListener('input', resetEstimate);

  if (estimateBtn) estimateBtn.addEventListener('click', () => {
    const type = typeSel.value;
    const weight = parseFloat(document.getElementById('weight').value);
    const destination = destInput.value.trim();

    if (type === 'Documents') {
      lastEstimate = 'Documents: a team member will contact you with details.';
      out.innerHTML = '<b>Documents:</b> a team member will contact you with the details and pricing. Please complete the form and send your request.';
      return;
    }
    if (!weight || weight <= 0 || !destination) {
      out.textContent = 'Please enter your package weight and destination country first.';
      return;
    }
    const total = (weight * RATE).toFixed(2);
    const isNepal = destination.toLowerCase().includes('nepal');
    const customs = isNepal
      ? 'We handle customs clearance for shipments to Nepal.'
      : 'We provide customs clearance for Nepal only. For this destination, you will be responsible for customs clearance.';
    lastEstimate = `Estimated price: $${total} (${weight} lb x $${RATE}/lb), without customs.`;
    out.innerHTML =
      `<div class="estimate-price">$${total} <small>${weight} lb × $${RATE.toFixed(2)}/lb</small></div>` +
      `<p class="estimate-line">The price shown is without customs. Our team will reach out with further details.</p>` +
      `<p class="estimate-line">${customs}</p>`;
  });

  /* ---------- Quote form submit (FormSubmit) ---------- */
  const form = document.getElementById('quoteForm');
  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('formStatus');
    const setStatus = (msg, kind = '') => { status.textContent = msg; status.className = 'form-status ' + kind; };
    const data = new FormData(form);
    const obj = Object.fromEntries(data.entries());
    if (lastEstimate) obj.estimate = lastEstimate;
    if (!data.get('consent')) { setStatus('Please confirm that we may contact you about this request.', 'error'); return; }

    const recipient = 'ezpackshipmore@gmail.com';
    const btn = form.querySelector('.submit-btn');
    setStatus('Sending your request...');
    if (btn) btn.disabled = true;
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...obj,
          _subject: 'New EZ Pack Ship quote request - ' + (obj.name || ''),
          _template: 'table',
          _captcha: 'false'
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === 'false' || result.success === false) throw new Error(result.message || 'Submission failed');
      setStatus('Thank you! Your quote request has been sent. A team member will be in touch soon.', 'success');
      form.reset();
      resetEstimate();
    } catch (err) {
      console.error('Quote form error:', err.message);
      setStatus('We could not send your request right now. Please call us at (972) 457-0100 or email ezpackshipmore@gmail.com.', 'error');
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  /* ---------- Home photo carousel ----------
     Photos that fail to load (e.g. images/slide-05.jpg not added yet) are skipped.
     If no photos load at all, the branded fallback slide is shown. */
  const car = document.getElementById('heroCarousel');
  if (car) {
    const track = car.querySelector('.car-track');
    const fallback = car.querySelector('.slide-fallback');
    const photoSlides = [...car.querySelectorAll('.slide:not(.slide-fallback)')];

    const loaded = img => new Promise(res => {
      if (img.complete) return res(img.naturalWidth > 0);
      img.addEventListener('load', () => res(true), { once: true });
      img.addEventListener('error', () => res(false), { once: true });
    });

    Promise.all(photoSlides.map(s => loaded(s.querySelector('img')))).then(results => {
      photoSlides.forEach((s, i) => { if (!results[i]) s.remove(); });
      if (results.some(Boolean) && fallback) fallback.remove();
      initCarousel();
    });

    function initCarousel() {
      const slides = [...car.querySelectorAll('.slide')];
      const dotsBox = document.getElementById('carDots');
      if (slides.length <= 1) { car.classList.add('single'); return; }

      let cur = 0, timer = null, startX = null;
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Go to photo ' + (i + 1));
        b.addEventListener('click', () => { go(i); restart(); });
        dotsBox.appendChild(b);
      });
      const dots = [...dotsBox.children];

      function go(i) {
        cur = (i + slides.length) % slides.length;
        track.style.transform = `translateX(-${cur * 100}%)`;
        dots.forEach((d, k) => d.classList.toggle('on', k === cur));
        slides.forEach((s, k) => s.setAttribute('aria-hidden', k !== cur));
      }
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      function restart() { clearInterval(timer); if (!reduce) timer = setInterval(() => go(cur + 1), 4500); }

      car.querySelector('.prev').addEventListener('click', () => { go(cur - 1); restart(); });
      car.querySelector('.next').addEventListener('click', () => { go(cur + 1); restart(); });
      car.addEventListener('mouseenter', () => clearInterval(timer));
      car.addEventListener('mouseleave', restart);
      car.addEventListener('touchstart', e => { startX = e.touches[0].clientX; clearInterval(timer); }, { passive: true });
      car.addEventListener('touchend', e => {
        if (startX !== null) {
          const dx = e.changedTouches[0].clientX - startX;
          if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
          startX = null;
        }
        restart();
      });
      car.setAttribute('tabindex', '0');
      car.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { go(cur + 1); restart(); }
        if (e.key === 'ArrowLeft') { go(cur - 1); restart(); }
      });
      go(0);
      restart();
    }
  }
});
