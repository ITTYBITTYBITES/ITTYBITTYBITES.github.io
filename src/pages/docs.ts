import { marked } from 'marked';
import readme from '../../README.md?raw';
import { h } from '../platform/utils';

export function renderDocs(): HTMLElement {
  const article = h('article', { class: 'prose' }, []);
  article.innerHTML = marked.parse(readme) as string;
  return h('div', { class: 'container' }, [
    h('h1', {}, ['Documentation']),
    article,
  ]);
}
