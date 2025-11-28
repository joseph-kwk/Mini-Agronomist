/**
 * Mini Agronomist - Internationalization Manager
 * Handles language switching and text updates
 */

class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem('mini-agronomist-lang') || 'en';
    this.translations = translations; // From i18n-data.js
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
      this.init();
    });
  }
  
  init() {
    this.createLanguageSelector();
    this.applyLanguage(this.currentLang);
    
    // Listen for dynamic content updates if needed
    // document.addEventListener('contentUpdated', () => this.updatePage());
  }
  
  createLanguageSelector() {
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;
    
    const langContainer = document.createElement('div');
    langContainer.className = 'lang-selector-container';
    
    const select = document.createElement('select');
    select.id = 'languageSelect';
    select.className = 'lang-select';
    select.ariaLabel = 'Select Language';
    
    const languages = [
      { code: 'en', label: '🇺🇸 English' },
      { code: 'fr', label: '🇫🇷 Français' },
      { code: 'es', label: '🇪🇸 Español' }
    ];
    
    languages.forEach(lang => {
      const option = document.createElement('option');
      option.value = lang.code;
      option.textContent = lang.label;
      if (lang.code === this.currentLang) option.selected = true;
      select.appendChild(option);
    });
    
    select.addEventListener('change', (e) => {
      this.setLanguage(e.target.value);
    });
    
    langContainer.appendChild(select);
    
    // Insert before the buttons
    const buttons = document.querySelector('.header-buttons');
    if (buttons) {
      headerActions.insertBefore(langContainer, buttons);
    } else {
      headerActions.appendChild(langContainer);
    }
  }
  
  setLanguage(langCode) {
    this.currentLang = langCode;
    localStorage.setItem('mini-agronomist-lang', langCode);
    this.applyLanguage(langCode);
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: langCode } }));
  }
  
  applyLanguage(langCode) {
    document.documentElement.lang = langCode;
    const t = this.translations[langCode];
    
    if (!t) return;
    
    // Update all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) {
        // Handle inputs with placeholders
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = t[key];
        } else {
          el.textContent = t[key];
        }
      }
    });
    
    // Update elements with data-i18n-placeholder
    const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key]) {
        el.placeholder = t[key];
      }
    });
    
    // Update elements with data-i18n-title
    const titles = document.querySelectorAll('[data-i18n-title]');
    titles.forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (t[key]) {
        el.title = t[key];
      }
    });
    
    console.log(`🌐 Language switched to ${langCode}`);
  }
  
  // Helper to get translation in JS
  t(key) {
    return this.translations[this.currentLang][key] || key;
  }
}

// Initialize global instance
window.i18n = new I18nManager();
