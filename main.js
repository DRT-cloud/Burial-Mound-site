/* ============================================================
   THE BURIAL MOUND SHOOTING CENTER — Shared JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* -----------------------------------------------------------
     NAV SCROLL BEHAVIOR (transparent → solid black)
     ----------------------------------------------------------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run once on load
  }

  /* -----------------------------------------------------------
     MOBILE HAMBURGER TOGGLE
     ----------------------------------------------------------- */
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* -----------------------------------------------------------
     SCROLL REVEAL (IntersectionObserver)
     ----------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  /* -----------------------------------------------------------
     ACCORDION
     ----------------------------------------------------------- */
  const accordionItems = document.querySelectorAll('.accordion__item');
  accordionItems.forEach(item => {
    const trigger = item.querySelector('.accordion__trigger');
    const content = item.querySelector('.accordion__content');

    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all other items
        accordionItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('open');
            const otherContent = otherItem.querySelector('.accordion__content');
            if (otherContent) otherContent.style.maxHeight = null;
          }
        });

        // Toggle current item
        if (isOpen) {
          item.classList.remove('open');
          content.style.maxHeight = null;
        } else {
          item.classList.add('open');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    }
  });

  /* -----------------------------------------------------------
     COUNTDOWN TIMER (targeting July 24, 2026)
     ----------------------------------------------------------- */
  const countdownEl = document.querySelector('.countdown');
  if (countdownEl) {
    const targetDate = new Date('2026-07-24T08:00:00-05:00'); // CDT — Summer Team Run N Gun

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        // Event has passed
        countdownEl.innerHTML = '<div class="countdown__unit"><span class="countdown__number" style="font-size: clamp(18px, 3vw, 28px);">EVENT COMPLETE</span></div>';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const units = countdownEl.querySelectorAll('.countdown__number');
      if (units.length === 4) {
        units[0].textContent = String(days).padStart(2, '0');
        units[1].textContent = String(hours).padStart(2, '0');
        units[2].textContent = String(minutes).padStart(2, '0');
        units[3].textContent = String(seconds).padStart(2, '0');
      }
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* -----------------------------------------------------------
     HERO PARALLAX (transform-based, GPU-accelerated)
     Applies to .hero-mega__bg (home) and .hero__bg (sub-pages).
     Disabled when prefers-reduced-motion is set.
     ----------------------------------------------------------- */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smallScreen = window.matchMedia('(max-width: 768px)').matches;
  const heroBgs = document.querySelectorAll('.hero-mega__bg, .hero__bg');
  if (!reduceMotion && !smallScreen && heroBgs.length > 0) {
    // mark elements so CSS can scale them to hide translate edges
    heroBgs.forEach(el => el.classList.add('is-parallax'));

    const FACTOR = 0.35; // image moves slower than scroll
    let ticking = false;

    const applyParallax = () => {
      const y = window.scrollY;
      heroBgs.forEach(el => {
        const hero = el.parentElement;
        // only animate while the hero is still in view
        if (hero && hero.getBoundingClientRect().bottom > 0) {
          el.style.transform = 'translate3d(0,' + (y * FACTOR) + 'px,0)';
        }
      });
      ticking = false;
    };

    const onScrollParallax = () => {
      if (!ticking) {
        window.requestAnimationFrame(applyParallax);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScrollParallax, { passive: true });
    applyParallax(); // set initial position
  }

  /* -----------------------------------------------------------
     SMOOTH SCROLL FOR ANCHOR LINKS
     ----------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});

// ============================================
// RUN N GUN SUB-TABS
// ============================================
// Allow-list of valid sub-tab targets (guards against malformed location.hash)
const RNG_TABS = ['what-is', 'first-time', 'rules', 'results'];

function activateTab(target, scrollIntoView) {
  if (RNG_TABS.indexOf(target) === -1) return;
  const tab = document.querySelector('.subnav__tab[data-tab="' + target + '"]');
  if (!tab) return;
  document.querySelectorAll('.subnav__tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  tab.classList.add('active');
  const el = document.getElementById('tab-' + target);
  if (el) {
    el.classList.add('active');
    el.querySelectorAll('.reveal').forEach(r => { observeReveal(r); });
  }
  if (scrollIntoView) {
    // Scroll to the activated content (fall back to the subnav)
    const anchor = el || document.querySelector('.subnav');
    if (anchor) {
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 80;
      const top = anchor.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }
}

document.querySelectorAll('.subnav__tab').forEach(tab => {
  tab.addEventListener('click', () => activateTab(tab.dataset.tab, false));
});

// Deep-link support: rng.html#results opens the matching sub-tab on load.
// Run after a frame so layout is ready and the scroll lands correctly.
if (document.querySelector('.subnav__tab')) {
  const hash = (location.hash || '').replace('#', '');
  if (hash) {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => activateTab(hash, true));
    });
  }
}

// ============================================
// RUN N GUN RESULTS — EVENT-TYPE FILTER
// ============================================
(function () {
  const select = document.getElementById('rng-event-filter');
  if (!select) return;
  const countEl = document.getElementById('rng-results-count');
  const items = Array.from(document.querySelectorAll('.results-item[data-type]'));
  const years = Array.from(document.querySelectorAll('.results-grid .results-year'));

  function apply() {
    const val = select.value;
    let shown = 0;
    items.forEach(item => {
      const match = (val === 'all' || item.dataset.type === val);
      item.style.display = match ? '' : 'none';
      if (match) shown++;
    });
    // Hide year headings + their list when no visible items in that group
    years.forEach(yr => {
      const list = yr.nextElementSibling; // .results-list
      if (!list) return;
      const anyVisible = Array.from(list.querySelectorAll('.results-item[data-type]'))
        .some(i => i.style.display !== 'none');
      yr.style.display = anyVisible ? '' : 'none';
      list.style.display = anyVisible ? '' : 'none';
    });
    if (countEl) countEl.textContent = shown + (shown === 1 ? ' result' : ' results');
  }

  select.addEventListener('change', apply);
  apply();
})();

// Helper to re-observe reveals
function observeReveal(el) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  obs.observe(el);
}
