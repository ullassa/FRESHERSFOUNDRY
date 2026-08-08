import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../shared/components/card.component';
import { TagChipComponent } from '../../shared/components/tag-chip.component';

const featuredCards = [
  {
    title: 'Verified interview experiences',
    text: 'Read detailed company-wise stories with round breakdowns, outcomes, and practical takeaways.'
  },
  {
    title: 'Interview questions by stack',
    text: 'Browse Java, SQL, HR, React, Angular, and company-specific prep questions in one place.'
  },
  {
    title: 'Fresh graduate jobs',
    text: 'Discover curated roles for students and freshers, including internships and full-time openings.'
  }
];

const spotlightItems = [
  { label: 'Jobs', value: 'Admin-posted roles appear after approval.' },
  { label: 'Interview experiences', value: 'Approved stories show up in the public feed.' },
  { label: 'Interview questions', value: 'Fresh admin entries are published directly.' }
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CardComponent, TagChipComponent],
  template: `
    <section class="hero-grid">
      <div class="hero-copy">
        <app-tag-chip label="Verified career platform"></app-tag-chip>
        <h1>Interview experiences, questions, jobs, and blogs for freshers.</h1>
        <p>
          FreshersFoundry is built for Indian students and freshers who want structured prep,
          curated opportunities, and real interview context without noise.
        </p>
        <div class="actions">
          <a class="primary" routerLink="/auth/register">Get started</a>
          <a class="secondary" routerLink="/jobs">Browse jobs</a>
        </div>
      </div>

      <app-card>
        <div class="hero-panel">
          <div class="panel-stat"><strong>Jobs</strong><span>Admin-posted roles and approvals</span></div>
          <div class="panel-stat"><strong>Blogs</strong><span>Published content only</span></div>
          <div class="panel-stat"><strong>Experiences</strong><span>Approved stories only</span></div>
          <div class="panel-stat"><strong>Questions</strong><span>Direct admin submissions</span></div>
        </div>
      </app-card>
    </section>

    <section class="section-block">
      <div class="section-head">
        <div>
          <app-tag-chip label="Why FreshersFoundry works"></app-tag-chip>
          <h2>Built for the exact problems freshers face.</h2>
        </div>
        <p>
          The home page should immediately show what the platform does, who it is for, and where users should go next.
        </p>
      </div>

      <div class="feature-grid">
        @for (card of featuredCards; track card.title) {
          <app-card>
            <h3>{{ card.title }}</h3>
            <p>{{ card.text }}</p>
          </app-card>
        }
      </div>
    </section>

    <section class="section-block two-column">
      <app-card>
        <div class="section-head compact">
          <div>
            <app-tag-chip label="Spotlight"></app-tag-chip>
            <h2>What users see first.</h2>
          </div>
        </div>

        <div class="spotlight-list">
          @for (item of spotlightItems; track item.label) {
            <div class="spotlight-item">
              <strong>{{ item.label }}</strong>
              <span>{{ item.value }}</span>
            </div>
          }
        </div>
      </app-card>

      <app-card>
        <div class="section-head compact">
          <div>
            <app-tag-chip label="Next steps"></app-tag-chip>
            <h2>Start using the platform.</h2>
          </div>
        </div>

        <div class="cta-stack">
          <a class="cta-link" routerLink="/auth/login">Login</a>
          <a class="cta-link" routerLink="/interview-experiences">Read experiences</a>
          <a class="cta-link" routerLink="/interview-questions">Practice questions</a>
        </div>
      </app-card>
    </section>
  `,
  styles: [`
    .hero-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.7fr);
      gap: 1.5rem;
      align-items: stretch;
    }

    .hero-copy {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    h1 {
      margin: 0.75rem 0 1rem;
      font-size: clamp(2.2rem, 4vw, 4.2rem);
      line-height: 1.02;
      letter-spacing: -0.05em;
      color: var(--ff-text);
    }

    p {
      max-width: 58ch;
      margin: 0;
      color: var(--ff-muted);
      font-size: 1.05rem;
      line-height: 1.7;
    }

    .actions {
      display: flex;
      gap: 0.8rem;
      margin-top: 1.4rem;
      flex-wrap: wrap;
    }

    .primary,
    .secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 3rem;
      padding: 0.85rem 1.2rem;
      border-radius: 0.9rem;
      font-weight: 700;
    }

    .primary {
      background: var(--ff-cta);
      color: #fff;
      box-shadow: 0 16px 34px rgba(225, 29, 72, 0.24);
    }

    .secondary {
      border: 1px solid var(--ff-border);
      background: #fff;
      color: var(--ff-text);
    }

    .hero-panel {
      display: grid;
      gap: 1rem;
    }

    .panel-stat {
      padding: 1rem 1.1rem;
      border-radius: 1rem;
      background: linear-gradient(180deg, #ffffff, #f8fafc);
      border: 1px solid var(--ff-border);
    }

    .panel-stat strong {
      display: block;
      font-size: 1.8rem;
      color: var(--ff-surface-strong);
    }

    .panel-stat span {
      color: var(--ff-muted);
    }

    .section-block {
      margin-top: 1.5rem;
    }

    .section-head {
      display: flex;
      gap: 1rem;
      align-items: end;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .section-head h2 {
      margin: 0.6rem 0 0;
      font-size: 1.6rem;
      letter-spacing: -0.03em;
    }

    .section-head p {
      max-width: 42ch;
      text-align: right;
    }

    .compact {
      margin-bottom: 0.9rem;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
    }

    .feature-grid h3 {
      margin: 0 0 0.55rem;
      font-size: 1.08rem;
    }

    .feature-grid p {
      margin: 0;
    }

    .two-column {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .spotlight-list,
    .cta-stack {
      display: grid;
      gap: 0.85rem;
    }

    .spotlight-item,
    .cta-link {
      padding: 0.95rem 1rem;
      border-radius: 0.95rem;
      border: 1px solid var(--ff-border);
      background: linear-gradient(180deg, #ffffff, #f8fafc);
    }

    .spotlight-item {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }

    .spotlight-item span {
      color: var(--ff-muted);
      text-align: right;
    }

    .cta-link {
      color: var(--ff-text);
      font-weight: 700;
    }

    @media (max-width: 900px) {
      .hero-grid,
      .feature-grid,
      .two-column {
        grid-template-columns: 1fr;
      }

      .section-head {
        align-items: flex-start;
        flex-direction: column;
      }

      .section-head p {
        text-align: left;
      }

      .spotlight-item {
        flex-direction: column;
      }
    }
  `]
})
export class HomeComponent {
  readonly featuredCards = featuredCards;
  readonly spotlightItems = spotlightItems;
}
