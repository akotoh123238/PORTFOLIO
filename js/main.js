/**
 * ==============================================================================
 * JOHN CARL M. LOYOLA - CLEAN PORTFOLIO INTERACTIVITY
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ----------------------------------------------------------------------------
  // 1. FULL 8-DIRECTIONAL GAZE TRACKER & INTERACTIVE ELASTIC FACE STRETCH
  // (N, NE, E, SE, S, SW, W, NW + Drag Face to Stretch with Rubber Physics)
  // ----------------------------------------------------------------------------
  const hudFrame = document.getElementById('hud-frame');
  const hudPhotoContainer = document.getElementById('hud-photo-container');
  const hudRadar = document.getElementById('hud-radar');
  const dirVal = document.getElementById('hud-dir-val');
  const hudModeText = document.getElementById('hud-mode-text');

  // Gaze Photo References for all 8 Directions + Center + Expressions
  const gazeImages = {
    center: document.getElementById('gaze-center'),
    north: document.getElementById('gaze-north'),
    ne: document.getElementById('gaze-ne'),
    east: document.getElementById('gaze-east'),
    se: document.getElementById('gaze-se'),
    south: document.getElementById('gaze-south'),
    sw: document.getElementById('gaze-sw'),
    west: document.getElementById('gaze-west'),
    nw: document.getElementById('gaze-nw'),
    smile: document.getElementById('gaze-smile'),
    cry: document.getElementById('gaze-cry'),
    scary: document.getElementById('gaze-scary')
  };

  let activeGazeKey = 'center';
  let isExpressionLocked = false;
  let clickCounter = 0;

  function setActiveGaze(key) {
    if (activeGazeKey === key) return;
    Object.keys(gazeImages).forEach(k => {
      if (gazeImages[k]) gazeImages[k].classList.remove('active');
    });
    if (gazeImages[key]) {
      gazeImages[key].classList.add('active');
      activeGazeKey = key;
    }
  }

  // --- INTERACTIVE FACE STRETCH (DRAG WITH MOUSE) ---
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let springTimeout = null;

  function triggerExpressionClick() {
    clickCounter = (clickCounter + 1) % 3;
    isExpressionLocked = true;

    if (clickCounter === 1) {
      setActiveGaze('smile');
      if (dirVal) dirVal.textContent = 'SMILE 😄';
      if (hudModeText) hudModeText.textContent = 'HAPPY 😄';
      showToast('Reaction: TARA PALAG NA TOH!');
    } else if (clickCounter === 2) {
      setActiveGaze('cry');
      if (dirVal) dirVal.textContent = 'DEBUG 😭';
      if (hudModeText) hudModeText.textContent = 'DEBUGGING 😭';
      showToast('Reaction: AWIT MAY ERROR');
    } else if (clickCounter === 3) {
      setActiveGaze('scary');
      if (dirVal) dirVal.textContent = 'SCARY 😱';
      if (hudModeText) hudModeText.textContent = 'SCARY 😱';
      showToast('Reaction: KATAKOT 😱');
    } else {
      isExpressionLocked = false;
      setActiveGaze('center');
      if (dirVal) dirVal.textContent = 'CENTER';
      if (hudModeText) hudModeText.textContent = 'TRACKING ON';
      showToast('🎯 8-Way Gaze Tracking Active');
    }
  }

  if (hudFrame) {
    // Start stretch drag
    hudFrame.addEventListener('pointerdown', (e) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      hudFrame.classList.add('is-stretching');
      if (hudPhotoContainer) {
        hudPhotoContainer.classList.remove('is-springing');
        clearTimeout(springTimeout);

        // Anchor stretch to wherever user grabbed
        const rect = hudPhotoContainer.getBoundingClientRect();
        const originX = ((e.clientX - rect.left) / rect.width) * 100;
        const originY = ((e.clientY - rect.top) / rect.height) * 100;
        hudPhotoContainer.style.transformOrigin = `${originX}% ${originY}%`;
      }
    });

    hudFrame.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerExpressionClick();
      }
    });
  }

  // Release stretch drag with rubber spring bounce
  window.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;

    const dragDist = Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY);

    if (hudFrame) {
      hudFrame.classList.remove('is-stretching');
    }

    if (dragDist > 6 && hudPhotoContainer) {
      // Elastic snap-back
      hudPhotoContainer.classList.add('is-springing');
      hudPhotoContainer.style.transform = 'translate3d(0, 0, 0) scale(1, 1) skew(0deg)';

      if (hudModeText) hudModeText.textContent = 'TRACKING ON';

      springTimeout = setTimeout(() => {
        if (hudPhotoContainer) {
          hudPhotoContainer.classList.remove('is-springing');
          hudPhotoContainer.style.transformOrigin = 'center center';
        }
      }, 650);
    } else {
      // Small tap / click triggers expression reaction
      triggerExpressionClick();
    }
  });

  // --- Real-time 8-Direction Mouse Tracking (N, S, E, W, NW, NE, SE, SW) ---
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  let targetShiftX = 0;
  let targetShiftY = 0;
  let currentShiftX = 0;
  let currentShiftY = 0;

  let targetRadarX = 0;
  let targetRadarY = 0;
  let currentRadarX = 0;
  let currentRadarY = 0;

  function calculate8Direction(deg) {
    const norm = (deg + 360) % 360;
    if (norm >= 337.5 || norm < 22.5) return 'E';
    if (norm >= 22.5 && norm < 67.5) return 'SE';
    if (norm >= 67.5 && norm < 112.5) return 'S';
    if (norm >= 112.5 && norm < 157.5) return 'SW';
    if (norm >= 157.5 && norm < 202.5) return 'W';
    if (norm >= 202.5 && norm < 247.5) return 'NW';
    if (norm >= 247.5 && norm < 292.5) return 'N';
    return 'NE';
  }

  function handleMouseMove(e) {
    // If currently dragging to stretch the face:
    if (isDragging && hudPhotoContainer) {
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;

      // Realistic volume-preserving elastic rubber deformation
      const scaleX = Math.max(0.4, Math.min(2.5, 1 + (dx / 95) - (Math.abs(dy) / 260)));
      const scaleY = Math.max(0.4, Math.min(2.5, 1 + (dy / 95) - (Math.abs(dx) / 260)));
      const skew = Math.max(-20, Math.min(20, (dx * dy) / 320));
      const transX = dx * 0.4;
      const transY = dy * 0.4;

      hudPhotoContainer.style.transform = `translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, 0) scale(${scaleX.toFixed(2)}, ${scaleY.toFixed(2)}) skew(${skew.toFixed(1)}deg)`;

      const stretchPercent = Math.round(Math.max(scaleX, scaleY) * 100);
      if (dirVal) dirVal.textContent = `STRETCH ${stretchPercent}%`;
      if (hudModeText) hudModeText.textContent = 'PULLING 🤏';
      return;
    }

    if (!hudFrame) return;

    // Unlock expression on mouse movement so gaze tracking takes over smoothly
    if (isExpressionLocked) {
      isExpressionLocked = false;
      clickCounter = 0;
      if (hudModeText) hudModeText.textContent = 'TRACKING ON';
    }

    const rect = hudFrame.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const dist = Math.hypot(deltaX, deltaY);

    // If mouse is near center of photo, look straight at camera
    if (dist < 60) {
      if (dirVal) dirVal.textContent = 'CENTER';
      setActiveGaze('center');
      targetTiltX = 0;
      targetTiltY = 0;
      targetShiftX = 0;
      targetShiftY = 0;
      targetRadarX = 0;
      targetRadarY = 0;
      return;
    }

    // Angle in degrees (-180 to 180)
    const angleDeg = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    const direction8 = calculate8Direction(angleDeg);

    if (dirVal) {
      dirVal.textContent = direction8;
    }

    // Exact 8-direction image mapping using all 8 photos:
    let gazeKey = 'center';
    if (direction8 === 'E') gazeKey = 'east';
    else if (direction8 === 'SE') gazeKey = 'se';
    else if (direction8 === 'S') gazeKey = 'south';
    else if (direction8 === 'SW') gazeKey = 'sw';
    else if (direction8 === 'W') gazeKey = 'west';
    else if (direction8 === 'NW') gazeKey = 'nw';
    else if (direction8 === 'N') gazeKey = 'north';
    else if (direction8 === 'NE') gazeKey = 'ne';

    setActiveGaze(gazeKey);

    // 3D Parallax Tilt
    const maxDistX = window.innerWidth / 2;
    const maxDistY = window.innerHeight / 2;
    const normX = Math.max(-1, Math.min(1, deltaX / maxDistX));
    const normY = Math.max(-1, Math.min(1, deltaY / maxDistY));

    targetTiltX = -normY * 15;
    targetTiltY = normX * 15;

    targetShiftX = normX * 8;
    targetShiftY = normY * 8;

    targetRadarX = -normX * 6;
    targetRadarY = -normY * 6;
  }

  function renderTrackerLoop() {
    const lerp = 0.12;
    currentTiltX += (targetTiltX - currentTiltX) * lerp;
    currentTiltY += (targetTiltY - currentTiltY) * lerp;
    currentShiftX += (targetShiftX - currentShiftX) * lerp;
    currentShiftY += (targetShiftY - currentShiftY) * lerp;
    currentRadarX += (targetRadarX - currentRadarX) * lerp;
    currentRadarY += (targetRadarY - currentRadarY) * lerp;

    if (hudFrame) {
      hudFrame.style.transform = `perspective(1000px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg)`;
    }

    // Only apply shift if not currently in stretch mode
    if (hudPhotoContainer && !isDragging && !hudPhotoContainer.classList.contains('is-springing')) {
      hudPhotoContainer.style.transform = `translate3d(${currentShiftX.toFixed(2)}px, ${currentShiftY.toFixed(2)}px, 0)`;
    }

    if (hudRadar) {
      hudRadar.style.transform = `translate3d(${currentRadarX.toFixed(2)}px, ${currentRadarY.toFixed(2)}px, 0)`;
    }

    requestAnimationFrame(renderTrackerLoop);
  }

  window.addEventListener('mousemove', handleMouseMove, { passive: true });

  window.addEventListener('mouseleave', () => {
    if (isDragging) return;
    targetTiltX = 0;
    targetTiltY = 0;
    targetShiftX = 0;
    targetShiftY = 0;
    targetRadarX = 0;
    targetRadarY = 0;
    if (dirVal) dirVal.textContent = 'CENTER';
    setActiveGaze('center');
  });

  requestAnimationFrame(renderTrackerLoop);

  // ----------------------------------------------------------------------------
  // 2. THEME TOGGLE (DARK / LIGHT MODE)
  // ----------------------------------------------------------------------------
  const themeToggle = document.getElementById('theme-toggle');
  const htmlRoot = document.documentElement;

  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  htmlRoot.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = htmlRoot.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      htmlRoot.setAttribute('data-theme', next);
      localStorage.setItem('portfolio-theme', next);
      showToast(next === 'dark' ? 'Switched to Dark Mode 🌙' : 'Switched to Light Mode ☀️');
    });
  }

  // ----------------------------------------------------------------------------
  // 3. NAVBAR SCROLL & READING PROGRESS BAR
  // ----------------------------------------------------------------------------
  const header = document.getElementById('header');
  const scrollBar = document.getElementById('scroll-progress');
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    if (scrollBar && docHeight > 0) {
      scrollBar.style.width = `${(scrollTop / docHeight) * 100}%`;
    }

    if (header) {
      if (scrollTop > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    if (backToTopBtn) {
      backToTopBtn.style.opacity = scrollTop > 400 ? '1' : '0.6';
    }
  }, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ----------------------------------------------------------------------------
  // 4. MOBILE NAVIGATION DRAWER
  // ----------------------------------------------------------------------------
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      menuToggle.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ----------------------------------------------------------------------------
  // 5. SIMPLE CONTACT FORM
  // ----------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const nameInput = document.getElementById('form-name');
  const emailInput = document.getElementById('form-email');
  const messageInput = document.getElementById('form-message');
  const feedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('submit-btn');

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val).toLowerCase());

  const setError = (input, hasErr) => {
    const parent = input.closest('.form-group');
    if (parent) {
      if (hasErr) parent.classList.add('has-error');
      else parent.classList.remove('has-error');
    }
  };

  [nameInput, emailInput, messageInput].forEach(inp => {
    if (inp) {
      inp.addEventListener('input', () => setError(inp, false));
    }
  });

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let valid = true;

      if (!nameInput.value.trim()) {
        setError(nameInput, true);
        valid = false;
      }
      if (!validateEmail(emailInput.value.trim())) {
        setError(emailInput, true);
        valid = false;
      }
      if (!messageInput.value.trim()) {
        setError(messageInput, true);
        valid = false;
      }

      if (!valid) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending...</span>';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Send Message</span> <i class="fa-regular fa-paper-plane"></i>';

        feedback.className = 'form-feedback success';
        feedback.textContent = `Thank you, ${nameInput.value.trim()}! Your message has been sent.`;
        feedback.style.display = 'block';

        showToast('Message sent successfully! 🚀');
        contactForm.reset();

        setTimeout(() => {
          feedback.style.display = 'none';
        }, 6000);
      }, 800);
    });
  }

  // ----------------------------------------------------------------------------
  // 6. DEMO LINK TRIGGERS
  // ----------------------------------------------------------------------------
  document.querySelectorAll('.project-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const proj = btn.getAttribute('data-project');
      showToast(`Opening preview for ${proj}...`);
    });
  });

  // ----------------------------------------------------------------------------
  // 7. TOAST NOTIFICATIONS
  // ----------------------------------------------------------------------------
  const toastContainer = document.getElementById('toast-container');

  function showToast(msg, duration = 2800) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-info"></i> <span>${msg}</span>`;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Current year in footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  console.log('✨ Clean Portfolio ready.');
});
