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
    <mat-card class="job-details-card">
      <mat-card-header>
        <mat-card-title>{{ data.title }}</mat-card-title>
        <mat-card-subtitle>{{ data.companyName }} • {{ data.location }}</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <div class="badge-row">
          <mat-chip color="primary" selected>{{ data.jobType }}</mat-chip>
          <mat-chip *ngIf="data.experienceLevel" selected>{{ data.experienceLevel }}</mat-chip>
          <mat-chip *ngIf="data.salaryRange" selected>{{ data.salaryRange }}</mat-chip>
        </div>

        <div class="description" [innerText]="data.description"></div>

        <div class="skills-row">
          <mat-chip *ngFor="let s of splitTags(data.skillTags)" outlined>{{ s }}</mat-chip>
        </div>
      </mat-card-content>

      <mat-card-actions align="end">
        <button mat-flat-button color="primary" (click)="openApply()">Open Application</button>
        <button mat-stroked-button (click)="close()">Close</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [
    `
    .job-details-card { max-height: 80vh; overflow: auto; }
    .badge-row { display:flex; gap:0.5rem; margin-bottom:1rem }
    .description { white-space: pre-wrap; color: rgba(15,23,42,0.9); margin-bottom:1rem }
    .skills-row { display:flex; gap:0.5rem; flex-wrap:wrap }
    `
  ]
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

  openApply(): void {
    if (this.data?.applyLink) {
      window.open(this.data.applyLink, '_blank');
    }
  }

  close(): void { this.dialogRef.close(); }
}
