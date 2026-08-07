import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { JobCreateRequest, JobService } from '../jobs/job.service';

@Component({
  selector: 'app-post-job-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="dialog-shell">
      <h2>Post a New Job</h2>
      <form [formGroup]="form" (ngSubmit)="submit()" class="job-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Job title</mat-label>
          <input matInput formControlName="title" />
          <mat-error *ngIf="title?.hasError('required')">Title is required.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Company name</mat-label>
          <input matInput formControlName="companyName" />
          <mat-error *ngIf="companyName?.hasError('required')">Company name is required.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Location</mat-label>
          <input matInput formControlName="location" />
          <mat-error *ngIf="location?.hasError('required')">Location is required.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Job type</mat-label>
          <mat-select formControlName="jobType">
            <mat-option value="FullTime">Full-time</mat-option>
            <mat-option value="Internship">Internship</mat-option>
            <mat-option value="Contract">Contract</mat-option>
          </mat-select>
          <mat-error *ngIf="jobType?.hasError('required')">Job type is required.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Skill tags</mat-label>
          <input matInput formControlName="skillTags" placeholder="Java,Spring,SQL" />
          <mat-error *ngIf="skillTags?.hasError('required')">Skill tags are required.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Apply link</mat-label>
          <input matInput formControlName="applyLink" />
          <mat-error *ngIf="applyLink?.hasError('required')">Apply link is required.</mat-error>
          <mat-error *ngIf="applyLink?.hasError('pattern')">Use a valid URL starting with http:// or https://.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="5"></textarea>
          <mat-error *ngIf="description?.hasError('required')">Description is required.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Expiry date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="expiryDate" />
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <div class="actions">
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || isSubmitting()">
            {{ isSubmitting() ? 'Publishing…' : 'Publish Job' }}
          </button>
          <button mat-button type="button" (click)="close()">Cancel</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-shell {
      width: min(680px, 100vw);
      padding: 1rem;
      display: grid;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;
    }
  `]
})
export class PostJobDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly jobService = inject(JobService);
  private readonly dialogRef = inject(MatDialogRef<PostJobDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    companyName: ['', [Validators.required]],
    location: ['', [Validators.required]],
    jobType: ['FullTime', [Validators.required]],
    skillTags: ['', [Validators.required]],
    description: ['', [Validators.required]],
    applyLink: ['', [Validators.required, Validators.pattern('https?://.+')]],
    expiryDate: [null]
  });

  readonly isSubmitting = signal(false);

  get title() {
    return this.form.get('title');
  }

  get companyName() {
    return this.form.get('companyName');
  }

  get location() {
    return this.form.get('location');
  }

  get jobType() {
    return this.form.get('jobType');
  }

  get skillTags() {
    return this.form.get('skillTags');
  }

  get description() {
    return this.form.get('description');
  }

  get applyLink() {
    return this.form.get('applyLink');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const raw = this.form.getRawValue();
    const jobType = this.toJobType(raw.jobType);
    const payload: JobCreateRequest = {
      title: raw.title,
      companyName: raw.companyName,
      location: raw.location,
      jobType,
      skillTags: raw.skillTags,
      description: raw.description,
      applyLink: raw.applyLink,
      expiryDate: raw.expiryDate ? (raw.expiryDate as Date).toISOString() : null
    };

    this.jobService.postJob(payload).subscribe({
      next: () => {
        this.snackBar.open('Job published successfully!', 'Close', { duration: 3500 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.snackBar.open('Unable to publish job. Please try again.', 'Close', { duration: 3500 });
      }
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }

  private toJobType(value: unknown): JobCreateRequest['jobType'] {
    if (value === 'FullTime' || value === 'Internship' || value === 'Contract') {
      return value;
    }

    return 'FullTime';
  }
}
