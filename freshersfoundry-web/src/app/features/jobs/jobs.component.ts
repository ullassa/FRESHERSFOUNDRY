import { Component } from '@angular/core';
import { CardComponent } from '../../shared/components/card.component';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CardComponent],
  template: `
    <app-card>
      <h2>Jobs</h2>
      <p>Filtered public jobs list with sponsored cards and creator/admin posting flow.</p>
    </app-card>
  `
})
export class JobsComponent {}
