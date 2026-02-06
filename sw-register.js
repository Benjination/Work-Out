// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
                
                // Register for background sync if supported
                if ('sync' in window.ServiceWorkerRegistration.prototype) {
                    registration.sync.register('workout-reminder');
                }
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}