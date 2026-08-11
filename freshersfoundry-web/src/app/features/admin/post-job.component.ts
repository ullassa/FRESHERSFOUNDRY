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
  templateUrl: './post-job.component.html'
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
