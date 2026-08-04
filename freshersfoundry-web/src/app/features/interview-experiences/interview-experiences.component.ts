import { Component } from '@angular/core';
import { CardComponent } from '../../shared/components/card.component';

@Component({
  selector: 'app-interview-experiences',
  standalone: true,
  imports: [CardComponent],
  template: `
    <app-card>
      <h2>Interview Experiences</h2>
      <p>Verified narrative submissions, moderation queue, and anonymous sharing.</p>
    </app-card>
  `
})
export class InterviewExperiencesComponent {}
