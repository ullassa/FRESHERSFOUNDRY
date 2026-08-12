import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MarkdownRendererComponent } from '../../shared/components/markdown-renderer.component';

@Component({
  selector: 'app-question-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MarkdownRendererComponent],
  template: `
    <article class="page-wrap" *ngIf="!loading() && question(); else loadingTpl">
      <header class="header">
        <div class="eyebrow">Question</div>
        <h2>{{ question()?.question }}</h2>
        <div class="meta-row">
          <span>{{ question()?.category }}</span>
          <span>•</span>
          <span>{{ question()?.subTopic || 'General' }}</span>
          <span>•</span>
          <span>{{ question()?.difficultyLevel || question()?.difficulty }}</span>
        </div>
      </header>

      <div class="answer-card">
        <h3>Answer</h3>
        <app-markdown-renderer [markdown]="question()?.answer || ''"></app-markdown-renderer>
        <pre *ngIf="question()?.codeSnippet" class="code-block"><code>{{ question()?.codeSnippet }}</code></pre>
      </div>
    </article>

    <ng-template #loadingTpl>
      <div class="state-card">Loading question...</div>
    </ng-template>
  `,
  styles: [`
    .page-wrap { max-width: 900px; margin: 0 auto; display: grid; gap: 1.25rem; }
    .header { display: grid; gap: 0.5rem; }
    .eyebrow { color: #0f766e; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.72rem; }
    .meta-row { display: flex; flex-wrap: wrap; gap: 0.5rem; color: var(--ff-muted); }
    .answer-card { background: rgba(255,255,255,0.8); border: 1px solid var(--ff-border); border-radius: 1rem; padding: 1.25rem; display: grid; gap: 1rem; }
    .code-block { background: #0f172a; color: #e2e8f0; border-radius: 0.8rem; padding: 1rem; overflow-x: auto; }
    .state-card { background: rgba(255,255,255,0.8); border: 1px solid var(--ff-border); border-radius: 1rem; padding: 2rem; text-align: center; }
  `]
})
export class QuestionDetailComponent {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  readonly question = signal<any | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }

    this.http.get(`${environment.apiBaseUrl}/interview-questions/${id}`).subscribe({
      next: (item: any) => {
        this.question.set(item);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
