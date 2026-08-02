/**
 * Progressive enhancement only. Every section is readable and every link works
 * with this file blocked — nothing here controls whether content is visible.
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

    // The panel drops from under the sticky header, whose height changes with
    // the top bar scrolling out of view.
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

  /* Before/after lightbox -------------------------------------------------- */
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
      // Clicking the backdrop lands on the dialog element itself.
      if (e.target.closest('[data-close]') || e.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      dialogImg.removeAttribute('src');
    });
  } else {
    document.querySelectorAll('.case__zoom').forEach((el) => el.remove());
  }
})();
