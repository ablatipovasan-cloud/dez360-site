/* /js/include.js
   Простой инклюд: подставляет фрагменты и вешает поведение на шапку. */
(function () {
  async function injectIncludes() {
    const nodes = document.querySelectorAll('[data-include]');
    const tasks = Array.from(nodes).map(async node => {
      const url = node.getAttribute('data-include');
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) throw new Error(res.statusText);
        node.outerHTML = await res.text();
      } catch (e) {
        console.error('Include error:', url, e);
      }
    });
    await Promise.all(tasks);
  }

  function initHeaderBehavior() {
    const burger = document.getElementById('burger');
    const mobileNav = document.getElementById('mobileNav');

    if (burger && mobileNav) {
      burger.addEventListener('click', () => {
        burger.classList.toggle('is-open');
        mobileNav.classList.toggle('is-open');
      });

      // Закрытие по клику вне
      document.addEventListener('click', (e) => {
        if (!mobileNav.contains(e.target) && !burger.contains(e.target)) {
          burger.classList.remove('is-open');
          mobileNav.classList.remove('is-open');
        }
      });
    }

    // Подсветка активного пункта в меню (и десктоп, и мобилка)
    const current = location.pathname.replace(/index\.html$/,'') || '/';
    document.querySelectorAll('.header-nav a, .mobile-nav a').forEach(a => {
      try {
        const ap = new URL(a.href, location.origin).pathname.replace(/index\.html$/,'') || '/';
        if (ap === current) a.classList.add('is-active');
      } catch (_) {}
    });
  }

  // Smooth-scroll по якорям
  function initSmoothAnchors() {
    function scrollToId(id) {
      const t = document.querySelector(id);
      if (!t) return;
      const top = t.getBoundingClientRect().top + scrollY - 80;
      scrollTo({ top, behavior: 'smooth' });
      const mobileNav = document.getElementById('mobileNav');
      const burger = document.getElementById('burger');
      if (mobileNav && burger) { mobileNav.classList.remove('is-open'); burger.classList.remove('is-open'); }
    }
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id && id.length > 1) {
          const target = document.querySelector(id);
          if (target) { e.preventDefault(); scrollToId(id); }
        }
      });
    });
    document.querySelectorAll('[data-scroll]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const id = btn.getAttribute('data-scroll');
        if (id) scrollToId(id);
      });
    });
  }

  // Последовательность: втыкаем инклюды → инициализируем поведение
  document.addEventListener('DOMContentLoaded', async () => {
    await injectIncludes();
    initHeaderBehavior();
    initSmoothAnchors();
  });
})();

