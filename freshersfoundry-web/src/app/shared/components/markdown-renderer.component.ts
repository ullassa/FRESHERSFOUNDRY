import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-markdown-renderer',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="markdown-body" [innerHTML]="renderedHtml()"></div>',
  styles: [`
    :host {
      display: block;
    }

    .markdown-body {
      color: var(--ff-text);
      line-height: 1.75;
    }

    .markdown-body :is(h1, h2, h3, h4, h5, h6) {
      margin: 1.5rem 0 0.75rem;
      color: var(--ff-text);
      line-height: 1.25;
    }

    .markdown-body p,
    .markdown-body ul,
    .markdown-body ol,
    .markdown-body blockquote,
    .markdown-body pre,
    .markdown-body table {
      margin: 0 0 1rem;
    }

    .markdown-body ul,
    .markdown-body ol {
      padding-left: 1.5rem;
    }

    .markdown-body a {
      color: #0f766e;
      text-decoration: underline;
    }

    .markdown-body code {
      background: rgba(15, 23, 42, 0.06);
      border-radius: 0.35rem;
      padding: 0.12rem 0.35rem;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 0.9em;
    }

    .markdown-body pre {
      background: #0f172a;
      color: #e2e8f0;
      border-radius: 0.8rem;
      padding: 1rem;
      overflow-x: auto;
    }

    .markdown-body pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }

    .markdown-body blockquote {
      border-left: 4px solid rgba(56, 189, 248, 0.7);
      background: rgba(56, 189, 248, 0.06);
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      color: rgba(15, 23, 42, 0.8);
    }

    .markdown-body table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid var(--ff-border);
      overflow: hidden;
      border-radius: 0.75rem;
    }

    .markdown-body th,
    .markdown-body td {
      padding: 0.65rem 0.8rem;
      border: 1px solid var(--ff-border);
      text-align: left;
    }
  `]
})
export class MarkdownRendererComponent {
  @Input() markdown = '';

  readonly renderedHtml = computed(() => this.renderMarkdown(this.markdown));

  private renderMarkdown(source: string): string {
    if (!source?.trim()) return '';

    const escaped = this.escapeHtml(source);

    let html = escaped
      .replace(/```([\s\S]*?)```/g, (_, code: string) => `<pre><code>${code.trim()}</code></pre>`)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^>\s?(.*)$/gm, '<blockquote>$1</blockquote>')
      .replace(/^(#{1,6})\s+(.*)$/gm, (_, hashes: string, text: string) => `<h${hashes.length}>${text}</h${hashes.length}>`)
      .replace(/^(?:\s*[-*]\s+.+(?:\n|$))+/gm, (match: string) => {
        const items = match.split(/\n/).map(line => line.replace(/^\s*[-*]\s+/, '').trim()).filter(Boolean);
        return `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
      })
      .replace(/^(?:\s*\d+\.\s+.+(?:\n|$))+/gm, (match: string) => {
        const items = match.split(/\n/).map(line => line.replace(/^\s*\d+\.\s+/, '').trim()).filter(Boolean);
        return `<ol>${items.map(item => `<li>${item}</li>`).join('')}</ol>`;
      })
      .replace(/\n{2,}/g, '\n');

    const blocks = html.split(/\n+/).filter(block => block.trim().length > 0);
    const rendered = blocks.map(block => {
      if (block.startsWith('<h') || block.startsWith('<ul') || block.startsWith('<ol') || block.startsWith('<pre') || block.startsWith('<blockquote')) {
        return block;
      }

      return `<p>${block}</p>`;
    }).join('\n');

    return rendered;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
