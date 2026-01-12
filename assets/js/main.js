/**
 * Christian SMP - Interactive JavaScript
 * Parallax, scroll animations, cursor effects
 */

(function() {
  'use strict';

  // ============================================================
  // CURSOR GLOW EFFECT
  // ============================================================

  const cursorGlow = document.createElement('div');
  cursorGlow.className = 'cursor-glow';
  document.body.appendChild(cursorGlow);

  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorGlow.classList.add('cursor-glow--active');
  });

  document.addEventListener('mouseleave', () => {
    cursorGlow.classList.remove('cursor-glow--active');
  });

  // Smooth cursor following
  function animateCursor() {
    const ease = 0.15;
    cursorX += (mouseX - cursorX) * ease;
    cursorY += (mouseY - cursorY) * ease;
    cursorGlow.style.left = cursorX + 'px';
    cursorGlow.style.top = cursorY + 'px';
    requestAnimationFrame(animateCursor);
  }

  // Only enable cursor glow on desktop
  if (window.matchMedia('(pointer: fine)').matches) {
    animateCursor();
  }

  // ============================================================
  // MOBILE NAVIGATION
  // ============================================================

  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  const navLinks = document.querySelectorAll('.nav__link');

  function toggleNav() {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    nav.classList.toggle('nav--open');
    document.body.style.overflow = !isExpanded ? 'hidden' : '';
  }

  function closeNav() {
    navToggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('nav--open');
    document.body.style.overflow = '';
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', toggleNav);

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (nav.classList.contains('nav--open')) {
          closeNav();
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('nav--open')) {
        closeNav();
        navToggle.focus();
      }
    });
  }

  // ============================================================
  // HEADER SCROLL STATE
  // ============================================================

  const header = document.querySelector('.header');
  let lastScrollY = 0;
  let ticking = false;

  function updateHeader() {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  if (header) {
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });

    // Initial check
    updateHeader();
  }

  // ============================================================
  // PARALLAX SCROLLING
  // ============================================================

  const heroArtwork = document.querySelectorAll('.hero__artwork img');
  let parallaxTicking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    heroArtwork.forEach(img => {
      const hero = img.closest('.hero');
      if (!hero) return;

      const heroRect = hero.getBoundingClientRect();
      const heroTop = heroRect.top + scrollY;
      const heroHeight = heroRect.height;

      // Only animate when hero is in view
      if (scrollY < heroTop + heroHeight) {
        // Parallax: image moves slower than scroll
        const parallaxOffset = scrollY * 0.4;
        // Scale slightly as you scroll for depth
        const scale = 1 + (scrollY / windowHeight) * 0.1;

        img.style.transform = `translateY(${parallaxOffset}px) scale(${Math.min(scale, 1.15)})`;
      }
    });

    parallaxTicking = false;
  }

  if (heroArtwork.length > 0) {
    window.addEventListener('scroll', () => {
      if (!parallaxTicking) {
        requestAnimationFrame(updateParallax);
        parallaxTicking = true;
      }
    }, { passive: true });
  }

  // ============================================================
  // REVEAL ON SCROLL (IntersectionObserver)
  // ============================================================

  const revealElements = document.querySelectorAll('.reveal');
  const revealStaggerElements = document.querySelectorAll('.reveal-stagger');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -80px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-stagger--visible');
          staggerObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealStaggerElements.forEach(el => staggerObserver.observe(el));
  } else {
    // Fallback
    revealElements.forEach(el => el.classList.add('reveal--visible'));
    revealStaggerElements.forEach(el => el.classList.add('reveal-stagger--visible'));
  }

  // ============================================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================================

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerHeight = 64;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================================
  // ACTIVE NAV LINK
  // ============================================================

  function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
      const linkHref = link.getAttribute('href');
      const linkPage = linkHref.split('/').pop();

      link.classList.remove('nav__link--active');

      if (linkPage === currentPage ||
          (currentPage === '' && linkPage === 'index.html') ||
          (currentPage === 'index.html' && (linkHref === './' || linkHref === 'index.html')) ||
          (currentPath.endsWith('/') && (linkHref === './' || linkHref === 'index.html'))) {
        link.classList.add('nav__link--active');
      }
    });
  }

  setActiveNavLink();

  // ============================================================
  // INTERACTIVE HOVER EFFECTS ON CARDS
  // ============================================================

  const cards = document.querySelectorAll('.card, .panel--interactive');

  cards.forEach(card => {
    card.addEventListener('mouseenter', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.style.setProperty('--mouse-x', `${x}px`);
      this.style.setProperty('--mouse-y', `${y}px`);
    });

    card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.style.setProperty('--mouse-x', `${x}px`);
      this.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // ============================================================
  // TILT EFFECT ON HERO (subtle)
  // ============================================================

  const hero = document.querySelector('.hero');

  if (hero && window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const artwork = hero.querySelector('.hero__artwork img');
      if (artwork) {
        const tiltX = y * 5; // degrees
        const tiltY = -x * 5;
        const currentTransform = artwork.style.transform || '';
        // Extract existing translateY and scale
        const translateMatch = currentTransform.match(/translateY\(([^)]+)\)/);
        const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/);

        const translateY = translateMatch ? translateMatch[0] : 'translateY(0px)';
        const scale = scaleMatch ? scaleMatch[0] : 'scale(1)';

        artwork.style.transform = `${translateY} ${scale} rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      }
    });

    hero.addEventListener('mouseleave', () => {
      const artwork = hero.querySelector('.hero__artwork img');
      if (artwork) {
        // Reset tilt but keep parallax
        const currentTransform = artwork.style.transform || '';
        const translateMatch = currentTransform.match(/translateY\(([^)]+)\)/);
        const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/);

        const translateY = translateMatch ? translateMatch[0] : 'translateY(0px)';
        const scale = scaleMatch ? scaleMatch[0] : 'scale(1)';

        artwork.style.transform = `${translateY} ${scale}`;
      }
    });
  }

  // ============================================================
  // SCROLL INDICATOR HIDE ON SCROLL
  // ============================================================

  const scrollIndicator = document.querySelector('.hero__scroll');

  if (scrollIndicator) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.pointerEvents = 'none';
      } else {
        scrollIndicator.style.opacity = '1';
        scrollIndicator.style.pointerEvents = 'auto';
      }
    }, { passive: true });
  }

  // ============================================================
  // IMAGE LAZY LOADING WITH FADE
  // ============================================================

  const lazyImages = document.querySelectorAll('img[loading="lazy"]');

  lazyImages.forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';

    if (img.complete) {
      img.style.opacity = '1';
    } else {
      img.addEventListener('load', () => {
        img.style.opacity = '1';
      });
    }
  });

  // ============================================================
  // REDUCED MOTION
  // ============================================================

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function handleReducedMotion() {
    if (prefersReducedMotion.matches) {
      document.documentElement.style.scrollBehavior = 'auto';

      // Disable parallax
      heroArtwork.forEach(img => {
        img.style.transform = '';
      });

      // Show all reveal elements
      revealElements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });

      // Hide cursor glow
      cursorGlow.style.display = 'none';
    }
  }

  handleReducedMotion();
  prefersReducedMotion.addEventListener('change', handleReducedMotion);

  // ============================================================
  // EXTERNAL LINKS
  // ============================================================

  document.querySelectorAll('a[href^="http"]').forEach(link => {
    if (!link.hostname.includes(window.location.hostname)) {
      link.setAttribute('rel', 'noopener noreferrer');
      link.setAttribute('target', '_blank');
    }
  });

})();
