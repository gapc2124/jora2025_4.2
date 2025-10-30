/* =========================
   Helpers
   ========================= */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* =========================
   Header: estado "scrolled"
   ========================= */
(function headerScroll() {
  const header = $('.site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* =========================
   Menú móvil (hamburguesa) — overlay centrado
   ========================= */
(function mobileMenu() {
  const btn = $('.menu-toggle');
  /* --- MODIFICACIÓN JS --- */
  // Apuntamos a la nueva clase de la navegación móvil
  const nav = $('.primary-nav-mobile'); 
  /* --- FIN MODIFICACIÓN JS --- */
  
  if (!btn || !nav) return;

  let lastFocus = null;

  const focusFirstLink = () => {
    /* --- MODIFICACIÓN JS --- */
    // Apuntamos a los enlaces dentro de la nueva navegación
    const first = $('.primary-nav-mobile a');
    /* --- FIN MODIFICACIÓN JS --- */
    if (first) first.focus();
  };

  const open = () => {
    lastFocus = document.activeElement;
    document.body.classList.add('menu-open');
    nav.classList.add('active');
    btn.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Cerrar menú');
    setTimeout(focusFirstLink, 0);
  };

  const close = () => {
    document.body.classList.remove('menu-open');
    nav.classList.remove('active');
    btn.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Abrir menú');
    if (lastFocus) btn.focus();
  };

  const toggle = () => (document.body.classList.contains('menu-open') ? close() : open());

  btn.addEventListener('click', toggle);
  
  /* --- MODIFICACIÓN JS --- */
  // Apuntamos a los enlaces dentro de la nueva navegación para que cierren el menú al hacer clic
  $$('.primary-nav-mobile a').forEach(a => a.addEventListener('click', close));
  /* --- FIN MODIFICACIÓN JS --- */

  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  nav.addEventListener('click', (e) => {
    if (e.target === nav) close();
  });

  const mq = window.matchMedia('(min-width: 1051px)');
  const onChange = () => { if (mq.matches) close(); };
  mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange);
})();

/* =========================
   Carrusel (slides + dots + autoplay)
   ========================= */
(function carousel() {
  const root = $('.carousel');
  if (!root) return;

  const slides  = $$('.slides .slide', root);
  const prevBtn = $('.prev', root);
  const nextBtn = $('.next', root);
  const dotsWrap = $('.slider-dots', root);

  if (!slides.length || !dotsWrap) return;

  let dots = $$('.dot', dotsWrap);
  if (!dots.length) {
    const frag = document.createDocumentFragment();
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.className = 'dot';
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `Ir al slide ${i + 1}`);
      frag.appendChild(b);
    });
    dotsWrap.appendChild(frag);
    dots = $$('.dot', dotsWrap);
  }

  let i = slides.findIndex(s => s.classList.contains('active'));
  if (i < 0) i = 0;
  let autoplay = null;
  const AUTOPLAY_MS = 5000;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function show(idx) {
    i = (idx + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('active', k === i));
    if (dots.length) {
      dots.forEach((d, k) => {
        d.classList.toggle('active', k === i);
        d.setAttribute('aria-selected', k === i ? 'true' : 'false');
        d.tabIndex = k === i ? 0 : -1;
      });
    }
  }

  function next() { show(i + 1); }
  function prev() { show(i - 1); }

  nextBtn && nextBtn.addEventListener('click', next);
  prevBtn && prevBtn.addEventListener('click', prev);
  dots.forEach((d, k) => d.addEventListener('click', () => show(k)));

  root.tabIndex = 0;
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
  });

  const startAuto = () => {
    if (reduceMotion || AUTOPLAY_MS <= 0) return;
    if (!autoplay) autoplay = setInterval(next, AUTOPLAY_MS);
  };
  const stopAuto = () => { if (autoplay) { clearInterval(autoplay); autoplay = null; } };

  root.addEventListener('mouseenter', stopAuto);
  root.addEventListener('mouseleave', startAuto);
  root.addEventListener('focusin', stopAuto);
  root.addEventListener('focusout', startAuto);

  show(i);
  startAuto();
})();

/* =========================================================
   PLATOS BANDERA — highlight 2×2 (SOLO HOVER)
   ========================================================= */
(function platosBandera() {
  const grid = $('.platos-fotos');
  const optionsWrap = $('.platos-opciones');
  // Filtramos para no incluir el botón "Descargar Carta"
  const options = optionsWrap ? $$('li:not(.opcion-descargar) a', optionsWrap) : [];

  if (!grid || !options.length) return;

  const isDesktop = () => window.matchMedia('(min-width: 1051px)').matches;
  const clearHL = () => grid.classList.remove('hl-1','hl-2','hl-3','hl-4');
  const setHL = (n) => { clearHL(); grid.classList.add(`hl-${n}`); };

  // Hover/focus en cada opción
  options.forEach(a => {
    const target = parseInt(a.dataset.target, 10);
    if (!target || target < 1 || target > 4) return;

    const onEnter = () => {
      if (isDesktop()) setHL(target);
    };
    const onLeave = () => {
      if (isDesktop()) clearHL();
    };

    a.addEventListener('mouseenter', onEnter);
    a.addEventListener('focus', onEnter);
    a.addEventListener('mouseleave', onLeave);
    a.addEventListener('blur', onLeave);
    
    // Se eliminó el listener 'click' con e.preventDefault()
  });

  if (optionsWrap) {
    optionsWrap.addEventListener('mouseleave', () => {
      if (isDesktop()) clearHL();
    });
    optionsWrap.addEventListener('focusout', (e) => {
      if (isDesktop() && !optionsWrap.contains(e.relatedTarget)) {
        clearHL();
      }
    });
  }
  
  const onResize = () => {
    if (!isDesktop()) clearHL();
  };
  window.addEventListener('resize', onResize);
  onResize();
})();

/* =========================
   Transición de Fondo al Hacer Scroll (para eventos.html)
   ========================= */
(function backgroundFadeOnScroll(){
  // Esta función es para eventos.html, no afectará a index.html
  const blocks = $$('.ev-block');
  const headerGroup = $('.ev-intro'); 
  const elementsToObserve = headerGroup ? [...blocks, headerGroup] : blocks; 

  if (!elementsToObserve.length) return;

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('bg-visible'); 
        io.unobserve(e.target); 
      }
    });
  }, { threshold: 0.15 });

  elementsToObserve.forEach(el => {
    io.observe(el);
  });
})();