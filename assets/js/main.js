/**
 * Progressive enhancement. Coverflow falls back to a readable stack if JS
 * is blocked; compare sliders still show the CSS --pos split from markup.
 */
(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mobile navigation ----------------------------------------------------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const masthead = document.getElementById('masthead');

  if (burger && nav) {
    const setOpen = (open) => {
      nav.dataset.open = String(open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    };

    burger.addEventListener('click', () => setOpen(nav.dataset.open !== 'true'));
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.dataset.open === 'true') {
        setOpen(false);
        burger.focus();
      }
    });

    const syncOffset = () => {
      const rect = masthead?.getBoundingClientRect();
      if (rect) nav.style.setProperty('--nav-top', `${Math.max(rect.bottom, 0)}px`);
    };
    syncOffset();
    addEventListener('resize', syncOffset, { passive: true });
    addEventListener('scroll', syncOffset, { passive: true });
  }

  /* Condensed header on scroll -------------------------------------------- */
  if (masthead) {
    const onScroll = () => {
      masthead.dataset.scrolled = String(scrollY > 24);
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
  }

  /* Before/after compare sliders ------------------------------------------ */
  document.querySelectorAll('[data-compare]').forEach((el) => {
    const range = el.querySelector('.compare__range');
    if (!range) return;
    const set = (v) => el.style.setProperty('--pos', `${v}%`);
    set(range.value);
    range.addEventListener('input', () => set(range.value), { passive: true });
  });

  /* Soft gold spotlight on treatment paths -------------------------------- */
  if (!reduceMotion && matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-spotlight]').forEach((el) => {
      let ticking = false;
      el.addEventListener('pointermove', (e) => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const r = el.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * 100;
          const y = ((e.clientY - r.top) / r.height) * 100;
          el.style.setProperty('--mx', `${x.toFixed(1)}%`);
          el.style.setProperty('--my', `${y.toFixed(1)}%`);
          ticking = false;
        });
      }, { passive: true });
    });
  }

  /* Pause spinning gold frames when off-screen ---------------------------- */
  if ('IntersectionObserver' in window) {
    const frames = document.querySelectorAll('.glow-frame');
    if (frames.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
        });
      }, { rootMargin: '10% 0px' });
      frames.forEach((f) => io.observe(f));
    }
  }

  /* 3D coverflow gallery (vanilla — site gold/navy palette) --------------- */
  document.querySelectorAll('[data-coverflow]').forEach((root) => {
    const cards = [...root.querySelectorAll('.coverflow__card')];
    const dots = [...root.querySelectorAll('[data-coverflow-dots] button, .ba-carousel__dots button')];
    const prev = root.querySelector('[data-coverflow-prev]');
    const next = root.querySelector('[data-coverflow-next]');
    if (!cards.length) return;

    let index = Math.max(0, cards.findIndex((c) => c.classList.contains('is-hero')));
    if (index < 0) index = 0;
    let pos = index;
    let anim = 0;
    let dragging = false;
    let dragX = 0;

    const spacing = () => Math.min(210, root.clientWidth * 0.22);
    const clampIndex = (i) => Math.max(0, Math.min(cards.length - 1, i));

    const render = (p) => {
      const space = spacing();
      const depth = reduceMotion ? 0 : 160;
      const tilt = reduceMotion ? 0 : 48;

      cards.forEach((card, i) => {
        const d = i - p;
        const ad = Math.abs(d);
        const x = d * space;
        const z = -ad * depth;
        const ry = Math.max(-tilt, Math.min(tilt, -d * tilt));
        const scale = Math.max(0.72, 1 - ad * 0.1);
        const hero = ad < 0.45;

        card.style.transform =
          `translate(-50%, -50%) translate3d(${x}px, 0, ${z}px) rotateY(${ry}deg) scale(${scale})`;
        card.style.zIndex = String(Math.round(100 - ad * 10));
        card.classList.toggle('is-hero', hero);
        card.setAttribute('aria-hidden', hero ? 'false' : 'true');
        card.tabIndex = hero ? 0 : -1;

        const range = card.querySelector('.compare__range');
        if (range) range.tabIndex = hero ? 0 : -1;
      });

      const active = clampIndex(Math.round(p));
      dots.forEach((d, n) => d.setAttribute('aria-current', String(n === active)));
      root.setAttribute('aria-activedescendant', cards[active]?.id || '');
    };

    const settle = (target) => {
      index = clampIndex(target);
      cancelAnimationFrame(anim);
      if (reduceMotion) {
        pos = index;
        render(pos);
        return;
      }
      const start = pos;
      const dist = index - start;
      if (Math.abs(dist) < 0.001) {
        pos = index;
        render(pos);
        return;
      }
      const t0 = performance.now();
      const dur = Math.min(700, 380 + Math.abs(dist) * 120);
      const step = (now) => {
        const t = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        pos = start + dist * eased;
        render(pos);
        if (t < 1) anim = requestAnimationFrame(step);
        else {
          pos = index;
          render(pos);
        }
      };
      anim = requestAnimationFrame(step);
    };

    const go = (i) => settle(i);

    prev?.addEventListener('click', () => go(index - 1));
    next?.addEventListener('click', () => go(index + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => go(i)));

    cards.forEach((card, i) => {
      card.addEventListener('click', (e) => {
        if (i === index) return;
        if (e.target.closest('.compare__range')) return;
        go(i);
      });
    });

    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(index + 1);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(index - 1);
      }
      if (e.key === 'Home') {
        e.preventDefault();
        go(0);
      }
      if (e.key === 'End') {
        e.preventDefault();
        go(cards.length - 1);
      }
    });

    /* Pointer swipe on the deck (ignore compare range drags) */
    const deck = root.querySelector('.coverflow__deck') || root;
    deck.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.compare__range, .coverflow__controls, .ba-carousel__btn, .ba-carousel__dots')) return;
      dragging = true;
      dragX = e.clientX;
      deck.setPointerCapture?.(e.pointerId);
    });
    deck.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      const dx = e.clientX - dragX;
      if (Math.abs(dx) > 48) go(index + (dx < 0 ? 1 : -1));
    });
    deck.addEventListener('pointercancel', () => {
      dragging = false;
    });

    addEventListener('resize', () => render(pos), { passive: true });

    /* Deep-link #caso-0N */
    const hash = location.hash.replace('#', '');
    if (hash) {
      const hi = cards.findIndex((c) => c.id === hash);
      if (hi >= 0) index = hi;
    }
    pos = index;
    render(pos);
  });

  /* Legacy CSS scroll-snap carousel (if still present) -------------------- */
  document.querySelectorAll('[data-carousel]').forEach((root) => {
    const rail = root.querySelector('.ba-carousel__rail');
    const slides = [...root.querySelectorAll('.ba-slide')];
    const dots = [...root.querySelectorAll('.ba-carousel__dots a, .ba-carousel__dots button')];
    const prev = root.querySelector('[data-carousel-prev]');
    const next = root.querySelector('[data-carousel-next]');
    if (!rail || !slides.length) return;

    const go = (i) => {
      const idx = (i + slides.length) % slides.length;
      slides[idx].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    };

    const currentIndex = () => {
      const left = rail.scrollLeft;
      let best = 0;
      let bestDist = Infinity;
      slides.forEach((s, i) => {
        const d = Math.abs(s.offsetLeft - left);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      return best;
    };

    const syncDots = () => {
      const i = currentIndex();
      dots.forEach((d, n) => d.setAttribute('aria-current', String(n === i)));
    };

    prev?.addEventListener('click', () => go(currentIndex() - 1));
    next?.addEventListener('click', () => go(currentIndex() + 1));
    dots.forEach((d, i) => {
      d.addEventListener('click', (e) => {
        e.preventDefault();
        go(i);
      });
    });
    rail.addEventListener('scroll', () => {
      if (rail._ticking) return;
      rail._ticking = true;
      requestAnimationFrame(() => {
        syncDots();
        rail._ticking = false;
      });
    }, { passive: true });

    rail.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(currentIndex() + 1);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(currentIndex() - 1);
      }
    });

    syncDots();
  });

  /* Before/after lightbox (legacy stacked galleries) ---------------------- */
  const dialog = document.getElementById('lightbox');
  const dialogImg = document.getElementById('lightbox-img');
  const dialogCaption = document.getElementById('lightbox-caption');

  if (dialog && typeof dialog.showModal === 'function') {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-zoom]');
      if (trigger) {
        const shot = trigger.closest('.case__shot')?.querySelector('img');
        dialogImg.src = trigger.dataset.zoom;
        dialogImg.alt = shot?.alt || '';
        dialogCaption.textContent = trigger.dataset.caption || '';
        dialog.showModal();
        return;
      }
      if (e.target.closest('[data-close]') || e.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      dialogImg.removeAttribute('src');
    });
  } else {
    document.querySelectorAll('.case__zoom').forEach((el) => el.remove());
  }
})();
