import { Component } from '@angular/core';
import { CardComponent } from '../../shared/components/card.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CardComponent],
  template: `
    <section class="dashboard-hero">
      <div>
        <p class="eyebrow">Admin workspace</p>
        <h1>Moderate content, approve creators, and keep the platform clean.</h1>
        <p class="intro">
          This dashboard is the control center for interview experiences, jobs, blogs, creator applications,
          and ad placements.
        </p>
      </div>
      <app-card>
        <div class="hero-note">
          <strong>Daily focus</strong>
          <span>Review the pending queue, keep sponsored content active, and publish high-quality posts.</span>
        </div>
      </app-card>
    </section>

    <section class="stats-grid">
      <app-card>
        <div class="stat-card">
          <span>Pending approvals</span>
          <strong>14</strong>
          <small>Experiences, blogs, jobs, creators</small>
        </div>
      </app-card>
      <app-card>
        <div class="stat-card">
          <span>Active ads</span>
          <strong>2</strong>
          <small>1 banner and 1 sponsored job</small>
        </div>
      </app-card>
      <app-card>
        <div class="stat-card">
          <span>Drafts in review</span>
          <strong>6</strong>
          <small>Creator-submitted content</small>
        </div>
      </app-card>
      <app-card>
        <div class="stat-card">
          <span>Questions published</span>
          <strong>25</strong>
          <small>Seeded starter catalog</small>
        </div>
      </app-card>
    </section>

    <section class="content-grid">
      <app-card>
        <div class="panel-head">
          <div>
            <p class="eyebrow">Moderation queue</p>
            <h2>Items waiting for review</h2>
          </div>
        </div>

        <div class="queue-list">
          <div class="queue-item">
            <div>
              <strong>Amazon SDE Intern</strong>
              <span>Interview Experience · Anonymous user</span>
            </div>
            <span class="badge">Pending</span>
          </div>
          <div class="queue-item">
            <div>
              <strong>Priya S.</strong>
              <span>Creator Application · Frontend developer</span>
            </div>
            <span class="badge">Pending</span>
          </div>
          <div class="queue-item">
            <div>
              <strong>How I cracked aptitude tests</strong>
              <span>Blog Post · Creator draft</span>
            </div>
            <span class="badge">Pending</span>
          </div>
          <div class="queue-item">
            <div>
              <strong>Junior Backend Engineer</strong>
              <span>Sponsored Job · Hiring partner</span>
            </div>
            <span class="badge">Pending</span>
          </div>
        </div>
      </app-card>

      <app-card>
        <div class="panel-head">
          <div>
            <p class="eyebrow">Quick actions</p>
            <h2>What the admin can do here</h2>
          </div>
        </div>

        <div class="action-list">
          <div class="action-item">Post interview questions</div>
          <div class="action-item">Review creator applications</div>
          <div class="action-item">Approve jobs and blogs</div>
          <div class="action-item">Manage banner placements</div>
          <div class="action-item">Inspect click and impression stats</div>
        </div>
      </app-card>
    </section>
  `,
  styles: [`
    .dashboard-hero {
      display: grid;
      grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.7fr);
      gap: 1rem;
      align-items: stretch;
      margin-bottom: 1rem;
    }

    h1, h2, p {
      margin: 0;
    }

    h1 {
      margin-top: 0.45rem;
      font-size: clamp(2rem, 4vw, 3.4rem);
      line-height: 1.05;
      letter-spacing: -0.05em;
    }

    .intro {
      margin-top: 0.85rem;
      color: var(--ff-muted);
      line-height: 1.7;
      max-width: 62ch;
    }

    .eyebrow {
      color: var(--ff-cta);
      font-size: 0.8rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }

    .hero-note {
      display: grid;
      gap: 0.55rem;
      color: var(--ff-muted);
      line-height: 1.6;
    }

    .hero-note strong,
    .stat-card strong {
      color: var(--ff-text);
    }

    .stats-grid,
    .content-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .content-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .stat-card {
      display: grid;
      gap: 0.35rem;
    }

    .stat-card span,
    .stat-card small,
    .queue-item span {
      color: var(--ff-muted);
    }

    .stat-card strong {
      font-size: 2rem;
    }

    .panel-head {
      margin-bottom: 0.9rem;
    }

    .panel-head h2 {
      margin-top: 0.35rem;
      font-size: 1.35rem;
    }

    .queue-list,
    .action-list {
      display: grid;
      gap: 0.8rem;
    }

    .queue-item,
    .action-item {
      padding: 0.95rem 1rem;
      border: 1px solid var(--ff-border);
      border-radius: 0.95rem;
      background: linear-gradient(180deg, #fff, #f8fafc);
    }

    .queue-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .queue-item strong {
      display: block;
      margin-bottom: 0.2rem;
    }

    .badge {
      padding: 0.35rem 0.7rem;
      border-radius: 999px;
      background: rgba(217, 119, 6, 0.12);
      color: #92400e;
      font-size: 0.8rem;
      font-weight: 700;
      white-space: nowrap;
    }

    @media (max-width: 900px) {
      .dashboard-hero,
      .stats-grid,
      .content-grid {
        grid-template-columns: 1fr;
      }

      .queue-item {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `]
})
export class AdminDashboardComponent {}
