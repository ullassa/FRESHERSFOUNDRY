import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CardComponent } from '../../../../shared/components/card.component';
import { AuthService } from '../../../../core/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-post-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule],
  templateUrl: './post-job.component.html',
  styles: [`
    .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-grid { display: grid; gap: 1rem; }
    .span-2 { grid-column: 1 / -1; }
    .actions { display: flex; gap: 1rem; margin-top: 1rem; }
    
    .logo-upload-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .logo-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #666;
    }
    
    .logo-upload-box {
      position: relative;
      border: 2px dashed #ddd;
      border-radius: 0.6rem;
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1;
      background: #f9f9f9;
      overflow: hidden;
      transition: all 0.2s ease;
    }
    
    .logo-upload-box:hover {
      border-color: #4f46e5;
      background: #f0f0ff;
    }
    
    .logo-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: #999;
      font-size: 0.875rem;
    }
    
    .logo-placeholder mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: #bbb;
    }
    
    .logo-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .upload-btn, .clear-btn {
      position: absolute;
      bottom: 0.5rem;
      right: 0.5rem;
      background: #4f46e5 !important;
      color: white !important;
    }
    
    .clear-btn {
      background: #ef4444 !important;
    }
  `]
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
    applyLink: ['', [Validators.required, Validators.pattern('https?://.+')]]
  });

  readonly isSubmitting = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly logoPreview = signal<string | null>(null);

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

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      this.form.patchValue({ companyLogoUrl: base64 });
      this.logoPreview.set(base64);
    };
    reader.readAsDataURL(file);
  }

  clearLogo(): void {
    this.form.patchValue({ companyLogoUrl: '' });
    this.logoPreview.set(null);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) input.value = '';
  }

  private toJobType(value: unknown): 'FullTime' | 'Internship' | 'Contract' {
    if (value === 'Internship' || value === 'Contract') {
      return value;
    }

    return 'FullTime';
  }
}
