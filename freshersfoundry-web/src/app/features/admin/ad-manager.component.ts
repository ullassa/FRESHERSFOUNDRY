import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CardComponent } from '../../shared/components/card.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ad-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent],
  template: `
    <app-card>
      <h2>Ad Manager</h2>

      <form [formGroup]="form" (ngSubmit)="create()" style="display:flex;gap:.5rem;align-items:end;flex-wrap:wrap;">
        <label style="flex:1">Title<input formControlName="title" /></label>
        <label style="flex:1">Image URL<input formControlName="imageUrl" /></label>
        <label style="flex:1">Target URL<input formControlName="targetUrl" /></label>
        <label style="flex:1">Start<input type="date" formControlName="startDate" /></label>
        <label style="flex:1">End<input type="date" formControlName="endDate" /></label>
        <button type="submit" [disabled]="form.invalid || creating">Create</button>
      </form>

      <hr />

      <div *ngIf="loading()">Loading…</div>
      <ul *ngIf="!loading()">
        <li *ngFor="let a of ads()">{{ a.title }} — Active: {{ a.isActive }} — <button (click)="toggle(a.id)">Toggle</button> <button (click)="delete(a.id)">Delete</button></li>
      </ul>
    </app-card>
  `
})
export class AdManagerComponent {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);

  readonly ads = signal<any[]>([]);
  readonly loading = signal(true);
  readonly creating = false;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    imageUrl: [''],
    targetUrl: [''],
    startDate: [''],
    endDate: ['']
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.http.get(`${environment.apiBaseUrl}/admin/ads`).subscribe({ next: (res: any) => { this.ads.set(res.ads || []); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  create(): void {
    if (this.form.invalid) return;
    const payload = { ...this.form.getRawValue(), startDate: this.form.value.startDate, endDate: this.form.value.endDate };
    this.http.post(`${environment.apiBaseUrl}/admin/ads`, payload).subscribe({ next: () => this.load() });
  }

  toggle(id: string) {
    this.http.put(`${environment.apiBaseUrl}/admin/ads/${id}/toggle`, {}).subscribe(() => this.load());
  }

  delete(id: string) {
    this.http.delete(`${environment.apiBaseUrl}/admin/ads/${id}`).subscribe(() => this.load());
  }
}
