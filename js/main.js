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
      } else if (e.key === '1') {
        e.preventDefault();
        clickCounter = 0;
        triggerExpressionClick();
      } else if (e.key === '2') {
        e.preventDefault();
        clickCounter = 1;
        triggerExpressionClick();
      } else if (e.key === '3') {
        e.preventDefault();
        clickCounter = 2;
        triggerExpressionClick();
      } else if (e.key === 'Escape' || e.key === '0') {
        e.preventDefault();
        resetToTracking();
        showToast('🎯 8-Way Gaze Tracking Active');
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

    const rect = hudFrame.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    // 3D Parallax Tilt & Shift (keeps responding even during reactions)
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

    // If an expression reaction is active (Smile, Cry, Scary), maintain it and do not overwrite with gaze tracking
    if (isExpressionLocked) {
      return;
    }

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
  }

  function renderTrackerLoop() {
    const lerp = 0.12;
    currentTiltX += (targetTiltX - currentTiltX) * lerp;
    currentTiltY += (targetTiltY - currentTiltY) * lerp;
    currentShiftX += (targetShiftX - currentShiftX) * lerp;
    currentShiftY += (targetShiftY - currentShiftY) * lerp;
    currentRadarX += (targetRadarX - currentRadarX) * lerp;
    currentRadarY += (targetRadarY - currentRadarY) * lerp;



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
    if (!isExpressionLocked) {
      if (dirVal) dirVal.textContent = 'CENTER';
      setActiveGaze('center');
    }
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

  // ----------------------------------------------------------------------------
  // 6b. SKILLS CATEGORY CLICK-TO-REVEAL LOGIC
  // (Cards are hidden by default, revealed on user click, toggleable)
  // ----------------------------------------------------------------------------
  const skillFilterBtns = document.querySelectorAll('.skills-filter-btn');
  const skillCategoryCards = document.querySelectorAll('.skill-category-card');
  const skillsGrid = document.getElementById('skills-grid');
  const skillsEmptyState = document.getElementById('skills-empty-state');
  const cardCloseBtns = document.querySelectorAll('.card-close-btn');

  let activeSkillFilter = null;

  function closeAllSkillCards() {
    skillFilterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    skillCategoryCards.forEach(card => {
      card.classList.remove('is-visible');
    });
    if (skillsEmptyState) {
      skillsEmptyState.classList.remove('is-hidden');
    }
    if (skillsGrid) {
      skillsGrid.style.gridTemplateColumns = '';
      skillsGrid.classList.remove('view-all-mode');
    }
    activeSkillFilter = null;
  }

  function openSkillCategory(filter) {
    if (activeSkillFilter === filter) {
      // Clicking the already open category closes it (toggle behavior)
      closeAllSkillCards();
      return;
    }

    activeSkillFilter = filter;

    skillFilterBtns.forEach(b => {
      const isMatch = b.getAttribute('data-filter') === filter;
      b.classList.toggle('active', isMatch);
      b.setAttribute('aria-selected', String(isMatch));
    });

    if (skillsEmptyState) {
      skillsEmptyState.classList.add('is-hidden');
    }

    skillCategoryCards.forEach(card => {
      const category = card.getAttribute('data-category');
      const isMatch = filter === 'all' || category === filter;
      card.classList.toggle('is-visible', isMatch);
    });

    if (skillsGrid) {
      skillsGrid.style.gridTemplateColumns = '';
      skillsGrid.classList.toggle('view-all-mode', filter === 'all');
    }
  }

  if (skillFilterBtns.length > 0) {
    skillFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        openSkillCategory(filter);
      });
    });
  }

  if (cardCloseBtns.length > 0) {
    cardCloseBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const parentCard = btn.closest('.skill-category-card');
        if (parentCard && activeSkillFilter === 'all') {
          parentCard.classList.remove('is-visible');
          const remainingVisible = document.querySelectorAll('.skill-category-card.is-visible');
          if (remainingVisible.length === 0) {
            closeAllSkillCards();
          }
        } else {
          closeAllSkillCards();
        }
      });
    });
  }

  // Current year in footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  console.log('✨ Clean Portfolio ready.');
});

