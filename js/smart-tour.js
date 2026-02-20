/**
 * smart-tour.js — Interactive guided tour for Mini Agronomist
 * 
 * Usage:
 *   <script src="js/smart-tour.js" defer></script>
 *   Tour auto-launches on first visit. Can be re-triggered via Help button.
 */
(function () {
    'use strict';

    /* ---------- Tour Steps Definition ---------- */
    const TOURS = {
        'index.html': [
            {
                target: '.nav-brand',
                title: 'Welcome to Mini Agronomist! 🌱',
                text: 'Your AI-powered agricultural intelligence platform. Let\'s take a quick tour of what you can do.',
                position: 'bottom'
            },
            {
                target: '.nav-links',
                title: 'Navigation',
                text: 'Jump between tools: <b>Yield Predictor</b>, <b>Plant Scanner</b>, <b>Smart Dashboard</b>, and <b>ML Analytics</b>.',
                position: 'bottom'
            },
            {
                target: '.input-section, .form-content, #prediction',
                title: 'Yield Predictor 🌾',
                text: 'Enter your crop details, soil data, and weather conditions to get an AI-powered yield prediction.',
                position: 'right'
            },
            {
                target: '#themeBtn',
                title: 'Dark Mode 🌙',
                text: 'Toggle between light and dark themes for comfortable viewing.',
                position: 'bottom'
            }
        ],
        'plant-scanner.html': [
            {
                target: '.scanner-page-title, h1',
                title: 'Plant Disease Scanner 📸',
                text: 'Upload or capture an image of your plant to detect diseases using AI-powered analysis.',
                position: 'bottom'
            },
            {
                target: '#videoWrapper, .video-wrapper',
                title: 'Camera Feed',
                text: 'Use your device camera to capture a live image of the plant. Position the leaf in the frame.',
                position: 'bottom'
            },
            {
                target: '#uploadBtn, .btn-secondary, [onclick*="upload"]',
                title: 'Upload Image',
                text: 'Or upload a photo from your gallery for analysis.',
                position: 'top'
            }
        ],
        'smart-dashboard.html': [
            {
                target: '.dash-greeting',
                title: 'Smart Dashboard 🧠',
                text: 'Your daily farming command center. See weather, tasks, and crop status at a glance.',
                position: 'bottom'
            },
            {
                target: '.setup-bar',
                title: 'Configure Your Farm',
                text: 'Select your <b>region</b>, <b>crop</b>, and <b>planting date</b> to get personalized guidance.',
                position: 'bottom'
            },
            {
                target: '#weatherCard',
                title: 'Live Weather ⛅',
                text: 'Real-time weather data and 7-day forecast for your region. Requires the backend server.',
                position: 'right'
            },
            {
                target: '#actionsCard',
                title: 'Daily Tasks ✅',
                text: 'Actionable tasks generated from weather, crop growth stage, and recent scan results.',
                position: 'left'
            },
            {
                target: '#calendarCard',
                title: 'Crop Calendar 📅',
                text: 'Visual timeline showing sowing, growth, flowering, and harvest phases.',
                position: 'top'
            }
        ],
        'ml_demo.html': [
            {
                target: '.ml-demo h1, .ml-demo',
                title: 'ML Analytics Lab 🤖',
                text: 'Advanced machine learning dashboard with real-time predictions, soil analysis, and crop intelligence.',
                position: 'bottom'
            },
            {
                target: '.analyzer-controls',
                title: 'Crop Analyzer',
                text: 'Select crop type, farm size, and technology level for customized ML analysis.',
                position: 'top'
            }
        ]
    };

    /* ---------- CSS ---------- */
    const STYLE = document.createElement('style');
    STYLE.textContent = `
    .tour-overlay {
      position: fixed; inset: 0; z-index: 99998;
      background: rgba(0,0,0,0.5);
      transition: opacity 0.3s;
      opacity: 0;
    }
    .tour-overlay.visible { opacity: 1; }

    .tour-highlight {
      position: absolute; z-index: 99999;
      box-shadow: 0 0 0 4000px rgba(0,0,0,0.55);
      border-radius: 8px;
      border: 2px solid #22c55e;
      transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
      pointer-events: none;
    }

    .tour-tooltip {
      position: absolute; z-index: 100000;
      background: #fff;
      color: #1e293b;
      border-radius: 14px;
      padding: 20px 24px;
      max-width: 360px;
      min-width: 260px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.05);
      font-family: 'Inter', -apple-system, sans-serif;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
    }
    .tour-tooltip.visible {
      opacity: 1; transform: translateY(0);
    }

    .tour-tooltip-title {
      font-size: 16px; font-weight: 700;
      margin-bottom: 8px; color: #0f172a;
    }
    .tour-tooltip-text {
      font-size: 14px; line-height: 1.6;
      color: #475569; margin-bottom: 16px;
    }
    .tour-tooltip-text b { color: #22c55e; }

    .tour-footer {
      display: flex; align-items: center;
      justify-content: space-between; gap: 8px;
    }
    .tour-dots {
      display: flex; gap: 6px;
    }
    .tour-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #e2e8f0; transition: all 0.2s;
    }
    .tour-dot.active { background: #22c55e; width: 20px; border-radius: 4px; }

    .tour-btns { display: flex; gap: 8px; }
    .tour-btn {
      padding: 8px 16px; border-radius: 8px;
      font-size: 13px; font-weight: 600;
      cursor: pointer; border: none; transition: all 0.2s;
      font-family: inherit;
    }
    .tour-btn-skip {
      background: #f1f5f9; color: #64748b;
    }
    .tour-btn-skip:hover { background: #e2e8f0; }
    .tour-btn-next {
      background: #22c55e; color: #fff;
    }
    .tour-btn-next:hover { background: #16a34a; transform: translateY(-1px); }
    .tour-btn-prev {
      background: #f1f5f9; color: #475569;
    }
    .tour-btn-prev:hover { background: #e2e8f0; }

    /* Arrow */
    .tour-arrow {
      position: absolute; width: 12px; height: 12px;
      background: #fff; transform: rotate(45deg);
      box-shadow: -2px -2px 4px rgba(0,0,0,0.05);
    }
    .tour-tooltip[data-pos="bottom"] .tour-arrow { top: -6px; left: 24px; }
    .tour-tooltip[data-pos="top"] .tour-arrow { bottom: -6px; left: 24px; }
    .tour-tooltip[data-pos="left"] .tour-arrow { right: -6px; top: 24px; }
    .tour-tooltip[data-pos="right"] .tour-arrow { left: -6px; top: 24px; }

    @media (max-width: 768px) {
      .tour-tooltip { max-width: 300px; min-width: 220px; padding: 16px; }
    }
  `;
    document.head.appendChild(STYLE);

    /* ---------- Tour Engine ---------- */
    class SmartTour {
        constructor() {
            this.steps = [];
            this.current = 0;
            this.overlay = null;
            this.highlight = null;
            this.tooltip = null;
            this.active = false;
        }

        start(pageName) {
            const key = pageName || (location.pathname.split('/').pop() || 'index.html');
            this.steps = (TOURS[key] || []).filter(step => {
                // Only include steps whose target exists on the page
                return document.querySelector(step.target);
            });

            if (this.steps.length === 0) return;

            this.current = 0;
            this.active = true;
            this.createElements();
            this.showStep(0);
        }

        createElements() {
            // Overlay
            this.overlay = document.createElement('div');
            this.overlay.className = 'tour-overlay';
            this.overlay.addEventListener('click', () => this.end());
            document.body.appendChild(this.overlay);
            requestAnimationFrame(() => this.overlay.classList.add('visible'));

            // Highlight box
            this.highlight = document.createElement('div');
            this.highlight.className = 'tour-highlight';
            document.body.appendChild(this.highlight);

            // Tooltip
            this.tooltip = document.createElement('div');
            this.tooltip.className = 'tour-tooltip';
            document.body.appendChild(this.tooltip);
        }

        showStep(idx) {
            if (idx < 0 || idx >= this.steps.length) { this.end(); return; }
            this.current = idx;
            const step = this.steps[idx];
            const el = document.querySelector(step.target);
            if (!el) { this.end(); return; }

            // Scroll target into view
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });

            setTimeout(() => {
                const rect = el.getBoundingClientRect();
                const padding = 8;

                // Position highlight
                this.highlight.style.top = `${rect.top + window.scrollY - padding}px`;
                this.highlight.style.left = `${rect.left + window.scrollX - padding}px`;
                this.highlight.style.width = `${rect.width + padding * 2}px`;
                this.highlight.style.height = `${rect.height + padding * 2}px`;

                // Build tooltip content
                const dotsHTML = this.steps.map((_, i) =>
                    `<div class="tour-dot${i === idx ? ' active' : ''}"></div>`
                ).join('');

                let btns = '';
                if (idx > 0) btns += `<button class="tour-btn tour-btn-prev" onclick="window.__smartTour.prev()">← Back</button>`;
                if (idx < this.steps.length - 1) {
                    btns += `<button class="tour-btn tour-btn-next" onclick="window.__smartTour.next()">Next →</button>`;
                } else {
                    btns += `<button class="tour-btn tour-btn-next" onclick="window.__smartTour.end()">Got it! ✓</button>`;
                }

                this.tooltip.setAttribute('data-pos', step.position || 'bottom');
                this.tooltip.innerHTML = `
          <div class="tour-arrow"></div>
          <div class="tour-tooltip-title">${step.title}</div>
          <div class="tour-tooltip-text">${step.text}</div>
          <div class="tour-footer">
            <div class="tour-dots">${dotsHTML}</div>
            <div class="tour-btns">
              <button class="tour-btn tour-btn-skip" onclick="window.__smartTour.end()">Skip</button>
              ${btns}
            </div>
          </div>
        `;

                // Position tooltip
                this.positionTooltip(rect, step.position || 'bottom');

                // Show
                this.tooltip.classList.remove('visible');
                requestAnimationFrame(() => this.tooltip.classList.add('visible'));
            }, 350);
        }

        positionTooltip(rect, pos) {
            const tt = this.tooltip;
            const gap = 16;

            // Reset
            tt.style.top = tt.style.bottom = tt.style.left = tt.style.right = 'auto';

            switch (pos) {
                case 'bottom':
                    tt.style.top = `${rect.bottom + window.scrollY + gap}px`;
                    tt.style.left = `${Math.max(16, rect.left + window.scrollX)}px`;
                    break;
                case 'top':
                    tt.style.top = `${rect.top + window.scrollY - gap - 180}px`;
                    tt.style.left = `${Math.max(16, rect.left + window.scrollX)}px`;
                    break;
                case 'left':
                    tt.style.top = `${rect.top + window.scrollY}px`;
                    tt.style.left = `${Math.max(16, rect.left + window.scrollX - 380)}px`;
                    break;
                case 'right':
                    tt.style.top = `${rect.top + window.scrollY}px`;
                    tt.style.left = `${rect.right + window.scrollX + gap}px`;
                    break;
            }

            // Keep on screen
            requestAnimationFrame(() => {
                const ttRect = tt.getBoundingClientRect();
                if (ttRect.right > window.innerWidth - 16) {
                    tt.style.left = `${window.innerWidth - ttRect.width - 16}px`;
                }
                if (ttRect.left < 16) tt.style.left = '16px';
            });
        }

        next() { this.showStep(this.current + 1); }
        prev() { this.showStep(this.current - 1); }

        end() {
            this.active = false;
            if (this.overlay) { this.overlay.remove(); this.overlay = null; }
            if (this.highlight) { this.highlight.remove(); this.highlight = null; }
            if (this.tooltip) { this.tooltip.remove(); this.tooltip = null; }

            // Mark as seen
            const page = location.pathname.split('/').pop() || 'index.html';
            const seen = JSON.parse(localStorage.getItem('toursSeen') || '{}');
            seen[page] = true;
            localStorage.setItem('toursSeen', JSON.stringify(seen));
        }
    }

    /* ---------- Init ---------- */
    const tour = new SmartTour();
    window.__smartTour = tour;

    // Public API for help button
    window.startSmartTour = function () {
        tour.start();
    };

    // Auto-start on first visit (after a short delay for page to settle)
    function autoStart() {
        const page = location.pathname.split('/').pop() || 'index.html';
        const seen = JSON.parse(localStorage.getItem('toursSeen') || '{}');
        if (!seen[page]) {
            setTimeout(() => tour.start(), 1500);
        }
    }

    // Wire help button to restart tour
    function wireHelpBtn() {
        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                tour.start();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            wireHelpBtn();
            autoStart();
        });
    } else {
        wireHelpBtn();
        autoStart();
    }
})();
