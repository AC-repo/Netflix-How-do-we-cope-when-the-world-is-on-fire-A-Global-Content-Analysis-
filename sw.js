const CACHE_NAME = 'netflix-analysis-v1';
const BASE_PATH = '/Netflix-How-do-we-cope-when-the-world-is-on-fire-A-Global-Content-Analysis-/';

const ASSETS_TO_CACHE = [
    BASE_PATH,
    `${BASE_PATH}index.html`,
    `${BASE_PATH}css/style.css`,
    `${BASE_PATH}js/main.js`,
    `${BASE_PATH}js/visualizations.js`,
    `${BASE_PATH}images/icon.svg`,
    `${BASE_PATH}images/icon-192.png`,
    `${BASE_PATH}images/icon-512.png`,
    `${BASE_PATH}manifest.json`,
    `${BASE_PATH}data/netflix_titles.json`,
    'https://cdn.plot.ly/plotly-2.27.0.min.js'
];

// Install event - cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin) && 
        !event.request.url.startsWith('https://cdn.plot.ly/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }

                return fetch(event.request).then(response => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
});

// Handle API Requests
self.addEventListener('fetch', event => {
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    return response;
                })
                .catch(() => {
                    // Return cached data if available, otherwise show offline message
                    return caches.match(event.request)
                        .then(response => {
                            if (response) {
                                return response;
                            }
                            return new Response(
                                JSON.stringify({
                                    error: 'You are offline and no cached data is available.'
                                }),
                                {
                                    headers: { 'Content-Type': 'application/json' }
                                }
                            );
                        });
                })
        );
    }
}); 