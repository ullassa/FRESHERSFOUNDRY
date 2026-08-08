import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CardComponent } from '../../shared/components/card.component';
import { AuthService } from '../../core/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-post-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <app-card>
      <div class="page-head">
        <p class="eyebrow">Admin publishing</p>
        <h2>Post a Job</h2>
        <p class="supporting-text">Use a clean outline form so fields stay readable across desktop and mobile.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
        <div class="two-column">
          <mat-form-field appearance="outline">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" />
            <mat-error *ngIf="form.get('title')?.hasError('required')">Title is required.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Company</mat-label>
            <input matInput formControlName="companyName" />
            <mat-error *ngIf="form.get('companyName')?.hasError('required')">Company is required.</mat-error>
          </mat-form-field>
        </div>

        <div class="two-column">
          <mat-form-field appearance="outline">
            <mat-label>Location</mat-label>
            <input matInput formControlName="location" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Job type</mat-label>
            <mat-select formControlName="jobType">
              <mat-option value="FullTime">Full-time</mat-option>
              <mat-option value="Internship">Internship</mat-option>
              <mat-option value="Contract">Contract</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('jobType')?.hasError('required')">Job type is required.</mat-error>
          </mat-form-field>
        </div>

        <div class="two-column">
          <mat-form-field appearance="outline">
            <mat-label>Experience level</mat-label>
            <input matInput formControlName="experienceLevel" placeholder="0-2 years" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Salary range</mat-label>
            <input matInput formControlName="salaryRange" placeholder="6-10 LPA" />
          </mat-form-field>
        </div>

        <div class="two-column">
          <mat-form-field appearance="outline">
            <mat-label>Company logo URL</mat-label>
            <input matInput formControlName="companyLogoUrl" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Apply link</mat-label>
            <input matInput formControlName="applyLink" placeholder="https://..." />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Skills</mat-label>
          <input matInput formControlName="skillTags" placeholder="Angular, TypeScript, SQL" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="span-2">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="4"></textarea>
          <mat-error *ngIf="form.get('description')?.hasError('required')">Description is required.</mat-error>
        </mat-form-field>

        <div class="actions">
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || isSubmitting()">
            {{ isSubmitting() ? 'Posting…' : 'Post Job' }}
          </button>
          <button mat-button type="button" (click)="cancel()">Cancel</button>
        </div>
      </form>
    </app-card>
  `
})
export class PostJobComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    companyName: ['', [Validators.required]],
    companyLogoUrl: [''],
    location: [''],
    experienceLevel: [''],
    salaryRange: [''],
    jobType: ['FullTime', [Validators.required]],
    skillTags: [''],
    description: [''],
    applyLink: ['']
  });

  readonly isSubmitting = signal(false);
  readonly editingId = signal<string | null>(null);

  get title() {
    return this.form.get('title');
  }

  get companyName() {
    return this.form.get('companyName');
  }

  get jobType() {
    return this.form.get('jobType');
  }

  get description() {
    return this.form.get('description');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const token = this.auth.getToken();
    if (!token) {
      this.router.navigateByUrl('/auth/login');
      return;
    }

    this.isSubmitting.set(true);

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const payload = this.form.getRawValue();

    const req$ = this.editingId() ? this.http.put(`${environment.apiBaseUrl}/jobs/${this.editingId()}`, payload, { headers }) : this.http.post(`${environment.apiBaseUrl}/jobs`, payload, { headers });

    req$.subscribe({ next: () => this.router.navigateByUrl('/admin'), error: () => this.isSubmitting.set(false) });
  }

  cancel(): void {
    this.router.navigateByUrl('/admin');
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editingId.set(id);
      this.http.get(`${environment.apiBaseUrl}/jobs/${id}`).subscribe({ next: (res: any) => {
        this.form.patchValue({
          title: res.title,
          companyName: res.companyName,
          companyLogoUrl: res.companyLogoUrl,
          location: res.location,
          jobType: res.jobType,
          experienceLevel: res.experienceLevel,
          salaryRange: res.salaryRange,
          skillTags: res.skillTags,
          description: res.description,
          applyLink: res.applyLink
        });
      } });
    }
  }

  private toJobType(value: unknown): 'FullTime' | 'Internship' | 'Contract' {
    if (value === 'Internship' || value === 'Contract') {
      return value;
    }

    return 'FullTime';
  }
}
