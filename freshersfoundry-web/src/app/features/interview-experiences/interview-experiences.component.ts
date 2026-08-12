import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-interview-experiences',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, DatePipe],
  template: `
    <section class="page-wrap">
      <header class="topbar">
        <div>
          <h2>Interview Experiences</h2>
          <p>Read verified stories from recent candidates and share your own interview journey.</p>
        </div>
        <button type="button" class="primary-btn" routerLink="/interview-experiences/new">Share your experience</button>
      </header>

      <form *ngIf="showForm()" [formGroup]="form" (ngSubmit)="submit()" class="form-card">
        <h3>New story</h3>

        <div class="field-grid">
          <label>
            <span>Company</span>
            <input formControlName="companyName" placeholder="Example: Microsoft" />
            <small class="error-text" *ngIf="form.get('companyName')?.touched && form.get('companyName')?.hasError('required')">Company is required.</small>
          </label>

          <label>
            <span>Role</span>
            <input formControlName="roleAppliedFor" placeholder="Frontend Developer" />
            <small class="error-text" *ngIf="form.get('roleAppliedFor')?.touched && form.get('roleAppliedFor')?.hasError('required')">Role is required.</small>
          </label>

          <label>
            <span>Interviews / rounds</span>
            <input formControlName="interviewRounds" placeholder="3 rounds" />
          </label>

          <label>
            <span>Difficulty</span>
            <select formControlName="difficulty">
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </label>

          <label>
            <span>Result</span>
            <select formControlName="result">
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
              <option value="Pending">Pending</option>
            </select>
          </label>

          <label class="checkbox-row">
            <input type="checkbox" formControlName="isAnonymous" />
            <span>Submit anonymously</span>
          </label>
        </div>

        <label>
          <span>Experience content</span>
          <textarea formControlName="content" rows="8" placeholder="Describe the rounds, questions, preparation, and outcome."></textarea>
          <small class="error-text" *ngIf="form.get('content')?.touched && form.get('content')?.hasError('required')">Experience content is required.</small>
        </label>

        <div class="submit-row">
          <button type="submit" class="primary-btn" [disabled]="submitting()">
            {{ submitting() ? 'Submitting...' : 'Submit story' }}
          </button>
          <button type="button" class="secondary-btn" (click)="cancelForm()">Cancel</button>
        </div>

        <div class="form-message success" *ngIf="successMessage()">{{ successMessage() }}</div>
        <div class="form-message error" *ngIf="formError()">{{ formError() }}</div>
      </form>

      <div class="filters" *ngIf="!showForm()">
        <label class="search-field">
          <span>Search</span>
          <input [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Search by company or role" />
        </label>
        <div class="chip-row">
          <button type="button" class="tag-btn" [class.active]="selectedDifficulty === ''" (click)="selectedDifficulty = ''">All</button>
          <button type="button" class="tag-btn" [class.active]="selectedDifficulty === 'Easy'" (click)="selectedDifficulty = selectedDifficulty === 'Easy' ? '' : 'Easy'">Easy</button>
          <button type="button" class="tag-btn" [class.active]="selectedDifficulty === 'Medium'" (click)="selectedDifficulty = selectedDifficulty === 'Medium' ? '' : 'Medium'">Medium</button>
          <button type="button" class="tag-btn" [class.active]="selectedDifficulty === 'Hard'" (click)="selectedDifficulty = selectedDifficulty === 'Hard' ? '' : 'Hard'">Hard</button>
        </div>
      </div>

      <div *ngIf="loading()" class="state-card">Loading experiences...</div>
      <div *ngIf="!loading() && error()" class="state-card error">{{ error() }}</div>

      <div class="experience-grid" *ngIf="!loading() && !error() && filteredItems().length > 0">
        <article class="experience-card" *ngFor="let item of filteredItems()" [routerLink]="['/interview-experiences', item.id]">
          <div class="top-row">
            <div>
              <h3>{{ item.companyName }}</h3>
              <p>{{ item.roleAppliedFor }}</p>
            </div>
            <span class="difficulty-badge">{{ item.difficulty }}</span>
          </div>
          <div class="meta-row">
            <span>{{ item.interviewRounds || 'Rounds not specified' }}</span>
            <span>•</span>
            <span>{{ item.createdAt | date:'mediumDate' }}</span>
          </div>
          <p class="excerpt">{{ getExcerpt(item.content) }}</p>
          <div class="result-row">
            <span>{{ item.result || 'Pending' }}</span>
            <span>{{ item.isAnonymous ? 'Anonymous' : 'Public' }}</span>
          </div>
        </article>
      </div>

      <div *ngIf="!loading() && !error() && filteredItems().length === 0" class="state-card empty">
        No interview experiences match these filters.
      </div>
    </section>
  `,
  styles: [`
    .page-wrap { display: grid; gap: 1.25rem; }
    .topbar { display: flex; justify-content: space-between; align-items: end; gap: 1rem; }
    .topbar p { color: var(--ff-muted); margin: 0.25rem 0 0; }
    .primary-btn, .secondary-btn { border: none; border-radius: 999px; padding: 0.75rem 1rem; font-weight: 600; cursor: pointer; }
    .primary-btn { background: linear-gradient(135deg, #0ea5e9, #2563eb); color: #fff; }
    .secondary-btn { background: #fff; color: var(--ff-text); border: 1px solid var(--ff-border); }
    .form-card, .filters { background: rgba(255,255,255,0.82); border: 1px solid var(--ff-border); border-radius: 1rem; padding: 1.25rem; display: grid; gap: 1rem; }
    .field-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
    label { display: grid; gap: 0.35rem; color: var(--ff-muted); }
    input, select, textarea { width: 100%; border: 1px solid var(--ff-border); border-radius: 0.8rem; padding: 0.8rem 0.9rem; background: #fff; }
    textarea { resize: vertical; }
    .checkbox-row { display: flex; align-items: center; gap: 0.5rem; }
    .checkbox-row input { width: auto; }
    .submit-row { display: flex; flex-wrap: wrap; gap: 0.75rem; }
    .error-text, .form-message.error { color: var(--ff-danger); }
    .form-message.success { color: var(--ff-success); }
    .filters { display: grid; gap: 1rem; }
    .search-field { display: grid; gap: 0.35rem; }
    .chip-row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .tag-btn { border: 1px solid var(--ff-border); background: #fff; border-radius: 999px; padding: 0.45rem 0.8rem; cursor: pointer; }
    .tag-btn.active { background: rgba(56,189,248,0.12); border-color: rgba(56,189,248,0.5); }
    .experience-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
    .experience-card { background: rgba(255,255,255,0.82); border: 1px solid var(--ff-border); border-radius: 1rem; padding: 1rem; display: grid; gap: 0.8rem; cursor: pointer; }
    .top-row { display: flex; justify-content: space-between; gap: 0.75rem; align-items: start; }
    .top-row h3 { margin: 0; }
    .top-row p { margin: 0.35rem 0 0; color: var(--ff-muted); }
    .difficulty-badge { background: rgba(14,165,233,0.1); color: #0f172a; border: 1px solid rgba(14,165,233,0.2); border-radius: 999px; padding: 0.3rem 0.6rem; font-size: 0.8rem; }
    .meta-row, .result-row { display: flex; flex-wrap: wrap; gap: 0.5rem; color: var(--ff-muted); font-size: 0.82rem; }
    .excerpt { margin: 0; line-height: 1.6; color: rgba(15,23,42,0.75); }
    .state-card { background: rgba(255,255,255,0.82); border: 1px solid var(--ff-border); border-radius: 1rem; padding: 2rem; text-align: center; }
    .state-card.error { color: var(--ff-danger); }
    @media (max-width: 640px) { .topbar { flex-direction: column; align-items: flex-start; } }
  `]
})
export class InterviewExperiencesComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.nonNullable.group({
    companyName: ['', [Validators.required]],
    roleAppliedFor: ['', [Validators.required]],
    interviewRounds: [''],
    difficulty: ['Medium', [Validators.required]],
    result: ['Pending', [Validators.required]],
    content: ['', [Validators.required]],
    isAnonymous: [false]
  });

  readonly items = signal<any[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly successMessage = signal('');
  readonly formError = signal('');
  readonly showForm = signal(false);
  searchTerm = '';
  selectedDifficulty = '';

  readonly filteredItems = computed(() => {
    const query = this.searchTerm.trim().toLowerCase();
    const difficulty = this.selectedDifficulty.trim();

    return this.items().filter((item) => {
      const summary = `${item.companyName || ''} ${item.roleAppliedFor || ''} ${item.content || ''}`.toLowerCase();
      const matchesQuery = !query || summary.includes(query);
      const matchesDifficulty = !difficulty || item.difficulty === difficulty;
      return matchesQuery && matchesDifficulty;
    });
  });

  ngOnInit(): void {
    this.load();
    const mode = this.route.snapshot.paramMap.get('id');
    const isNewRoute = this.router.url.endsWith('/new');
    if (isNewRoute || mode === 'new') {
      if (!this.auth.isAuthenticated() || !this.auth.isAdmin()) {
        this.showForm.set(false);
        this.error.set('Admin access is required to submit an interview experience.');
        return;
      }
      this.showForm.set(true);
    }
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get(`${environment.apiBaseUrl}/interview-experiences`).subscribe({
      next: (response: any) => {
        this.items.set(response?.items || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Unable to load interview experiences right now.');
      }
    });
  }

  applyFilters(): void {
    // filter state is bound directly to class properties and evaluated in computed values.
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.form.reset({
      companyName: '',
      roleAppliedFor: '',
      interviewRounds: '',
      difficulty: 'Medium',
      result: 'Pending',
      content: '',
      isAnonymous: false
    });
    this.formError.set('');
    this.successMessage.set('');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError.set('Please fill in the required fields.');
      return;
    }

    if (!this.auth.isAuthenticated() || !this.auth.isAdmin()) {
      this.formError.set('Admin access is required to submit an interview experience.');
      this.router.navigateByUrl('/auth/login');
      return;
    }

    this.submitting.set(true);
    this.formError.set('');
    this.successMessage.set('');

    const token = this.auth.getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const payload = { ...this.form.getRawValue() };

    this.http.post(`${environment.apiBaseUrl}/interview-experiences`, payload, headers ? { headers: { Authorization: `Bearer ${token}` } } : undefined).subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMessage.set('Your interview experience was submitted successfully.');
        this.cancelForm();
        this.load();
      },
      error: () => {
        this.submitting.set(false);
        this.formError.set('The experience could not be submitted. Please try again.');
      }
    });
  }

  getExcerpt(content: string): string {
    const plain = (content || '').replace(/[#>*_`\-]/g, '').replace(/\s+/g, ' ').trim();
    return plain.length > 160 ? `${plain.slice(0, 157).trim()}...` : plain;
  }
}

