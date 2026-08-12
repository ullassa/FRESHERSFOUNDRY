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
import { JobCreateRequest, JobService } from '../../../jobs/job.service';

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
  templateUrl: './post-job-dialog.component.html',
  styleUrls: ['./post-job-dialog.component.css']
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
