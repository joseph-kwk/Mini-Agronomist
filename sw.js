// Service Worker for Mini Agronomist Pro PWA
// Provides offline functionality and caching

const CACHE_NAME = 'mini-agronomist-pro-v2.6';
const STATIC_CACHE_NAME = 'mini-agronomist-static-v2.6';
const DATA_CACHE_NAME = 'mini-agronomist-data-v2.6';

// Resources to cache for offline use
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/ml_demo.html',
  '/game.html',
  '/style.css',
  '/game.css',
  '/app.js',
  '/js/advanced_prediction_engine.js',
  '/js/statistical_models.js',
  '/js/pro-features.js',
  '/js/field-manager.js',
  '/js/advanced-analytics.js',
  '/js/notification-manager.js',
  '/js/voice-interface.js',
  '/js/auth-manager.js',
  '/js/python-integration.js',
  '/js/python-backend-client.js',
  '/js/game/enhanced-game-engine.js',
  '/manifest.json',
  '/assets/icons/logo.png',
  '/assets/icons/favicon.png'
];

// Data files that should be cached
const DATA_RESOURCES = [
  '/data/crop_profiles.json',
  '/data/regions.json',
  '/data/crop_rules.json'
];

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      }),
      
      // Cache data resources
      caches.open(DATA_CACHE_NAME).then(cache => {
        console.log('Caching data resources');
        return cache.addAll(DATA_RESOURCES);
      })
    ]).then(() => {
      console.log('Service Worker installed successfully');
      // Force activation of new service worker
      return self.skipWaiting();
    }).catch(error => {
      console.error('Service Worker installation failed:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches
          if (cacheName !== STATIC_CACHE_NAME && 
              cacheName !== DATA_CACHE_NAME &&
              cacheName.startsWith('mini-agronomist-')) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (request.method !== 'GET') return;
  
  // Handle data requests (JSON files)
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(handleDataRequest(request));
    return;
  }
  
  // Handle static resource requests
  if (STATIC_RESOURCES.some(resource => url.pathname === resource || url.pathname === '/')) {
    event.respondWith(handleStaticRequest(request));
    return;
  }
  
  // Handle external font/icon requests
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(handleFontRequest(request));
    return;
  }
  
  // For all other requests, try network first, then cache
  event.respondWith(handleOtherRequests(request));
});

// Handle data requests with cache-first strategy
async function handleDataRequest(request) {
  try {
    const cache = await caches.open(DATA_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Serving data from cache:', request.url);
      
      // Try to update cache in background
      fetch(request).then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      }).catch(() => {
        // Ignore network errors when updating cache
      });
      
      return cachedResponse;
    }
    
    // If not in cache, try network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
    
  } catch (error) {
    console.error('Data request failed:', error);
    // Return offline fallback
    return new Response(
      JSON.stringify({ error: "Data unavailable offline" }), 
      { 
        status: 503, 
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static resource requests with cache-first strategy
async function handleStaticRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Serving static resource from cache:', request.url);
      return cachedResponse;
    }
    
    // If not in cache, try network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
    
  } catch (error) {
    console.error('Static request failed:', error);
    
    // Return offline fallback page
    if (request.url.includes('.html') || request.headers.get('Accept')?.includes('text/html')) {
      return caches.match('/index.html');
    }
    
    return new Response(
      'Offline - Resource unavailable', 
      { status: 503, headers: { 'Content-Type': 'text/plain' }}
    );
  }
}

// Handle font requests with long-term caching
async function handleFontRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
    
  } catch (error) {
    console.log('Font request failed, using system fonts');
    return new Response('', { status: 404 });
  }
}

// Handle other requests with network-first strategy
async function handleOtherRequests(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    // Try to serve from cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Serving from cache (offline):', request.url);
      return cachedResponse;
    }
    
    return new Response(
      'Offline - Resource unavailable', 
      { status: 503, headers: { 'Content-Type': 'text/plain' }}
    );
  }
}

// Handle background sync for offline predictions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync-predictions') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    console.log('Background sync triggered');
    // Here you could sync any offline predictions to a server
    // or update cached data
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Handle push notifications (for future features)
self.addEventListener('push', event => {
  if (Notification.permission === 'granted') {
    const options = {
      body: event.data ? event.data.text() : 'New agricultural update available',
      icon: '/assets/icons/logo.png',
      badge: '/assets/icons/favicon.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'View Update',
          icon: '/assets/icons/logo.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/assets/icons/logo.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification('Mini Agronomist', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync (when supported)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-agricultural-data') {
    event.waitUntil(updateAgriculturalData());
  }
});

async function updateAgriculturalData() {
  try {
    console.log('Updating agricultural data in background');
    
    // Update data caches
    const cache = await caches.open(DATA_CACHE_NAME);
    
    const updatePromises = DATA_RESOURCES.map(async resource => {
      try {
        const response = await fetch(resource);
        if (response.ok) {
          await cache.put(resource, response);
          console.log('Updated cache for:', resource);
        }
      } catch (error) {
        console.log('Failed to update:', resource, error);
      }
    });
    
    await Promise.all(updatePromises);
    
  } catch (error) {
    console.error('Background data update failed:', error);
  }
}

// Error handling
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Service Worker script loaded');
