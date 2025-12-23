/**
 * Mini Agronomist - Site Configuration
 * 
 * Centralized configuration for site-wide content.
 * Update this file to change social media links, contact info, and other site details.
 * 
 * @version 1.0.0
 * @updated 2025-12-23
 */

const SITE_CONFIG = {
  // Site Information
  siteName: "Mini Agronomist",
  tagline: "AI-powered agricultural intelligence for farmers worldwide",
  description: "Get accurate crop yield predictions for 25+ crops across 14+ global regions. Free AI-powered farming tool with offline capability.",
  version: "4.2",
  
  // Copyright & Legal
  copyright: {
    year: 2025,
    owner: "Mini Agronomist",
    text: "Made with 🌱 for farmers worldwide"
  },
  
  // Social Media Links
  social: {
    twitter: "https://twitter.com/joseph_kwk",
    github: "https://github.com/joseph-kwk",
    linkedin: "https://linkedin.com/in/joseph-kwk",
    githubRepo: "https://github.com/joseph-kwk/Mini-Agronomist"
  },
  
  // Contact Information
  contact: {
    email: "contact@miniagronomist.com",
    website: "www.miniagronomist.com",
    supportEmail: "support@miniagronomist.com"
  },
  
  // URLs & Links
  urls: {
    homepage: "/index.html",
    scanner: "/plant-scanner.html",
    mlDemo: "/ml_demo.html",
    tutorial: "/pages/onboarding.html",
    faq: "/pages/faq.html",
    privacy: "/pages/privacy-policy.html",
    terms: "/pages/terms-of-service.html"
  },
  
  // Features (for dynamic feature lists)
  features: [
    {
      icon: "🌾",
      name: "Yield Prediction",
      description: "AI-powered crop yield forecasting",
      link: "#prediction"
    },
    {
      icon: "📸",
      name: "Plant Scanner",
      description: "Instant disease detection using camera",
      link: "/plant-scanner.html"
    },
    {
      icon: "🤖",
      name: "ML Analytics",
      description: "Advanced machine learning insights",
      link: "/ml_demo.html"
    }
  ],
  
  // Supported Languages (for i18n)
  languages: [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" }
  ],
  
  // Theme Settings
  theme: {
    defaultTheme: "light", // "light" or "dark"
    allowUserToggle: true
  },
  
  // API & Backend Configuration
  api: {
    pythonBackend: "http://localhost:8001",
    timeout: 10000, // milliseconds
    retries: 3
  },
  
  // Analytics (if you add analytics later)
  analytics: {
    enabled: false,
    googleAnalyticsId: "", // Add your GA4 ID here
    trackingConsent: true // Require user consent
  },
  
  // App Metadata (for PWA manifest)
  pwa: {
    name: "Mini Agronomist",
    shortName: "Mini Agro",
    themeColor: "#2E7D32",
    backgroundColor: "#FFFFFF"
  }
};

// Export for use in HTML pages
if (typeof window !== 'undefined') {
  window.SITE_CONFIG = SITE_CONFIG;
}

// Helper function to populate social links
function populateSocialLinks() {
  const config = window.SITE_CONFIG;
  
  // Twitter/X links
  document.querySelectorAll('a[data-social="twitter"]').forEach(link => {
    link.href = config.social.twitter;
  });
  
  // GitHub links
  document.querySelectorAll('a[data-social="github"]').forEach(link => {
    link.href = config.social.github;
  });
  
  // LinkedIn links
  document.querySelectorAll('a[data-social="linkedin"]').forEach(link => {
    link.href = config.social.linkedin;
  });
  
  // GitHub Repo links
  document.querySelectorAll('a[data-social="github-repo"]').forEach(link => {
    link.href = config.social.githubRepo;
  });
  
  // Copyright text
  document.querySelectorAll('[data-copyright]').forEach(elem => {
    elem.textContent = `© ${config.copyright.year} ${config.copyright.owner}. ${config.copyright.text}`;
  });
  
  // Website links
  document.querySelectorAll('[data-website]').forEach(elem => {
    elem.textContent = config.contact.website;
    if (elem.tagName === 'A') {
      elem.href = `https://${config.contact.website}`;
    }
  });
}

// Auto-populate on page load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', populateSocialLinks);
  } else {
    populateSocialLinks();
  }
}

// Console info
console.log(`🌾 ${SITE_CONFIG.siteName} v${SITE_CONFIG.version} - Configuration Loaded`);
