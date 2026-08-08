import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CardComponent } from '../../shared/components/card.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pending-approvals',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <app-card>
      <h2>Pending Approvals</h2>

      <div *ngIf="loading()">Loading…</div>

      <section *ngIf="!loading()">
        <h3>Interview Experiences ({{ pendingExperiences().length }})</h3>
        <ul>
          <li *ngFor="let e of pendingExperiences()">{{ e.title }} — <button (click)="approveExperience(e.id)">Approve</button></li>
        </ul>

        <h3>Blogs ({{ pendingBlogs().length }})</h3>
        <ul>
          <li *ngFor="let b of pendingBlogs()">{{ b.title }} — <button (click)="approveBlog(b.id)">Approve</button></li>
        </ul>

        <h3>Jobs ({{ pendingJobs().length }})</h3>
        <ul>
          <li *ngFor="let j of pendingJobs()">{{ j.title }} at {{ j.companyName }} — <button (click)="approveJob(j.id)">Approve</button></li>
        </ul>
      </section>
    </app-card>
  `
})
export class PendingApprovalsComponent {
  private readonly http = inject(HttpClient);

  readonly loading = signal(true);
  readonly pendingExperiences = signal<any[]>([]);
  readonly pendingBlogs = signal<any[]>([]);
  readonly pendingJobs = signal<any[]>([]);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.http.get(`${environment.apiBaseUrl}/admin/pending-content`).subscribe({
      next: (res: any) => {
        this.pendingExperiences.set(res.pendingExperiences || []);
        this.pendingBlogs.set(res.pendingBlogs || []);
        this.pendingJobs.set(res.pendingJobs || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  approveExperience(id: string) {
    this.http.put(`${environment.apiBaseUrl}/interview-experiences/${id}/approve`, {}).subscribe(() => this.load());
  }

  approveBlog(id: string) {
    this.http.put(`${environment.apiBaseUrl}/blogs/${id}/approve`, {}).subscribe(() => this.load());
  }

  approveJob(id: string) {
    this.http.put(`${environment.apiBaseUrl}/jobs/${id}/approve`, {}).subscribe(() => this.load());
  }
}
