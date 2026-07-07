/**
 * Skip navigation link for keyboard users.
 */

export class SkipLink extends HTMLElement {
  connectedCallback(): void {
    if (this.shadowRoot) return;

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host { display: block; }
        a {
          position: absolute;
          top: -100%;
          left: 0;
          z-index: 1000;
          padding: 0.75rem 1rem;
          background: canvastext;
          color: canvas;
          text-decoration: none;
          font-weight: 600;
        }
        a:focus {
          top: 0;
        }
      </style>
      <a href="#main">Skip to main content</a>
    `;
  }
}
