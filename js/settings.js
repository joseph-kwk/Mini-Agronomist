/**
 * settings.js — Centralized Settings Controller for Mini Agronomist
 * 
 * Manages the settings modal, language switching, unit systems, and data export.
 */
(function () {
    'use strict';

    class SettingsManager {
        constructor() {
            this.settings = {
                language: localStorage.getItem('mini-agronomist-lang') || 'en',
                units: localStorage.getItem('mini-agronomist-units') || 'metric',
                analytics: localStorage.getItem('mini-agronomist-analytics') !== 'false',
                notifications: localStorage.getItem('mini-agronomist-notifications') !== 'false'
            };

            this.init();
        }

        init() {
            // Listen for settings button clicks
            document.addEventListener('click', (e) => {
                const btn = e.target.closest('#settingsBtn');
                if (btn) {
                    this.showModal();
                }
            });

            // Re-sync i18n if language changed
            window.addEventListener('languageChanged', (e) => {
                this.settings.language = e.detail.language;
            });
        }

        showModal() {
            let modal = document.getElementById('settingsModal');
            if (!modal) {
                modal = this.createModal();
                document.body.appendChild(modal);
            }

            this.updateFormValues();
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevent scroll
        }

        hideModal() {
            const modal = document.getElementById('settingsModal');
            if (modal) {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        }

        createModal() {
            const modal = document.createElement('div');
            modal.id = 'settingsModal';
            modal.className = 'modal hidden';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');

            modal.innerHTML = `
                <div class="modal-content settings-modal-content">
                    <div class="modal-header">
                        <div class="header-title-group">
                            <span class="material-icons">settings</span>
                            <h2 data-i18n="settings.title">App Settings</h2>
                        </div>
                        <button class="modal-close" id="closeSettings" aria-label="Close">
                            <span class="material-icons">close</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <!-- Language -->
                        <div class="settings-section">
                            <div class="section-header">
                                <span class="material-icons">language</span>
                                <h3 data-i18n="settings.language">Language</h3>
                            </div>
                            <div class="select-wrapper">
                                <select id="setLanguage">
                                    <option value="en">🇺🇸 English</option>
                                    <option value="fr">🇫🇷 Français</option>
                                    <option value="es">🇪🇸 Español</option>
                                </select>
                            </div>
                        </div>

                        <!-- Unit System -->
                        <div class="settings-section">
                            <div class="section-header">
                                <span class="material-icons">straighten</span>
                                <h3 data-i18n="settings.units">Unit System</h3>
                            </div>
                            <div class="radio-group">
                                <label class="radio-label">
                                    <input type="radio" name="units" value="metric">
                                    <span class="custom-radio"></span>
                                    <span data-i18n="units.metric">Metric (kg, °C, mm)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" name="units" value="imperial">
                                    <span class="custom-radio"></span>
                                    <span data-i18n="units.imperial">Imperial (lb, °F, in)</span>
                                </label>
                            </div>
                        </div>

                        <!-- Preferences -->
                        <div class="settings-section">
                            <div class="section-header">
                                <span class="material-icons">tune</span>
                                <h3 data-i18n="settings.preferences">Preferences</h3>
                            </div>
                            <div class="toggle-group">
                                <label class="toggle-label">
                                    <span data-i18n="settings.analytics">Enable advanced analytics</span>
                                    <input type="checkbox" id="setAnalytics">
                                    <span class="toggle-slider"></span>
                                </label>
                                <label class="toggle-label">
                                    <span data-i18n="settings.notifications">Prediction notifications</span>
                                    <input type="checkbox" id="setNotifications">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <!-- Data Management -->
                        <div class="settings-section border-top">
                            <div class="section-header">
                                <span class="material-icons">storage</span>
                                <h3 data-i18n="settings.data">Data Management</h3>
                            </div>
                            <div class="button-group-vertical">
                                <button id="exportData" class="btn-outline">
                                    <span class="material-icons">download</span>
                                    <span data-i18n="settings.export">Export My Data</span>
                                </button>
                                <button id="clearData" class="btn-danger-outline">
                                    <span class="material-icons">delete_sweep</span>
                                    <span data-i18n="settings.clear">Reset All Settings</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Wire up events
            modal.querySelector('#closeSettings').onclick = () => this.hideModal();
            modal.onclick = (e) => { if (e.target === modal) this.hideModal(); };

            modal.querySelector('#setLanguage').onchange = (e) => {
                if (window.i18n) window.i18n.setLanguage(e.target.value);
            };

            const unitRadios = modal.querySelectorAll('input[name="units"]');
            unitRadios.forEach(r => {
                r.onchange = (e) => {
                    this.settings.units = e.target.value;
                    localStorage.setItem('mini-agronomist-units', e.target.value);
                    window.dispatchEvent(new CustomEvent('unitsChanged', { detail: { units: e.target.value } }));
                };
            });

            modal.querySelector('#setAnalytics').onchange = (e) => {
                this.settings.analytics = e.target.checked;
                localStorage.setItem('mini-agronomist-analytics', e.target.checked);
            };

            modal.querySelector('#setNotifications').onchange = (e) => {
                this.settings.notifications = e.target.checked;
                localStorage.setItem('mini-agronomist-notifications', e.target.checked);
            };

            modal.querySelector('#clearData').onclick = () => {
                if (confirm('Are you sure you want to reset all settings and clear local storage?')) {
                    localStorage.clear();
                    location.reload();
                }
            };

            modal.querySelector('#exportData').onclick = () => {
                const data = { ...localStorage };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `mini-agronomist-settings-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
            };

            return modal;
        }

        updateFormValues() {
            const modal = document.getElementById('settingsModal');
            if (!modal) return;

            modal.querySelector('#setLanguage').value = localStorage.getItem('mini-agronomist-lang') || 'en';

            const units = localStorage.getItem('mini-agronomist-units') || 'metric';
            const radio = modal.querySelector(`input[name="units"][value="${units}"]`);
            if (radio) radio.checked = true;

            modal.querySelector('#setAnalytics').checked = localStorage.getItem('mini-agronomist-analytics') !== 'false';
            modal.querySelector('#setNotifications').checked = localStorage.getItem('mini-agronomist-notifications') !== 'false';
        }
    }

    // Initialize global instance
    window.settingsManager = new SettingsManager();

})();
