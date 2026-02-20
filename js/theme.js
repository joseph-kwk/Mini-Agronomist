/**
 * theme.js — Centralized Theme Controller for Mini Agronomist
 * 
 * Single source of truth for light/dark mode toggling.
 * Must be loaded BEFORE any page-specific scripts (use in <head>).
 * 
 * Usage:
 *   <script src="js/theme.js"></script>
 */
(function () {
    'use strict';

    // Apply saved theme immediately to documentElement to prevent flash
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
        document.documentElement.classList.add('dark-theme');
    }

    // Centralized toggle function
    window.toggleTheme = function () {
        const isDark = document.documentElement.classList.contains('dark-theme');
        const next = isDark ? 'light' : 'dark';

        document.documentElement.classList.toggle('dark-theme', next === 'dark');
        if (document.body) {
            document.body.classList.toggle('dark-theme', next === 'dark');
        }

        localStorage.setItem('theme', next);
        syncUI();

        // Dispatch event for other scripts
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
    };

    function updateAllIcons(t) {
        // Redundant now, syncUI handles it better
        syncUI();
    }

    let isSyncing = false;
    function syncUI() {
        if (isSyncing) return;
        isSyncing = true;

        try {
            const t = localStorage.getItem('theme') || 'light';
            const isDark = t === 'dark';

            if (document.body) {
                // Only toggle if necessary to minimize mutation events
                if (document.body.classList.contains('dark-theme') !== isDark) {
                    document.body.classList.toggle('dark-theme', isDark);
                }
            }

            document.querySelectorAll('#themeBtn, [data-theme-toggle]').forEach(btn => {
                const icon = btn.querySelector('.material-icons');
                if (icon) {
                    const expected = isDark ? 'light_mode' : 'dark_mode';
                    if (icon.textContent !== expected) icon.textContent = expected;
                } else if (btn.childNodes.length === 1 && btn.childNodes[0].nodeType === 3) {
                    const expected = isDark ? '☀️' : '🌙';
                    if (btn.textContent !== expected) btn.textContent = expected;
                }
            });
        } finally {
            isSyncing = false;
        }
    }

    // Monitor for dynamically added buttons (like those from shared-nav.js or smart-dashboard modules)
    const observer = new MutationObserver(() => {
        syncUI();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            syncUI();
            observer.observe(document.body, { childList: true, subtree: true });
        });
    } else {
        syncUI();
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    // Cross-tab sync
    window.addEventListener('storage', (e) => {
        if (e.key === 'theme') {
            const t = e.newValue || 'light';
            document.documentElement.classList.toggle('dark-theme', t === 'dark');
            syncUI();
        }
    });
})();
