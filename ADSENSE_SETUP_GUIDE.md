# AdSense Implementation — Ready to Push

**All code changes are already made in this repo clone (`/home/user/repo`).** You just need to push them to GitHub and replace the placeholder Publisher ID.

---

## What was done (matches audit placement strategy)

### 1. Compliance (required for AdSense approval)
- **`public/ads.txt`** — placeholder `pub-XXXXXXXXXXXXXXXX`. Google requires this file at domain root. Replace after approval.
- **`src/pages/privacy.ts` → `/privacy`** — full website Privacy Policy with cookie consent controls + links to Google policies + GDPR/CCPA language
- **`src/pages/terms.ts` → `/terms`** and **`src/pages/contact.ts` → `/contact`** — required legal pages
- **`src/components/app-footer.ts`** — now links to Privacy / Terms / Contact on every page
- **`scripts/generate-sitemap.mjs`** — adds `/privacy`, `/terms`, `/contact` to sitemap
- **`src/components/consent-banner.ts`** — GDPR-style banner at bottom: Accept / Reject, stores `ittybittybites-ads-consent` in localStorage, respects choice before loading ads

### 2. Ad System (SPA-safe)
- **`src/platform/ads.ts`** — central config:
  ```ts
  export const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX'
  export const ADSENSE_ENABLED = false // flip to true when ready
  export const AD_SLOTS = { homeTop: 'YYYY...01', ... }
  ```
  + `getConsent() / setConsent()` + `refreshAds()` that handles SPA navigation
- **`src/components/ad-slot.ts`** — factory `createAdSlot()` that:
  - Reserves space (`min-height`) to avoid CLS
  - Labels “Advertisement”
  - Shows placeholder if consent = rejected / not chosen (with link to /privacy)
  - Auto-replaces placeholder when user clicks Accept
  - Variants: `banner` (auto), `in-feed` (fluid), `in-article` (fluid), `multiplex` (autorelaxed)
- **`src/style.css`** — appended `.ad-container` styles (dashed border while testing, reserves height)
- **`index.html`** — AdSense script placeholder (commented out until you enable):
  ```html
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX">
  ```
- **`src/platform/router.ts`** — after every SPA navigation, calls `refreshAds()` so new slots fill

### 3. Placements (exactly as audited)
- **Home (`src/pages/home.ts`)**: `adHomeTop()` after hero, `adHomeInFeed()` after Continue Playing
- **Experiences listing (`src/pages/experience-index.ts`)**: `adExperiencesTop()` under filters, in-feed after 6th card (spans full grid), `adExperiencesMultiplex()` at bottom
- **Experience page (`src/pages/experience.ts`)**: `adExperienceAbove()` between header and `<experience-host>`, `adExperienceBelow()` after host and before footer. **Never inside canvas** — policy safe.

### 4. Build verified
- `npm ci && npx tsc --noEmit` → 0 errors
- `vite build` → 86 modules, built in 1.6s, no errors

---

## How to deploy

### Option A: Push from this sandbox (if you give this clone a token)
```bash
cd /home/user/repo
git add -A
git commit -m "feat(ads): AdSense integration with consent + compliant placements

- Add ads.txt placeholder
- Add /privacy, /terms, /contact routes and footer links
- Add consent-banner and ads platform (SPA-aware, CLS-safe)
- Add 5 recommended placements: home top/in-feed, experiences top/in-feed/multiplex, experience above/below
- Update sitemap, router refresh, index.html placeholder"
git push origin main
# GitHub Actions will deploy to Pages automatically
```

You will need a GitHub PAT. If you don't want to paste it here, use Option B.

### Option B: Apply patch locally
1. In this chat, download the patch file: `adsense.patch` (generated below)
2. On your machine:
```bash
git clone https://github.com/ITTYBITTYBITES/ITTYBITTYBITES.github.io.git
cd ITTYBITTYBITES.github.io
git apply adsense.patch
git add -A && git commit -m "feat(ads): AdSense integration" && git push
```

Or just copy the 7 new files + 9 modified files listed in `git status` above.

---

## After pushing — to go live with real ads

1. Apply for AdSense (or if already approved):
   - Go to **AdSense > Account > Settings > Account information** → copy your `pub-XXXXXXXXXX`
   - Search-replace `ca-pub-XXXXXXXXXXXXXXXX` → your real ID in:
     - `src/platform/ads.ts` (ADSENSE_CLIENT)
     - `index.html` (uncomment the script + meta tag)
   - Set `ADSENSE_ENABLED = true` in `src/platform/ads.ts`

2. Create ad units in AdSense:
   - **By ad unit > Display > Responsive** → create slots for each placement, copy Slot IDs (`data-ad-slot`) into `AD_SLOTS` in `ads.ts`
   - Or just use **Auto Ads** — set Ad load to Low first week, and in Auto Ads > Exclude pages add `/experience/*` for Anchor/Vignette

3. Update `public/ads.txt`:
   ```
   google.com, pub-YOUR_ID, DIRECT, f08c47fec0942fa0
   ```

4. Re-push, wait ~48h for ads.txt crawl, then request review. Once approved, ads will appear **only after user clicks Accept** on the banner (GDPR compliant). The placeholder disappears automatically.

5. Recommended first-week settings:
   - Keep 2–3 ads per page (code already does)
   - Monitor CLS in Search Console > Core Web Vitals — if >0.1, increase `min-height` in style.css
   - In AdSense > Reports, filter by Page path to see which placement earns most (/experiences usually wins)

---

## Testing before approval (no AdSense account needed)

- Run locally: `npm ci && npm run dev` → open `http://localhost:5173`
- You should see **grey dashed “Advertisement” boxes** with placeholder text “Ad will appear here after you accept cookies.”
- Click **Accept** in banner → placeholders attempt to load (will show empty because ID is fake — that's expected). Check console: no errors except AdSense 400 (due to fake ID), which disappears once real ID is set.
- Navigate between Home → Experiences → Experience → Privacy — banner should not reappear, ads should refresh.

---

## Files changed summary

New: `public/ads.txt`, `src/platform/ads.ts`, `src/components/ad-slot.ts`, `src/components/consent-banner.ts`, `src/pages/privacy.ts`, `src/pages/terms.ts`, `src/pages/contact.ts`
Modified: `index.html`, `src/main.ts`, `src/style.css`, `src/platform/router.ts`, `src/pages/home.ts`, `src/pages/experience-index.ts`, `src/pages/experience.ts`, `src/components/app-footer.ts`, `scripts/generate-sitemap.mjs`, `public/sitemap.xml`

---

Need me to set the real Publisher ID for you now? Paste your `ca-pub-...` and I'll do the search-replace + uncomment and rebuild before you push.
