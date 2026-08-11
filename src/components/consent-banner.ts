import { getConsent, setConsent } from '../platform/ads';

export class ConsentBanner extends HTMLElement {
  connectedCallback(): void {
    // Only show if no choice yet and ads are configured
    const existing = getConsent();
    if (existing !== null) return;

    this.render();
  }

  private render(): void {
    this.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;display:block;';
    this.innerHTML = `
      <div style="max-width:980px;margin:0 auto;padding:12px 16px;">
        <div style="background:#1f2732;color:#fff;border-radius:16px;padding:16px 18px;display:flex;gap:16px;align-items:center;flex-wrap:wrap;box-shadow:0 20px 50px rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.1);">
          <div style="flex:1;min-width:220px;">
            <div style="font-weight:700;font-size:.95rem;margin-bottom:4px;">We use cookies for ads & analytics</div>
            <div style="font-size:.85rem;opacity:.85;line-height:1.5">ITTYBITTYBITES shows ads via Google AdSense. We need your consent to show personalized ads. You can change this anytime in Privacy. <a href="/privacy" style="color:#ffcf8a;text-decoration:underline;">Learn more</a></div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button data-action="reject" style="background:transparent;color:#fff;border:1px solid rgba(255,255,255,.3);padding:.6rem 1rem;border-radius:999px;cursor:pointer;font-weight:600;">Reject</button>
            <button data-action="accept" style="background:#d48a3a;color:#fff;border:1px solid #d48a3a;padding:.6rem 1rem;border-radius:999px;cursor:pointer;font-weight:700;">Accept</button>
          </div>
        </div>
      </div>
    `;

    this.querySelector('[data-action="accept"]')?.addEventListener('click', () => {
      setConsent('accepted');
      this.remove();
    });
    this.querySelector('[data-action="reject"]')?.addEventListener('click', () => {
      setConsent('rejected');
      this.remove();
    });
  }
}
