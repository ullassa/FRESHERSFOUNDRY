import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ad-banner',
  standalone: true,
  template: `
    <aside class="banner">
      <div class="label">Sponsored</div>
      <div class="content">
        <strong>{{ placement }}</strong>
        <span>Placeholder banner slot for internal sponsored content.</span>
      </div>
    </aside>
  `,
  styles: [`
    .banner {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.25rem;
      padding: 1rem 1.2rem;
      border-radius: 1rem;
      border: 1px dashed rgba(217, 119, 6, 0.35);
      background: linear-gradient(135deg, rgba(217, 119, 6, 0.08), rgba(255, 255, 255, 0.96));
    }

    .label {
      padding: 0.35rem 0.65rem;
      border-radius: 999px;
      background: rgba(217, 119, 6, 0.14);
      color: #92400e;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      color: var(--ff-muted);
    }

    .content strong {
      color: var(--ff-text);
    }
  `]
})
export class AdBannerComponent {
  @Input() placement = 'HomeTop';
}
