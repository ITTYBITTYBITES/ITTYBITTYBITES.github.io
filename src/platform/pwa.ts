/**
 * Progressive Web App registration and update handling.
 * Automatically reloads the application when a new build/Service Worker activates,
 * ensuring users never experience stale chunk white-screens.
 */

let pwaRegistered = false;

export async function registerPWA(): Promise<void> {
  if (import.meta.env.DEV) return;
  if (!('serviceWorker' in navigator)) return;
  if (pwaRegistered) return;
  pwaRegistered = true;

  // Listen for controllerchange: when a new SW takes over, auto-reload immediately
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    console.log('ITTYBITTYBITES: New application version activated. Reloading...');
    window.location.reload();
  });

  try {
    const { registerSW } = await import('virtual:pwa-register');
    const updateSW = registerSW({
      immediate: true,
      onOfflineReady() {
        console.log('ITTYBITTYBITES is ready for offline use.');
      },
      onNeedRefresh() {
        console.log('ITTYBITTYBITES: Update available — activating immediately.');
        updateSW(true).catch(() => {
          window.location.reload();
        });
      },
      onRegisteredSW(swUrl, registration) {
        console.log('Service worker registered:', swUrl);
        if (registration) {
          // Check for updates immediately on load
          void registration.update();

          // Periodically check for updates every 15 minutes
          window.setInterval(() => {
            void registration.update();
          }, 15 * 60 * 1000);
        }
      },
      onRegisterError(error) {
        console.error('Service worker registration error:', error);
      },
    });
  } catch {
    // PWA support is best-effort
  }
}
