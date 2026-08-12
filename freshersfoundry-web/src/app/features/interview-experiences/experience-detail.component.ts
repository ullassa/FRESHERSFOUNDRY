import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MarkdownRendererComponent } from '../../shared/components/markdown-renderer.component';

@Component({
  selector: 'app-experience-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MarkdownRendererComponent, DatePipe],
  template: `
    <article class="page-wrap" *ngIf="!loading() && experience(); else loadingTpl">
      <header class="header">
        <div class="eyebrow">Interview experience</div>
        <h2>{{ experience()?.companyName }} · {{ experience()?.roleAppliedFor }}</h2>
        <div class="meta-row">
          <span>{{ experience()?.location || 'Location not listed' }}</span>
          <span>•</span>
          <span>{{ experience()?.createdAt | date:'mediumDate' }}</span>
        </div>
      </header>

      <div class="detail-card">
        <div class="chips" *ngIf="tags().length">
          <span class="chip" *ngFor="let tag of tags()">{{ tag }}</span>
        </div>
        <div class="facts">
          <span><strong>Difficulty:</strong> {{ experience()?.difficulty }}</span>
          <span><strong>Interview result:</strong> {{ experience()?.result || 'Pending' }}</span>
          <span><strong>Anonymous:</strong> {{ experience()?.isAnonymous ? 'Yes' : 'No' }}</span>
        </div>
        <app-markdown-renderer [markdown]="experience()?.content || ''"></app-markdown-renderer>
      </div>
    </article>

    <ng-template #loadingTpl>
      <div class="state-card">Loading experience...</div>
    </ng-template>
  `,
  styles: [`
    .page-wrap { max-width: 900px; margin: 0 auto; display: grid; gap: 1.25rem; }
    .header { display: grid; gap: 0.5rem; }
    .eyebrow { color: #0f766e; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.72rem; }
    .meta-row, .chips, .facts { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; color: var(--ff-muted); }
    .detail-card { background: rgba(255,255,255,0.8); border: 1px solid var(--ff-border); border-radius: 1rem; padding: 1.25rem; display: grid; gap: 1rem; }
    .chip { background: rgba(56, 189, 248, 0.08); border: 1px solid var(--ff-border); border-radius: 999px; padding: 0.35rem 0.75rem; font-size: 0.8rem; }
    .facts { font-size: 0.92rem; }
    .state-card { background: rgba(255,255,255,0.8); border: 1px solid var(--ff-border); border-radius: 1rem; padding: 2rem; text-align: center; }
  `]
})
export class InterviewExperienceDetailComponent {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  readonly experience = signal<any | null>(null);
  readonly loading = signal(true);
  readonly tags = signal<string[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }

    this.http.get(`${environment.apiBaseUrl}/interview-experiences/${id}`).subscribe({
      next: (item: any) => {
        this.experience.set(item);
        this.tags.set((item.tags || item.companyName || '').split(',').map((tag: string) => tag.trim()).filter(Boolean));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
