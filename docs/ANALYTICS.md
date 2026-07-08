# Google Analytics 4 (GA4) & Privacy Configuration

This document explains where and how Google Analytics 4 is configured for the ITTYBITTYBITES platform, and how user privacy is safeguarded.

## Configuration Location

1. **Central Config Parameters**:
   - Files: `src/platform/config.ts`
   - Purpose: Defines the GA4 Measurement ID (`gaId: 'G-A4541307705'`) and determines whether analytics should be disabled globally or locally (`disableAnalytics`).
   - Standard ID format mapping: Standard GA4 measurement IDs have a `'G-'` prefix. The requested ID `GA4541307705` is configured as `'G-A4541307705'` for full compatibility with Google's Gtag servers, and is normalized gracefully at runtime.

2. **Initialization and Service Bridge**:
   - Files: `src/platform/analytics.ts`
   - Purpose: Performs non-blocking script loading of Google Analytics `gtag.js` and provides standard routing/pageview tracking (`pageView`), custom event tracking (`track`), and custom dimensions (`experience_id`, `category`).

3. **Entry Point Integration**:
   - Files: `src/main.ts`
   - Purpose: Imports and executes `initAnalytics()` at boot-time for the public-facing application shell.

---

## Privacy & Safety Safeguards

In accordance with our core commitment to trust, user respect, and governance specifications, several safeguards are implemented to protect user privacy and avoid tracking sensitive or developer areas:

1. **Respecting User Tracking Preferences**:
   - The platform respects browser-level `doNotTrack` / Do-Not-Track (DNT) headers. If `navigator.doNotTrack` is set to `"1"` or `"yes"`, all analytics are immediately halted and script loading is prevented.

2. **Local and Test Environment Safeguards**:
   - Analytics are disabled by default outside the production bundle (`!import.meta.env.PROD`).
   - An extra loopback check is implemented: if the hostname is `localhost`, `127.0.0.1`, `[::1]`, a private IP address (`192.168.x.x`, `10.x.x.x`), or runs via local files (`file:` protocol), analytics initialization is prevented entirely.

3. **Restricting Developer and Administrator Areas**:
   - To safeguard administrator or developer-only views and diagnostics, any pageview or event tracking occurring in paths containing `/admin`, `/developer`, `/dev`, `/test`, `/debug`, or `/diagnostics` is immediately aborted and ignored by the analytics service.

4. **Zero Personal Information Collection**:
   - Google Analytics 4 is strictly configured to protect user identity. The following global parameter flags are explicitly turned off:
     - `allow_google_signals: false` (Disables Google demographic data/remarketing signals).
     - `allow_ad_personalization_signals: false` (Disables any cross-site ad targeting/personalization).
     - `restricted_data_processing: true` (Restricts Google to act solely as a service processor to meet GDPR/CCPA standard requirements).

---

## Verification

To verify that the analytics module passes all static analysis and compilation gates:
```bash
npm run build
npm test
```
The automated test suites will confirm that build outputs and schemas remain stable and unbroken.
