import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface JobDialogData {
  id: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string | null;
  location: string;
  jobType: string;
  experienceLevel?: string | null;
  salaryRange?: string | null;
  skillTags: string;
  description: string;
  applyLink: string;
  createdAt: string;
}

@Component({
  selector: 'app-job-details-dialog',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatChipsModule, MatIconModule, MatDialogModule],
  template: `
    <div class="job-details-container">
      <!-- Header -->
      <div class="job-header">
        <div class="header-left">
          <div class="logo-container" *ngIf="data.companyLogoUrl; else noLogo">
            <img [src]="data.companyLogoUrl" [alt]="data.companyName + ' logo'" class="company-logo" />
          </div>
          <ng-template #noLogo>
            <div class="logo-placeholder">{{ getInitials(data.companyName) }}</div>
          </ng-template>
          
          <div class="header-text">
            <h2 class="job-title">{{ data.title }}</h2>
            <div class="company-info">
              <span class="company-name">{{ data.companyName }}</span>
              <span class="separator">·</span>
              <span class="location">{{ data.location }}</span>
            </div>
            <div class="job-meta">
              <span class="meta-item">Posted {{ formatDate(data.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Job Details Content -->
      <div class="job-content">
        <!-- Tags Section -->
        <div class="tags-section">
          <span class="job-type-badge" [class.fulltime]="data.jobType === 'FullTime'" [class.internship]="data.jobType === 'Internship'" [class.contract]="data.jobType === 'Contract'">
            {{ data.jobType === 'FullTime' ? 'Full-Time' : data.jobType === 'Internship' ? 'Internship' : 'Contract' }}
          </span>
          <span class="skill-badge" *ngFor="let skill of splitTags(data.skillTags)">{{ skill }}</span>
        </div>

        <!-- Info Cards -->
        <div class="info-cards">
          <div *ngIf="data.experienceLevel" class="info-card">
            <span class="label">Experience Level</span>
            <span class="value">{{ data.experienceLevel }}</span>
          </div>
          <div *ngIf="data.salaryRange" class="info-card">
            <span class="label">Salary Range</span>
            <span class="value">{{ data.salaryRange }}</span>
          </div>
        </div>

        <!-- Description Section -->
        <div class="description-section">
          <h3>About this role</h3>
          <div class="description-text" [innerHTML]="formatDescription(data.description)"></div>
        </div>

        <!-- Skills Section -->
        <div *ngIf="data.skillTags" class="skills-section">
          <h3>Required Skills</h3>
          <div class="skills-grid">
            <span class="skill-item" *ngFor="let skill of splitTags(data.skillTags)">{{ skill }}</span>
          </div>
        </div>
      </div>

      <!-- Apply Section -->
      <div class="apply-section">
        <button mat-flat-button color="primary" class="apply-btn" (click)="openApply()">
          <mat-icon>open_in_new</mat-icon>
          Apply Now
        </button>
        <button mat-stroked-button (click)="close()" class="close-btn">Close</button>
      </div>
    </div>
  `,
  styles: [`
    .job-details-container {
      max-height: 90vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .job-header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      padding: 2rem;
      color: white;
    }

    .header-left {
      display: flex;
      gap: 1.5rem;
      align-items: flex-start;
    }

    .logo-container {
      flex-shrink: 0;
    }

    .company-logo {
      width: 80px;
      height: 80px;
      border-radius: 0.8rem;
      background: white;
      padding: 0.5rem;
      object-fit: contain;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .logo-placeholder {
      width: 80px;
      height: 80px;
      border-radius: 0.8rem;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.5rem;
      color: white;
      flex-shrink: 0;
    }

    .header-text {
      flex: 1;
    }

    .job-title {
      margin: 0 0 0.5rem;
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1.3;
    }

    .company-info {
      display: flex;
      gap: 0.6rem;
      align-items: center;
      font-size: 0.95rem;
      margin-bottom: 0.5rem;
      opacity: 0.9;
    }

    .separator {
      opacity: 0.6;
    }

    .job-meta {
      font-size: 0.85rem;
      opacity: 0.8;
    }

    .job-content {
      flex: 1;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .tags-section {
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

    .skill-badge {
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.3rem 0.6rem;
      border-radius: 0.3rem;
      background: #f0f0f0;
      color: #666;
      display: inline-block;
    }

    .info-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .info-card {
      background: #f8f9fa;
      border-left: 3px solid #4f46e5;
      padding: 1rem;
      border-radius: 0.4rem;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .info-card .label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      color: #999;
      letter-spacing: 0.5px;
    }

    .info-card .value {
      font-size: 1rem;
      font-weight: 600;
      color: #1a1a1a;
    }

    .description-section h3,
    .skills-section h3 {
      margin: 0 0 1rem;
      font-size: 1.1rem;
      font-weight: 700;
      color: #1a1a1a;
    }

    .description-text {
      line-height: 1.8;
      color: #666;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .skills-section {
      border-top: 1px solid #e8e8e8;
      padding-top: 1.5rem;
    }

    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 0.6rem;
    }

    .skill-item {
      background: #f0f0f0;
      border: 1px solid #e0e0e0;
      padding: 0.6rem 1rem;
      border-radius: 0.4rem;
      font-size: 0.85rem;
      font-weight: 500;
      color: #666;
      text-align: center;
    }

    .apply-section {
      background: #f8f9fa;
      padding: 1.5rem 2rem;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      border-top: 1px solid #e8e8e8;
    }

    .apply-btn {
      padding: 0.8rem 2rem !important;
      font-weight: 600 !important;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .apply-btn mat-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
    }

    .close-btn {
      padding: 0.8rem 2rem !important;
    }

    @media (max-width: 768px) {
      .header-left {
        flex-direction: column;
      }

      .job-content {
        padding: 1.5rem;
      }

      .apply-section {
        flex-direction: column;
        padding: 1rem;
      }

      .apply-btn,
      .close-btn {
        width: 100%;
      }
    }
  `]
})
export class JobDetailsDialogComponent {
  public readonly data = inject(MAT_DIALOG_DATA) as JobDialogData;
  private readonly dialogRef = inject(MatDialogRef<JobDetailsDialogComponent>);

  splitTags(tags: string): string[] {
    return (tags || '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
  }

  formatDescription(desc: string): string {
    if (!desc) return '';
    return desc
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .join('<br><br>');
  }

  getInitials(name: string): string {
    return name
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

  openApply(): void {
    if (this.data?.applyLink) {
      window.open(this.data.applyLink, '_blank', 'noopener,noreferrer');
    }
  }

  close(): void { 
    this.dialogRef.close(); 
  }
}
