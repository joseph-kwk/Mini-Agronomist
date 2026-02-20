/**
 * shared-nav.js  — Universal navigation bar for Mini Agronomist
 * 
 * Usage:
 *   <script src="js/shared-nav.js"></script>
 *   The script auto-injects the header at DOMContentLoaded.
 *   Add <div id="shared-nav"></div> at the top of <body>, OR the script
 *   will prepend to <body> automatically.
 */
(function () {
  'use strict';

  /* ---------- helpers ---------- */
  const page = location.pathname.split('/').pop() || 'index.html';

  function isActive(href) {
    if (href === '#' && page === 'index.html') return true;
    return href === page;
  }

  /* ---------- nav links ---------- */
  const links = [
    { href: 'index.html', label: '🌾 Yield Predictor', i18n: 'nav.yield' },
    { href: 'plant-scanner.html', label: '📸 Plant Scanner', badge: null },
    { href: 'smart-dashboard.html', label: '🧠 Smart Dashboard', badge: null },
    { href: 'ml_demo.html', label: '🤖 ML Analytics', i18n: 'nav.ml' }
  ];

  /* ---------- build HTML ---------- */
  function buildNav() {
    const navLinks = links.map(l => {
      const cls = ['nav-link-item'];
      if (isActive(l.href)) cls.push('active');

      let inner = `<span${l.i18n ? ` data-i18n="${l.i18n}"` : ''}>${l.label}</span>`;
      if (l.badge) inner += `<span class="nav-badge">${l.badge}</span>`;

      return `<a href="${l.href}" role="button" tabindex="0" class="${cls.join(' ')}">${inner}</a>`;
    }).join('\n            ');

    return `
  <header role="banner" id="mainHeader" class="shared-header">
    <div class="header-container">
      <a href="index.html" class="nav-brand" title="Mini Agronomist - Agricultural Intelligence Platform">
        <img src="assets/icons/logo.png" alt="Mini Agronomist" class="nav-logo" width="48" height="48">
        <span>Mini Agronomist</span>
      </a>
      <div class="header-actions">
        <nav class="nav-links" role="navigation" id="navLinks">
            ${navLinks}
        </nav>
        <div class="header-buttons">
          <button id="themeBtn" class="icon-btn" aria-label="Toggle dark mode"
            title="🌙 Toggle Theme" onclick="typeof toggleTheme==='function'&&toggleTheme()">
            <span class="material-icons">dark_mode</span>
          </button>
          <button id="helpBtn" class="icon-btn" aria-label="Help"
            title="📖 Help & Tutorial" data-i18n-title="btn.help">
            <span class="material-icons">help_outline</span>
          </button>
          <button id="settingsBtn" class="icon-btn" aria-label="Settings"
            title="⚙️ Settings" data-i18n-title="btn.settings">
            <span class="material-icons">settings</span>
          </button>
          <button id="mobileMenuBtn" class="icon-btn mobile-menu-btn" aria-label="Menu"
            title="🔽 Menu">
            <span class="material-icons">menu</span>
          </button>
        </div>
      </div>
    </div>
  </header>`;
  }

  /* ---------- inject ---------- */
  function inject() {
    // Remove any existing headers first
    const existingHeaders = document.querySelectorAll('header[role="banner"], .dash-header, .shared-header');
    existingHeaders.forEach(h => h.remove());

    // Also remove old scanner header (logo + title inside .container)
    const scannerContainer = document.getElementById('mainContainer');
    if (scannerContainer) {
      const oldHeader = scannerContainer.querySelector('header');
      if (oldHeader) {
        // Keep the h1 and p, move them into the container, remove the header wrapper
        const h1 = oldHeader.querySelector('h1');
        const p = oldHeader.querySelector('p');
        const deviceInfo = oldHeader.querySelector('#deviceInfo');
        oldHeader.remove();

        // Re-add the scanner-specific sub-heading
        if (h1 || p) {
          const subHeader = document.createElement('div');
          subHeader.className = 'scanner-page-title';
          subHeader.style.cssText = 'text-align:center;color:white;margin-bottom:24px;padding-top:12px;';
          if (h1) subHeader.appendChild(h1);
          if (p) subHeader.appendChild(p);
          if (deviceInfo) subHeader.appendChild(deviceInfo);
          scannerContainer.prepend(subHeader);
        }
      }
    }

    // Create new header
    const wrapper = document.createElement('div');
    wrapper.innerHTML = buildNav();
    const header = wrapper.firstElementChild;

    // Prepend to body
    document.body.prepend(header);

    // Wire up mobile menu toggle
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navLinksEl = document.getElementById('navLinks');
    if (menuBtn && navLinksEl) {
      menuBtn.addEventListener('click', () => {
        navLinksEl.classList.toggle('mobile-open');
        const icon = menuBtn.querySelector('.material-icons');
        if (icon) icon.textContent = navLinksEl.classList.contains('mobile-open') ? 'close' : 'menu';
      });
    }

    // Theme icon is now handled centrally by js/theme.js


    // Scroll shadow
    const mainHeader = document.getElementById('mainHeader');
    if (mainHeader) {
      window.addEventListener('scroll', () => {
        mainHeader.classList.toggle('scrolled', window.scrollY > 10);
      }, { passive: true });
    }

    // Adjust scanner page container padding
    if (page === 'plant-scanner.html') {
      const container = document.getElementById('mainContainer');
      if (container) container.style.paddingTop = '20px';
    }
  }

  /* ---------- run ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
