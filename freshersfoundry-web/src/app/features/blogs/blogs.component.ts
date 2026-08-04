import { Component } from '@angular/core';
import { CardComponent } from '../../shared/components/card.component';

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CardComponent],
  template: `
    <app-card>
      <h2>Blogs</h2>
      <p>Creator blogs, sponsored placements, and editorial content for freshers.</p>
    </app-card>
  `
})
export class BlogsComponent {}
