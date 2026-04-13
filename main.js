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
     COUNTDOWN TIMER (targeting Jan 17, 2026)
     ----------------------------------------------------------- */
  const countdownEl = document.querySelector('.countdown');
  if (countdownEl) {
    const targetDate = new Date('2026-01-17T08:00:00-06:00'); // CST

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
document.querySelectorAll('.subnav__tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    // Deactivate all tabs + content
    document.querySelectorAll('.subnav__tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    // Activate clicked tab + content
    tab.classList.add('active');
    const el = document.getElementById('tab-' + target);
    if (el) {
      el.classList.add('active');
      // Re-trigger scroll reveals for newly visible content
      el.querySelectorAll('.reveal').forEach(r => {
        observeReveal(r);
      });
    }
  });
});

// Helper to re-observe reveals
function observeReveal(el) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  obs.observe(el);
}
