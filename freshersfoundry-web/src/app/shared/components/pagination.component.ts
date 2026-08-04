import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    <div class="pager">
      <button type="button" [disabled]="page <= 1">Prev</button>
      <span>Page {{ page }}</span>
      <button type="button">Next</button>
    </div>
  `,
  styles: [`
    .pager {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--ff-muted);
    }

    button {
      border: 1px solid var(--ff-border);
      background: #fff;
      padding: 0.55rem 0.9rem;
      border-radius: 0.8rem;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class PaginationComponent {
  @Input() page = 1;
}
