ю/* /js/include.js
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
function ensureBizLink() {
  // мобильное меню
  const m = document.getElementById('mobileNav');
  if (m && !m.querySelector('a[href="/biz/"]')) {
    const a = document.createElement('a');
    a.href = '/biz/';
    a.textContent = 'Для бизнеса';
    // вставим вторым пунктом, сразу после "Услуги", если он есть
    const services = m.querySelector('a[href="/index.html#services"], a[href="#services"]');
    if (services && services.parentNode === m) {
      m.insertBefore(a, services.nextSibling);
    } else {
      m.insertBefore(a, m.firstChild);
    }
  }

  // десктоп-меню
  const d = document.querySelector('.header-nav');
  if (d && !d.querySelector('a[href="/biz/"]')) {
    const a = document.createElement('a');
    a.href = '/biz/';
    a.textContent = 'Для бизнеса';
    // вставим вторым пунктом
    if (d.children.length >= 1) {
      d.insertBefore(a, d.children[1]);
    } else {
      d.appendChild(a);
    }
  }
}
document.addEventListener('DOMContentLoaded', async () => {
  await injectIncludes();
  ensureBizLink();        // ← добавили сюда
  initHeaderBehavior();
  initSmoothAnchors();
});
<script>
(function(){
  // отключаем на системах с "reduce motion"
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const MAX_TILT = 8;          // градусы наклона
  const EASING   = 0.12;       // «догоняющее» сглаживание

  document.querySelectorAll('.service-card').forEach(card => {
    let raf = null;
    let targetRX = 0, targetRY = 0;   // целевые углы
    let curRX = 0, curRY = 0;         // текущие углы

    function animate(){
      // плавно «догоняем»
      curRX += (targetRX - curRX) * EASING;
      curRY += (targetRY - curRY) * EASING;
      card.style.transform =
        `rotateX(${curRX}deg) rotateY(${curRY}deg) translateZ(0)`;
      raf = (Math.abs(targetRX-curRX) > .01 || Math.abs(targetRY-curRY) > .01)
        ? requestAnimationFrame(animate) : null;
    }

    function onMove(e){
      const rect = card.getBoundingClientRect();
      const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      const nx = (cx / rect.width)  * 2 - 1;      // -1..1
      const ny = (cy / rect.height) * 2 - 1;      // -1..1

      targetRY =  MAX_TILT * nx;   // поворот вокруг Y (влево/вправо)
      targetRX = -MAX_TILT * ny;   // поворот вокруг X (вверх/вниз)

      // позиция «блика»
      card.style.setProperty('--spot-x', `${(cx/rect.width)*100}%`);
      card.style.setProperty('--spot-y', `${(cy/rect.height)*100}%`);
      card.style.setProperty('--spot-o', '1');

      if (!raf){ card.classList.add('is-tilting'); raf = requestAnimationFrame(animate); }
    }

    function onLeave(){
      targetRX = targetRY = 0;
      card.style.setProperty('--spot-o', '0');
      if (!raf){ raf = requestAnimationFrame(animate); }
      card.classList.remove('is-tilting');
    }

    // мышь
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    // тач — чуть уменьшаем наклон и используем координаты пальца
    card.addEventListener('touchstart', e => { onMove(e); }, {passive:true});
    card.addEventListener('touchmove',  e => { onMove(e); }, {passive:true});
    card.addEventListener('touchend', onLeave);
  });
})();
</script>

