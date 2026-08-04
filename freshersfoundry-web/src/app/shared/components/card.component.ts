import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <section class="card">
      <ng-content></ng-content>
    </section>
  `,
  styles: [`
    .card {
      background: #fff;
      border: 1px solid var(--ff-border);
      border-radius: 1.25rem;
      box-shadow: var(--ff-shadow);
      padding: 1.25rem;
    }
  `]
})
export class CardComponent {
  @Input() compact = false;
}
