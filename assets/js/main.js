// Dr. Gabriel Galeb — site interactions
(() => {
  'use strict';

  // Mobile menu toggle
  const toggle = document.getElementById('menuToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
      toggle.textContent = isOpen ? '✕' : '☰';
    });
    // Close menu on link click (mobile UX)
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (links.classList.contains('open')) {
          links.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.setAttribute('aria-label', 'Abrir menu');
          toggle.textContent = '☰';
        }
      });
    });
  }

  // Subtle scroll-reveal via IntersectionObserver
  const observed = document.querySelectorAll('section, .service-card, .diff, .step, .t-card, .gallery-item');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    observed.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      io.observe(el);
    });
  }

  // FAQ: only one open at a time
  const items = document.querySelectorAll('.faq-item');
  items.forEach((it) => {
    it.addEventListener('toggle', () => {
      if (it.open) {
        items.forEach((other) => { if (other !== it) other.open = false; });
      }
    });
  });

  // Track CTA clicks (for owner analytics — no external calls)
  document.querySelectorAll('a[href*="wa.me"]').forEach((a) => {
    a.addEventListener('click', () => {
      // Placeholder for analytics hook
      try { console.info('[Gabriel Site] WhatsApp CTA click'); } catch (e) {}
    });
  });
})();
