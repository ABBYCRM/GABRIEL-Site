/**
 * Progressive enhancement only. The carousel still scrolls with native
 * scroll-snap if this file is blocked; the compare still shows a 50/50 split
 * via the CSS custom property set in markup.
 */
(() => {
  'use strict';

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

  /* CSS scroll-snap carousel controls ------------------------------------- */
  document.querySelectorAll('[data-carousel]').forEach((root) => {
    const rail = root.querySelector('.ba-carousel__rail');
    const slides = [...root.querySelectorAll('.ba-slide')];
    const dots = [...root.querySelectorAll('.ba-carousel__dots a')];
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
      // rAF-throttle via flag
      if (rail._ticking) return;
      rail._ticking = true;
      requestAnimationFrame(() => {
        syncDots();
        rail._ticking = false;
      });
    }, { passive: true });

    // Keyboard when the rail is focused
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
