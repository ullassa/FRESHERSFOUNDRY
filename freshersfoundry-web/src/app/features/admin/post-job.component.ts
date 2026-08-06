import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CardComponent } from '../../shared/components/card.component';
import { AuthService } from '../../core/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-post-job',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent],
  template: `
    <app-card>
      <h2>Post a Job</h2>

      <form [formGroup]="form" (ngSubmit)="submit()" class="form">
        <label>Title<input formControlName="title" /></label>
        <label>Company<input formControlName="companyName" /></label>
        <label>Location<input formControlName="location" /></label>
        <label>Company Logo URL<input formControlName="companyLogoUrl" /></label>
        <label>Experience Level<input formControlName="experienceLevel" /></label>
        <label>Salary Range<input formControlName="salaryRange" /></label>
        <label>Type
          <select formControlName="jobType">
            <option value="FullTime">Full-time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>
        </label>
        <label>Skills<input formControlName="skillTags" placeholder="C#, SQL" /></label>
        <label>Apply Link<input formControlName="applyLink" /></label>
        <label>Description<textarea formControlName="description"></textarea></label>

        <div style="display:flex;gap:.5rem;margin-top:.5rem;">
          <button type="submit" [disabled]="form.invalid || isSubmitting()">{{ isSubmitting() ? 'Posting…' : 'Post Job' }}</button>
          <button type="button" (click)="cancel()">Cancel</button>
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
}
