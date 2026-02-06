// Service Worker for PWA functionality
const CACHE_NAME = 'workout-app-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.log('Cache install failed:', error);
                // Continue without caching
                return Promise.resolve();
            })
    );
    
    // Activate immediately
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Take control immediately
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // Clone the request because it's a stream
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then(response => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response because it's a stream
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
            .catch(() => {
                // Network failed, try to serve offline page if available
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});

// Background sync for notifications (when supported)
self.addEventListener('sync', event => {
    if (event.tag === 'workout-reminder') {
        event.waitUntil(checkWorkoutStatus());
    }
});

// Check workout status and send notification if needed
function checkWorkoutStatus() {
    // This would check if the workout is completed today
    // and send a notification if it's time and not completed
    return new Promise(resolve => {
        const now = new Date();
        const hour = now.getHours();
        
        // Check if it's notification time (8 AM or 6 PM)
        if ((hour === 8 || hour === 18) && now.getMinutes() < 5) {
            // Check localStorage for workout completion
            // This is simplified - in a real app you might sync with a server
            self.registration.showNotification('Workout Reminder', {
                body: 'Time for your workout! Don\'t forget to complete Ben\'s Workout today.',
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                tag: 'workout-reminder',
                requireInteraction: false,
                actions: [
                    {
                        action: 'start-workout',
                        title: 'Start Workout'
                    },
                    {
                        action: 'dismiss',
                        title: 'Later'
                    }
                ]
            });
        }
        
        resolve();
    });
}

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'start-workout') {
        // Open the app and navigate to workout
        event.waitUntil(
            clients.openWindow('/?workout=bens')
        );
    } else if (event.action === 'dismiss') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Handle push messages (for future server-sent notifications)
self.addEventListener('push', event => {
    if (!event.data) {
        return;
    }
    
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: data.tag || 'workout-notification',
        data: data.data || {}
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});