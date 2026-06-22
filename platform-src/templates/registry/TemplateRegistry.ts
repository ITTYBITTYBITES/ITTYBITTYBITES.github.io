import { PlatformState } from '../../core/kernel/state/PlatformState';

export type TemplateModule = {
  id: string;
  onStateChange: (state: PlatformState) => void;
  element?: HTMLElement | null;
};

export class TemplateRegistry {
  private templates: Map<string, TemplateModule> = new Map();
  private root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  register(template: TemplateModule): void {
    this.templates.set(template.id, template);
  }

  mount(templateId: string): void {
    const template = this.templates.get(templateId);
    if (!template) {
      console.warn(`[TemplateRegistry] Template not found: ${templateId}`);
      return;
    }

    // Create visual container
    const container = document.createElement('div');
    container.className = 'template';
    container.style.cssText = `
      border: 1px solid #555; 
      padding: 16px; 
      margin: 10px 0; 
      border-radius: 8px;
      background: #1a1a1a;
      min-height: 120px;
    `;
    container.innerHTML = `<h3 style="margin:0 0 8px; color:#888;">${templateId}</h3>`;
    
    const content = document.createElement('div');
    content.style.cssText = 'font-size: 1.6rem; transition: all 0.3s ease;';
    container.appendChild(content);

    this.root.appendChild(container);

    // Attach the DOM element to the template instance
    template.element = content;

  }

  notifyAll(state: PlatformState): void {
    this.templates.forEach((template) => {
      try {
        template.onStateChange(state);
      } catch (err) {
        console.error(`[TemplateRegistry] Error in template ${template.id}:`, err);
      }
    });
  }
}
