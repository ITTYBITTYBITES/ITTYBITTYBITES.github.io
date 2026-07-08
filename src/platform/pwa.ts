/**
 * Progressive Web App registration and update handling.
 */

export async function registerPWA(): Promise<void> {
  if (import.meta.env.DEV) return;
  if (!('serviceWorker' in navigator)) return;

  try {
    const { registerSW } = await import('virtual:pwa-register');
    const updateSW = registerSW({
      immediate: true,
      onOfflineReady() {
        // Future UI: surface offline-ready notice.
        // eslint-disable-next-line no-console
        console.log('ITTYBITTYBITES is ready for offline use.');
      },
      onNeedRefresh() {
        // Automatically and silently update and hot-reload the page
        // to prevent old hashed assets from causing white screens.
        void updateSW(true);
      },
      onRegisteredSW(swUrl, registration) {
        // eslint-disable-next-line no-console
        console.log('Service worker registered:', swUrl);
        if (registration) {
          // Periodically check for updates while the app is open.
          window.setInterval(() => {
            void registration.update();
          }, 60 * 60 * 1000);
        }
      },
      onRegisterError(error) {
        // eslint-disable-next-line no-console
        console.error('Service worker registration failed:', error);
      },
    });
  } catch {
    // PWA support is best-effort; failures must not break the app.
  }
}
