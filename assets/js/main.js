/**
 * Christian SMP - Main JavaScript
 * Vanilla JS only, no external dependencies
 */

(function() {
  'use strict';

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

    // Prevent body scroll when nav is open
    document.body.style.overflow = !isExpanded ? 'hidden' : '';
  }

  function closeNav() {
    navToggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('nav--open');
    document.body.style.overflow = '';
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', toggleNav);

    // Close nav when clicking a link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (nav.classList.contains('nav--open')) {
          closeNav();
        }
      });
    });

    // Close nav on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('nav--open')) {
        closeNav();
        navToggle.focus();
      }
    });

    // Close nav when clicking outside
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('nav--open') &&
          !nav.contains(e.target) &&
          !navToggle.contains(e.target)) {
        closeNav();
      }
    });
  }

  // ============================================================
  // SMOOTH SCROLLING
  // ============================================================

  // Handle anchor links with smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');

      // Skip if it's just "#"
      if (href === '#') return;

      const target = document.querySelector(href);

      if (target) {
        e.preventDefault();

        const headerHeight = 72; // Fixed header height
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Update focus for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });

  // ============================================================
  // INTERSECTION OBSERVER - FADE IN ANIMATIONS
  // ============================================================

  const fadeElements = document.querySelectorAll('.fade-in, .fade-in-up');

  if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add visible class
          entry.target.classList.add(
            entry.target.classList.contains('fade-in') ? 'fade-in--visible' : 'fade-in-up--visible'
          );

          // Stop observing once animated
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    });

    fadeElements.forEach(el => fadeObserver.observe(el));
  } else {
    // Fallback: show all elements immediately
    fadeElements.forEach(el => {
      el.classList.add('fade-in--visible', 'fade-in-up--visible');
    });
  }

  // ============================================================
  // HEADER SCROLL BEHAVIOR
  // ============================================================

  const header = document.querySelector('.header');
  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateHeader() {
    const currentScrollY = window.scrollY;

    // Add shadow when scrolled
    if (currentScrollY > 10) {
      header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
      header.style.boxShadow = 'none';
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  if (header) {
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
  }

  // ============================================================
  // ACTIVE NAV LINK HIGHLIGHTING
  // ============================================================

  function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
      const linkHref = link.getAttribute('href');
      const linkPage = linkHref.split('/').pop();

      if (linkPage === currentPage ||
          (currentPage === '' && linkPage === 'index.html') ||
          (currentPage === 'index.html' && linkHref === './') ||
          (currentPath.endsWith('/') && linkHref === './')) {
        link.classList.add('nav__link--active');
      } else {
        link.classList.remove('nav__link--active');
      }
    });
  }

  setActiveNavLink();

  // ============================================================
  // REDUCED MOTION SUPPORT
  // ============================================================

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function handleReducedMotion() {
    if (prefersReducedMotion.matches) {
      // Disable smooth scrolling
      document.documentElement.style.scrollBehavior = 'auto';

      // Show all fade elements immediately
      document.querySelectorAll('.fade-in, .fade-in-up').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.transition = 'none';
      });
    }
  }

  handleReducedMotion();
  prefersReducedMotion.addEventListener('change', handleReducedMotion);

  // ============================================================
  // EXTERNAL LINKS
  // ============================================================

  // Add rel="noopener noreferrer" to external links
  document.querySelectorAll('a[href^="http"]').forEach(link => {
    if (!link.hostname.includes(window.location.hostname)) {
      link.setAttribute('rel', 'noopener noreferrer');
      link.setAttribute('target', '_blank');
    }
  });

  // ============================================================
  // COPY TO CLIPBOARD (for server IP)
  // ============================================================

  const copyButtons = document.querySelectorAll('[data-copy]');

  copyButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const textToCopy = button.getAttribute('data-copy');

      try {
        await navigator.clipboard.writeText(textToCopy);

        // Visual feedback
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.color = 'var(--color-accent)';

        setTimeout(() => {
          button.textContent = originalText;
          button.style.color = '';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    });
  });

})();
