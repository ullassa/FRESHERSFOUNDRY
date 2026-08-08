import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobService, JobItem } from './job.service';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="jobs-container">
      <div class="jobs-header">
        <h2>Verified Job Opportunities</h2>
        <p>Curated roles for freshers, students, and early-career developers.</p>
      </div>

      <div class="jobs-grid" *ngIf="!loading() && jobs().length > 0; else emptyState">
        <mat-card class="job-card" *ngFor="let job of jobs(); trackBy: trackByJob">
          <mat-card-header>
            <mat-card-title>{{ job.title }}</mat-card-title>
            <mat-card-subtitle>{{ job.companyName }} • {{ job.location }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content class="job-card-body">
            <div class="badge-row chip-list">
                <mat-chip color="primary" selected>{{ job.jobType }}</mat-chip>
                <mat-chip *ngIf="job.experienceLevel" selected>{{ job.experienceLevel }}</mat-chip>
                <mat-chip *ngIf="job.salaryRange" selected>{{ job.salaryRange }}</mat-chip>
            </div>

            <p class="job-description">{{ job.description }}</p>

            <div class="skills-row chip-list">
                <mat-chip *ngFor="let skill of splitTags(job.skillTags)" outlined>{{ skill }}</mat-chip>
            </div>
          </mat-card-content>

          <mat-card-actions align="end">
            <a mat-flat-button color="primary" [href]="job.applyLink" target="_blank" rel="noreferrer">
              Apply Now
              <mat-icon>open_in_new</mat-icon>
            </a>
          </mat-card-actions>
        </mat-card>
      </div>

      <ng-template #emptyState>
        <div class="empty-jobs">
          <mat-icon>work_off</mat-icon>
          <h3>No approved jobs currently available</h3>
          <p>Check back soon for new opportunities!</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .jobs-shell {
      display: grid;
      gap: 1.5rem;
    }

    .jobs-header {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .jobs-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }

    .job-card {
      border-radius: 1rem;
      overflow: hidden;
      min-height: 260px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .badge-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .skills-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    mat-chip {
      margin: 0.15rem;
    }

    .job-description {
      margin: 0 0 1rem;
      color: rgba(15, 23, 42, 0.78);
      min-height: 3rem;
    }

    .skills-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .empty-jobs {
      display: grid;
      place-items: center;
      gap: 0.75rem;
      padding: 2rem;
      text-align: center;
      color: rgba(15, 23, 42, 0.72);
    }

    .empty-jobs mat-icon {
      font-size: 3rem;
      color: rgba(56, 189, 248, 0.8);
    }

    .tag {
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.06);
      font-size: 0.8rem;
    }

    .jobs-loading {
      display: flex;
      justify-content: center;
      padding: 2rem 0;
    }
  `]
})
export class JobsComponent {
  private readonly jobService = inject(JobService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly jobs = signal<JobItem[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.jobService.getApprovedJobs().subscribe({
      next: (res) => {
        this.jobs.set(res.items || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  edit(id: string): void {
    this.router.navigateByUrl(`/admin/post-job/${id}`);
  }

  delete(id: string): void {
    if (!confirm('Delete this job?')) return;
    this.router.navigateByUrl(`/admin/post-job/${id}`);
  }

  apply(url: string): void {
    window.open(url, '_blank');
  }

  splitTags(tags: string): string[] {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  trackByJob(_: number, job: JobItem): string {
    return job.id;
  }
}