/**
 * Portfolio chatbot (rule-based, no backend).
 * Edit KNOWLEDGE to change what it can answer, PHOTO for the avatar.
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const EMAIL = 'loyolajohncarl8@gmail.com';
  const PHOTO = 'assets/images/neutral.png';

  const KNOWLEDGE = [
    {
      keys: ['hi', 'hello', 'hey', 'kumusta', 'kamusta', 'musta', 'yo', 'good morning', 'good evening'],
      answer: ["Hello po! 👋 Anong gusto mong malaman tungkol kay John Carl?", "Uy, hi! 😊 Skills, projects, o contact — tanong ka lang."]
    },
    {
      keys: ['who', 'sino', 'about', 'yourself', 'introduce', 'john carl', 'name'],
      answer: ["Si <b>John Carl M. Loyola</b> ay web developer mula sa Pilipinas. Mahilig siyang gumawa ng clean, responsive, at madaling gamitin na websites, at lagi siyang natututo ng bago. 💻"]
    },
    {
      keys: ['skill', 'tech', 'stack', 'tools', 'language', 'know', 'marunong', 'gamit'],
      answer: ["Eto yung mga gamit niya:<br><b>Frontend:</b> HTML5, CSS3, JavaScript, React, Tailwind CSS<br><b>Backend:</b> Node.js, Express, Python, MySQL, MongoDB, REST APIs<br><b>Engineering & CAD:</b> AutoCAD, SketchUp<br><b>Tools:</b> Git/GitHub, VS Code, Figma, Vercel/Netlify"]
    },
    {
      keys: ['autocad', 'cad', 'sketchup', 'drafting', '3d', 'modeling'],
      answer: ["Marunong din si John Carl sa <b>AutoCAD</b> at <b>SketchUp</b> para sa 2D technical drafting, 3D modeling, at engineering/architectural layouts! 📐🏢"]
    },
    {
      keys: ['frontend', 'front-end', 'react', 'html', 'css', 'javascript', 'tailwind'],
      answer: ["Sa frontend, gamit niya ang HTML5, CSS3, JavaScript (ES6+), React, at Tailwind CSS. Importante rin sa kanya na responsive sa lahat ng device. 📱"]
    },
    {
      keys: ['backend', 'back-end', 'node', 'express', 'python', 'sql', 'mysql', 'mongo', 'database', 'api'],
      answer: ["Sa backend naman: Node.js, Express.js, Python, SQL/MySQL, MongoDB, at RESTful APIs. 🛠️"]
    },
    {
      keys: ['resume', 'cv', 'curriculum vitae', 'download resume', 'biodata'],
      answer: ["Pwede mong i-download o tingnan ang official resume ni John Carl dito:<br>📄 <a href=\"assets/docs/John_Carl_Loyola_Resume.pdf\" download=\"John_Carl_Loyola_Resume.pdf\"><b>Download PDF Resume</b></a><br>📝 <a href=\"assets/docs/John_Carl_Loyola_Resume.docx\" download=\"John_Carl_Loyola_Resume.docx\"><b>Download Word (.docx)</b></a><br>👁️ <a href=\"resume.html\" target=\"_blank\"><b>Preview Resume Online</b></a>"]
    },
    {
      keys: ['experience', 'work', 'job', 'drafter', 'office assistant'],
      answer: ["Experience ni John Carl: <b>Part-Time Office Assistant / AutoCAD Drafter</b> (2025 &ndash; Present, Project-Based). Nag-o-organize ng files at nagpe-prepare ng technical drawings at layouts gamit ang AutoCAD! 📐"]
    },
    {
      keys: ['project', 'work', 'portfolio', 'gawa', 'built', 'made', 'urstamp', 'thesis'],
      answer: ["Ilan sa mga totoong projects niya:<br>🏆 <b>URStamp</b> &ndash; 1st Place System Making (React, TypeScript, Cloudflare D1)<br>🍸 <b>Cocktail Vending Machine</b> &ndash; Thesis Project (Arduino, Raspberry Pi, Python, AutoCAD)<br>⛪ <b>JA1 Church Management</b> &ndash; (HTML, CSS, JS, Firebase)<br>🍗 <b>Mang Inasal Kiosk System</b> &ndash; (VB.Net)<br>📦 <b>Wooden Bizarre System</b> &ndash; (React, PostgreSQL)<br><a href=\"#projects\">Tingnan sa Projects section</a>"]
    },
    {
      keys: ['education', 'school', 'degree', 'course', 'study', 'college', 'aral', 'elementary', 'high school', 'shs', 'jhs', 'urs'],
      answer: ["Eto ang educational background ni John Carl:<br>🏛️ <b>College:</b> BS in Computer Engineering &bull; University of Rizal System – Antipolo Campus (Expected: 2027)<br>🏫 <b>Senior High:</b> Sumulong College of Arts and Sciences &bull; ABM (2021&ndash;2023)<br>📖 <b>Junior High:</b> Rockfort Christian Academy<br>🎒 <b>Elementary:</b> Isaias S. Tapales Elementary School<br><a href=\"#about\">Tingnan sa About section</a> 🎓"]
    },
    {
      keys: ['contact', 'email', 'reach', 'hire', 'message', 'mail', 'collab', 'kausap'],
      answer: [`Pwede mo siyang i-email sa <a href="mailto:${EMAIL}">${EMAIL}</a>, o mag-message ka sa <a href="#contact">contact form</a>. Mabilis naman siyang sumagot! ✉️`]
    },
    {
      keys: ['where', 'location', 'saan', 'philippines', 'remote', 'based'],
      answer: ["Nasa Pilipinas siya 🇵🇭 at open din sa remote work."]
    },
    {
      keys: ['available', 'availability', 'open to', 'freelance', 'job', 'opportunit', 'trabaho'],
      answer: ["Yes po, available siya para sa projects at opportunities! Mag-message ka lang sa <a href=\"#contact\">contact section</a>. 🙌"]
    },
    {
      keys: ['github', 'linkedin', 'social'],
      answer: ["Nandoon sa taas (hero) at sa contact section yung GitHub, LinkedIn, at email niya."]
    },
    {
      keys: ['thanks', 'thank you', 'salamat', 'ty'],
      answer: ["Walang anuman! 😊 May iba ka pa bang gustong itanong?"]
    },
    {
      keys: ['bye', 'goodbye', 'paalam'],
      answer: ["Salamat sa pagbisita! Balik ka ulit. 👋"]
    }
  ];

  const FALLBACK = ["Ay, di ko pa alam yan. 😅 Pwede mo akong tanungin tungkol sa <b>skills</b>, <b>projects</b>, <b>education</b>, o <b>contact</b>.",
    "Hmm, medyo labas na yan sa alam ko. 🙈 Subukan mo ang skills, projects, o contact — o i-message mo mismo si John Carl sa contact form."];
  const SUGGESTIONS = ['Sino si John Carl?', 'Skills', 'Projects', 'Download Resume', 'Contact'];
  const TEASER = 'Uy! 👋 May tanong ka kay John Carl?';

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const timeNow = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const imgAttrs = `src="${PHOTO}" alt="" onerror="this.style.visibility='hidden'"`;

  // ---- Build DOM ----
  const root = document.createElement('div');
  root.innerHTML = `
    <div class="chatbot-teaser" id="chatbot-teaser">${TEASER}</div>
    <button class="chatbot-toggle" id="chatbot-toggle" aria-label="Open chat" aria-expanded="false" aria-controls="chatbot-window">
      <img class="chat-photo" ${imgAttrs}>
      <i class="fa-solid fa-xmark icon-close"></i>
      <span class="online-dot"></span>
    </button>
    <div class="chatbot-window" id="chatbot-window" role="dialog" aria-label="Chat with John Carl's assistant" aria-hidden="true">
      <div class="chatbot-header">
        <div class="chatbot-avatar">
          <img class="chat-photo" ${imgAttrs}>
          <span class="online-dot"></span>
        </div>
        <div>
          <div class="chatbot-title">John Carl's Assistant</div>
          <div class="chatbot-status">Active now • Instant replies</div>
        </div>
      </div>
      <div class="chatbot-messages" id="chatbot-messages" aria-live="polite"></div>
      <div class="chatbot-suggestions" id="chatbot-suggestions"></div>
      <form class="chatbot-form" id="chatbot-form" autocomplete="off">
        <input type="text" class="chatbot-input" id="chatbot-input" placeholder="Mag-type ng message..." aria-label="Message">
        <button type="submit" class="chatbot-send" aria-label="Send"><i class="fa-solid fa-paper-plane"></i></button>
      </form>
    </div>`;
  document.body.appendChild(root);

  const toggle = document.getElementById('chatbot-toggle');
  const win = document.getElementById('chatbot-window');
  const teaser = document.getElementById('chatbot-teaser');
  const messages = document.getElementById('chatbot-messages');
  const suggestions = document.getElementById('chatbot-suggestions');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');

  let greeted = false;

  function scrollDown() { messages.scrollTop = messages.scrollHeight; }

  function addMessage(html, who) {
    // Only the last bot message in a run shows the little avatar
    if (who === 'bot') {
      const prev = messages.querySelector('.chat-row.bot.last');
      if (prev) prev.classList.remove('last');
    }
    const row = document.createElement('div');
    row.className = `chat-row ${who}` + (who === 'bot' ? ' last' : '');
    const bubble = document.createElement('div');
    bubble.className = 'chat-msg';
    if (who === 'user') bubble.textContent = html; else bubble.innerHTML = html;
    const time = document.createElement('div');
    time.className = 'chat-time';
    time.textContent = timeNow();
    const col = document.createElement('div');
    col.className = 'chat-col';
    col.append(bubble, time);
    if (who === 'bot') row.insertAdjacentHTML('beforeend', `<img class="chat-mini" ${imgAttrs}>`);
    row.appendChild(col);
    messages.appendChild(row);
    scrollDown();
  }

  function findAnswer(text) {
    const q = text.toLowerCase();
    let best = null;
    let bestScore = 0;
    KNOWLEDGE.forEach(item => {
      let score = 0;
      item.keys.forEach(k => {
        const hit = k.length <= 3 ? new RegExp(`\\b${k}\\b`).test(q) : q.includes(k);
        if (hit) score += k.length;
      });
      if (score > bestScore) { bestScore = score; best = item; }
    });
    return pick(best ? best.answer : FALLBACK);
  }

  function reply(text) {
    const answer = findAnswer(text);
    const typing = document.createElement('div');
    typing.className = 'chat-row bot';
    typing.innerHTML = `<img class="chat-mini" style="visibility:visible" ${imgAttrs}><div class="chat-typing"><span></span><span></span><span></span></div>`;
    setTimeout(() => { messages.appendChild(typing); scrollDown(); }, 250);
    // Longer answers take a little longer, like a real person typing
    const delay = Math.min(450 + answer.length * 6, 1800);
    setTimeout(() => {
      typing.remove();
      addMessage(answer, 'bot');
    }, delay);
  }

  function send(text) {
    const t = text.trim();
    if (!t) return;
    addMessage(t, 'user');
    reply(t);
  }

  SUGGESTIONS.forEach(s => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chat-chip';
    chip.textContent = s;
    chip.addEventListener('click', () => send(s));
    suggestions.appendChild(chip);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    send(input.value);
    input.value = '';
  });

  function setOpen(open) {
    win.classList.toggle('open', open);
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    win.setAttribute('aria-hidden', String(!open));
    teaser.classList.remove('show');
    if (open) {
      if (!greeted) {
        greeted = true;
        const day = document.createElement('div');
        day.className = 'chat-day';
        day.textContent = 'Today';
        messages.appendChild(day);
        setTimeout(() => addMessage("Hello po! 👋 Ako ang assistant ni <b>John Carl</b>.", 'bot'), 300);
        setTimeout(() => addMessage("Anong gusto mong malaman? Pwede mong i-tap yung mga suggestion sa baba o mag-type ka lang. 😊", 'bot'), 1100);
      }
      setTimeout(() => input.focus(), 250);
    }
  }

  toggle.addEventListener('click', () => setOpen(!win.classList.contains('open')));
  teaser.addEventListener('click', () => setOpen(true));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && win.classList.contains('open')) setOpen(false);
  });
  messages.addEventListener('click', (e) => {
    if (e.target.closest('a[href^="#"]')) setOpen(false);
  });

  // Friendly nudge after a few seconds (once per visit)
  let teased = false;
  try { teased = sessionStorage.getItem('chat-teased') === '1'; } catch (e) {}
  if (!teased) {
    setTimeout(() => {
      if (!win.classList.contains('open')) {
        teaser.classList.add('show');
        try { sessionStorage.setItem('chat-teased', '1'); } catch (e) {}
        setTimeout(() => teaser.classList.remove('show'), 7000);
      }
    }, 4000);
  }
});