/* Minimal JS: mobile menu, sticky nav, reveal, counters, parallax, lightbox */
(() => {
  document.documentElement.classList.add('js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer year
  $('#year').textContent = new Date().getFullYear();

  // Mobile menu
  const burger = $('#burger'), menu = $('#menu');
  const setMenu = open => {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));

  // Sticky nav + parallax (one rAF-throttled scroll handler)
  const nav = $('#nav'), layers = $$('.parallax');
  let ticking = false;
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 40);
    if (!reduce) layers.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight)
        el.style.transform = `translateY(${-r.top * el.dataset.speed}px)`;
    });
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Count-up numbers
  const count = el => {
    const end = +el.dataset.count, suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = end + suffix; return; }
    const t0 = performance.now(), dur = 1400;
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // Reveal on scroll
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('[data-count]', e.target).forEach(count);
    io.unobserve(e.target);
  }), { threshold: .15 });
  $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * 120 + 'ms';
    io.observe(el);
  });

  // Highlight current nav link
  const links = $$('.menu a[href^="#"]');
  const spy = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('section[id]').forEach(s => spy.observe(s));

  // Gallery lightbox
  const lb = $('#lightbox'), lbImg = $('#lb-img'), lbCap = $('#lb-cap');
  $$('.g').forEach(g => g.addEventListener('click', () => {
    lbImg.style.backgroundImage = getComputedStyle(g).backgroundImage;
    lbCap.textContent = g.dataset.title;
    lb.hidden = false;
  }));
  const close = () => (lb.hidden = true);
  lb.addEventListener('click', e => { if (e.target !== lbImg) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { close(); setMenu(false); } });
})();
