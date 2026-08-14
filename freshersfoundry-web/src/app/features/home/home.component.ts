import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../shared/components/card.component';
import { JobService } from '../jobs/job.service';
import { StatsService } from '../stats/stats.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const featuredCards = [
  {
    icon: '📖',
    title: 'Verified Interview Experiences',
    text: 'Read detailed company-wise stories with round breakdowns, outcomes, and practical takeaways from real candidates.'
  },
  {
    icon: '❓',
    title: 'Interview Questions by Stack',
    text: 'Browse Java, SQL, HR, React, Angular, and company-specific prep questions organized by difficulty level.'
  },
  {
    icon: '💼',
    title: 'Fresh Graduate Jobs',
    text: 'Discover curated roles for students and freshers, including internships and full-time openings across India.'
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
  imports: [CommonModule, RouterLink, CardComponent],
  template: `
    <section class="hero-section">
      <div class="hero-content">
        <h1>
          Discover verified 
          <span class="highlight">interview stories, jobs & prep</span>
        </h1>
        <p>Curated opportunities and real interview experiences for freshers across India.</p>
        
        <div class="search-bar">
          <div class="search-input-group">
            <input type="text" placeholder="Search jobs, questions, or companies" class="search-input" />
            <button class="search-btn">Search</button>
          </div>
        </div>

        <div class="quick-links">
          <a routerLink="/jobs" class="quick-link">
            <span class="icon">💼</span>
            <span>Browse Jobs</span>
          </a>
          <a routerLink="/interview-experiences" class="quick-link">
            <span class="icon">📖</span>
            <span>Read Experiences</span>
          </a>
          <a routerLink="/interview-questions" class="quick-link">
            <span class="icon">❓</span>
            <span>Practice Questions</span>
          </a>
          <a routerLink="/blogs" class="quick-link">
            <span class="icon">📝</span>
            <span>Read Blogs</span>
          </a>
        </div>
      </div>

      <!-- Latest Jobs Section -->
      <div class="latest-jobs-section" *ngIf="jobs().length > 0">
        <div class="latest-jobs-container">
          <div class="section-header">
            <div>
              <h3>Latest Jobs</h3>
              <p class="section-subtitle">The {{ jobs().length }} most recent openings hiring right now</p>
            </div>
            <a routerLink="/jobs" class="browse-all-btn">Browse all jobs →</a>
          </div>
          
          <div class="jobs-list">
            <a *ngFor="let job of jobs()" [routerLink]="'/jobs'" class="job-card-large">
              <!-- Company Logo Placeholder -->
              <div class="job-card-left">
                <div class="company-badge">{{ getCompanyInitials(job.companyName) }}</div>
              </div>

              <!-- Job Details -->
              <div class="job-card-content">
                <div class="job-title-section">
                  <h4 class="job-card-title">{{ job.title }}</h4>
                  <div class="job-meta-line">
                    <span class="job-company-name">{{ job.companyName }}</span>
                    <span class="job-separator">·</span>
                    <span class="job-location">{{ job.location || 'India' }}</span>
                  </div>
                </div>

                <div class="job-tags">
                  <span class="job-type-badge" [class.fulltime]="job.jobType === 'FullTime'" [class.internship]="job.jobType === 'Internship'" [class.contract]="job.jobType === 'Contract'">
                    {{ job.jobType === 'FullTime' ? 'Full-Time' : job.jobType === 'Internship' ? 'Internship' : 'Contract' }}
                  </span>
                  <span class="job-skill-tag" *ngIf="job.skillsRequired">{{ job.skillsRequired }}</span>
                  <span class="job-skill-tag" *ngIf="job.category">{{ job.category }}</span>
                </div>

                <div class="job-footer">
                  <span class="job-salary" *ngIf="job.salaryMin && job.salaryMax">
                    ₹{{ job.salaryMin }}L - ₹{{ job.salaryMax }}L per year
                  </span>
                  <span class="job-posted">Posted {{ formatDate(job.createdAt) }}</span>
                </div>
              </div>

              <!-- Action -->
              <div class="job-card-action">
                <div class="apply-btn">Apply</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="stats-section">
      <div class="stat-card">
        <div class="stat-number">{{ stats().activeJobs }}+</div>
        <div class="stat-label">Active Jobs</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats().interviewStories }}+</div>
        <div class="stat-label">Interview Stories</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats().practiceQuestions }}+</div>
        <div class="stat-label">Practice Questions</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats().expertBlogs }}+</div>
        <div class="stat-label">Expert Blogs</div>
      </div>
    </section>

    <section class="features-section">
      <h2>Why choose FreshersFoundry?</h2>
      
      <div class="feature-grid">
        <app-card *ngFor="let card of featuredCards; trackBy: trackCard" class="feature-card">
          <div class="feature-icon">{{ card.icon }}</div>
          <h3>{{ card.title }}</h3>
          <p>{{ card.text }}</p>
        </app-card>
      </div>
    </section>

    <section class="cta-section">
      <h2>Ready to start your journey?</h2>
      <div class="cta-buttons">
        <a routerLink="/auth/register" class="btn btn-primary">Get Started Now</a>
        <a routerLink="/jobs" class="btn btn-secondary">Browse Opportunities</a>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Hero Section */
    .hero-section {
      background: #f8f9fa;
      padding: 3.5rem 2rem;
      border-bottom: 1px solid #e8e8e8;
    }

    .hero-content {
      max-width: 850px;
      margin: 0 auto;
      text-align: center;
    }

    h1 {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 700;
      line-height: 1.25;
      margin: 0 0 1.2rem;
      color: #1a1a1a;
      letter-spacing: -0.01em;
    }

    h1 .highlight {
      color: #4f46e5;
      font-weight: 800;
    }

    > p {
      font-size: 1rem;
      color: #666;
      max-width: 600px;
      margin: 0 auto 2rem;
      line-height: 1.6;
      font-weight: 500;
    }

    .search-bar {
      margin: 2.5rem 0 2rem;
      max-width: 650px;
      margin-left: auto;
      margin-right: auto;
    }

    .search-input-group {
      display: flex;
      gap: 0;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 0.8rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    .search-input {
      flex: 1;
      border: none;
      outline: none;
      padding: 0.95rem 1.2rem;
      font-size: 1rem;
      background: transparent;
      color: #1a1a1a;
    }

    .search-input::placeholder {
      color: #999;
    }

    .search-btn {
      background: #4f46e5;
      color: #fff;
      border: none;
      padding: 0.95rem 2rem;
      border-radius: 0;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .search-btn:hover {
      background: #3f3ad8;
    }

    .quick-links {
      display: flex;
      gap: 1.2rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 2rem;
    }

    .quick-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.2rem;
      border-radius: 0.7rem;
      background: #fff;
      border: 1px solid #ddd;
      text-decoration: none;
      color: #1a1a1a;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.2s ease;
    }

    .quick-link:hover {
      background: #f0f0f0;
      border-color: #4f46e5;
      color: #4f46e5;
    }

    .quick-link .icon {
      font-size: 1.1rem;
    }

    /* Latest Jobs Section */
    .latest-jobs-section {
      background: #fff;
      border-top: 1px solid #e8e8e8;
      padding: 3rem 2rem;
    }

    .latest-jobs-container {
      max-width: 1100px;
      margin: 0 auto;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2.5rem;
    }

    .section-header h3 {
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0 0 0.3rem;
      color: #1a1a1a;
    }

    .section-subtitle {
      font-size: 0.95rem;
      color: #666;
      margin: 0;
      font-weight: 400;
    }

    .browse-all-btn {
      padding: 0.8rem 1.5rem;
      border: 1.5px solid #4f46e5;
      border-radius: 0.6rem;
      color: #4f46e5;
      font-weight: 600;
      text-decoration: none;
      background: transparent;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .browse-all-btn:hover {
      background: #f0f0ff;
    }

    .jobs-list {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }

    .job-card-large {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1.5rem;
      align-items: center;
      padding: 1.5rem;
      background: #fff;
      border: 1px solid #e8e8e8;
      border-radius: 0.8rem;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .job-card-large:hover {
      border-color: #4f46e5;
      box-shadow: 0 4px 16px rgba(79, 70, 229, 0.12);
    }

    .job-card-left {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .company-badge {
      width: 50px;
      height: 50px;
      border-radius: 0.6rem;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .job-card-content {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .job-title-section {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .job-card-title {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: #1a1a1a;
      line-height: 1.4;
    }

    .job-meta-line {
      font-size: 0.9rem;
      color: #666;
      display: flex;
      gap: 0.6rem;
      align-items: center;
    }

    .job-company-name {
      font-weight: 600;
      color: #4f46e5;
    }

    .job-separator {
      color: #ddd;
    }

    .job-location {
      color: #999;
    }

    .job-tags {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
    }

    .job-type-badge {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.4rem 0.8rem;
      border-radius: 0.4rem;
      background: #e8e8e8;
      color: #666;
      display: inline-block;
    }

    .job-type-badge.fulltime {
      background: rgba(79, 70, 229, 0.1);
      color: #4f46e5;
    }

    .job-type-badge.internship {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
    }

    .job-type-badge.contract {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .job-skill-tag {
      font-size: 0.8rem;
      font-weight: 500;
      padding: 0.4rem 0.8rem;
      border-radius: 0.4rem;
      background: #f0f0f0;
      color: #666;
      display: inline-block;
    }

    .job-footer {
      display: flex;
      gap: 1.2rem;
      align-items: center;
      font-size: 0.85rem;
      color: #999;
      flex-wrap: wrap;
    }

    .job-salary {
      font-weight: 600;
      color: #1a1a1a;
    }

    .job-posted {
      color: #999;
    }

    .job-card-action {
      display: flex;
      justify-content: flex-end;
    }

    .apply-btn {
      padding: 0.7rem 1.6rem;
      background: #4f46e5;
      color: #fff;
      border: none;
      border-radius: 0.5rem;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      transition: background 0.2s ease;
      white-space: nowrap;
    }

    .job-card-large:hover .apply-btn {
      background: #3f3ad8;
    }

    @media (max-width: 768px) {
      .section-header {
        flex-direction: column;
        gap: 1rem;
      }

      .browse-all-btn {
        width: 100%;
        text-align: center;
      }

      .job-card-large {
        grid-template-columns: auto 1fr;
        gap: 1rem;
        padding: 1rem;
      }

      .job-card-action {
        grid-column: 2;
        margin-top: 0.5rem;
      }

      .apply-btn {
        width: 100%;
      }

      .job-tags {
        gap: 0.4rem;
      }

      .job-skill-tag,
      .job-type-badge {
        font-size: 0.75rem;
        padding: 0.3rem 0.6rem;
      }
    }

    /* Stats Section */
    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1.5rem;
      padding: 3rem 2rem;
      max-width: 1100px;
      margin: 0 auto;
    }

    .stat-card {
      text-align: center;
      padding: 1.8rem 1rem;
      background: #fff;
      border: 1px solid #e8e8e8;
      border-radius: 0.8rem;
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      border-color: #4f46e5;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.08);
    }

    .stat-number {
      font-size: 2.2rem;
      font-weight: 800;
      color: #4f46e5;
      margin-bottom: 0.4rem;
    }

    .stat-label {
      font-size: 0.95rem;
      color: #666;
      font-weight: 500;
    }

    /* Features Section */
    .features-section {
      padding: 3.5rem 2rem;
      max-width: 1100px;
      margin: 0 auto;
    }

    .features-section > h2 {
      font-size: 2rem;
      font-weight: 700;
      text-align: center;
      margin: 0 0 2.5rem;
      color: #1a1a1a;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.8rem;
    }

    .feature-card {
      padding: 2rem !important;
      transition: all 0.2s ease;
      text-align: center;
      background: #fff !important;
      border: 1px solid #e8e8e8 !important;
    }

    .feature-card:hover {
      border-color: #4f46e5 !important;
      box-shadow: 0 8px 20px rgba(79, 70, 229, 0.1) !important;
    }

    .feature-icon {
      font-size: 2.8rem;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      margin: 0 0 1rem;
      font-size: 1.15rem;
      font-weight: 700;
      color: #1a1a1a;
    }

    .feature-card p {
      margin: 0;
      color: #666;
      line-height: 1.6;
      font-size: 0.95rem;
    }

    /* CTA Section */
    .cta-section {
      background: #f8f9fa;
      padding: 3.5rem 2rem;
      text-align: center;
    }

    .cta-section h2 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 1.8rem;
      color: #1a1a1a;
    }

    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      max-width: 600px;
      margin: 0 auto;
    }

    .btn {
      padding: 0.9rem 2rem;
      border-radius: 0.7rem;
      font-weight: 700;
      font-size: 1rem;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-block;
    }

    .btn-primary {
      background: #4f46e5;
      color: #fff;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
    }

    .btn-primary:hover {
      background: #3f3ad8;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }

    .btn-secondary {
      background: #fff;
      color: #4f46e5;
      border: 1.5px solid #4f46e5;
    }

    .btn-secondary:hover {
      background: #f0f0f0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hero-section {
        padding: 2.5rem 1.5rem;
      }

      h1 {
        font-size: 1.7rem;
      }

      .search-input-group {
        flex-direction: column;
      }

      .search-btn {
        border-radius: 0.8rem;
      }

      .quick-links {
        gap: 0.8rem;
      }

      .quick-link {
        font-size: 0.85rem;
        padding: 0.5rem 1rem;
      }

      .cta-buttons {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class HomeComponent {
  private readonly jobService = inject(JobService);
  private readonly statsService = inject(StatsService);

  readonly featuredCards = featuredCards;
  readonly spotlightItems = spotlightItems;
  readonly jobs = signal<any[]>([]);
  readonly stats = signal({ activeJobs: 0, interviewStories: 0, practiceQuestions: 0, expertBlogs: 0 });

  ngOnInit(): void {
    this.jobService.getApprovedJobs().subscribe({
      next: (response) => this.jobs.set((response.items ?? []).slice(0, 4)),
      error: () => this.jobs.set([])
    });

    this.statsService.getStats().subscribe({
      next: (response) => this.stats.set(response),
      error: () => this.stats.set({ activeJobs: 0, interviewStories: 0, practiceQuestions: 0, expertBlogs: 0 })
    });
  }

  trackCard(index: number, card: { title: string }): string {
    return `${card.title}-${index}`;
  }

  trackJob(index: number, job: { id: string }): string {
    return `${job.id}-${index}`;
  }

  getCompanyInitials(companyName: string): string {
    return companyName
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'yesterday';
    }

    const daysAgo = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo < 7) {
      return `${daysAgo} days ago`;
    }

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
  }
}
