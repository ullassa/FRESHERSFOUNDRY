import { Component } from '@angular/core';
import { CardComponent } from '../../shared/components/card.component';

@Component({
  selector: 'app-interview-questions',
  standalone: true,
  imports: [CardComponent],
  template: `
    <app-card>
      <h2>Interview Questions</h2>
      <p>Admin-authored prep questions grouped by skill, company, and difficulty.</p>
    </app-card>
  `
})
export class InterviewQuestionsComponent {}
