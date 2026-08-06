import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CardComponent } from '../../shared/components/card.component';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-interview-questions',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <app-card>
      <h2>Interview Questions</h2>

      <div *ngIf="loading()">Loading…</div>
      <ul *ngIf="!loading()">
        <li *ngFor="let q of items()">
          <strong>{{ q.category }}</strong> — {{ q.question }}
          <span *ngIf="isAdmin()"> — <a (click)="edit(q.id)">Edit</a> <a (click)="delete(q.id)">Delete</a></span>
        </li>
      </ul>
    </app-card>
  `
})
export class InterviewQuestionsComponent {
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
    this.http.get(`${environment.apiBaseUrl}/interview-questions`).subscribe({ next: (res: any) => { this.items.set(res.items || []); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  edit(id: string) {
    this.router.navigateByUrl(`/admin/post-question/${id}`);
  }

  delete(id: string) {
    if (!confirm('Delete this question?')) return;
    this.http.delete(`${environment.apiBaseUrl}/interview-questions/${id}`).subscribe(() => this.load());
  }
}
