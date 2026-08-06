import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/card.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <app-card>
      <h2>Jobs</h2>
      <div *ngIf="loading()">Loading…</div>
      <ul *ngIf="!loading()">
        <li *ngFor="let j of items()">
          <strong>{{ j.title }}</strong> — {{ j.companyName }} ({{ j.location }})
          <span *ngIf="isAdmin()"> — <a (click)="edit(j.id)">Edit</a> <a (click)="delete(j.id)">Delete</a></span>
        </li>
      </ul>
    </app-card>
  `
})
export class JobsComponent {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly items = signal<any[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.http.get(`${environment.apiBaseUrl}/jobs`).subscribe({ next: (res: any) => { this.items.set(res.items || []); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  isAdmin(): boolean { return this.auth.isAdmin(); }

  edit(id: string) { this.router.navigateByUrl(`/admin/post-job/${id}`); }

  delete(id: string) { if (!confirm('Delete this job?')) return; this.http.delete(`${environment.apiBaseUrl}/jobs/${id}`).subscribe(() => this.load()); }
}
