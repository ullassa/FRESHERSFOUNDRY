import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { JobsComponent } from './features/jobs/jobs.component';
import { BlogsComponent } from './features/blogs/blogs.component';
import { BlogDetailComponent } from './features/blogs/blog-detail.component';
import { InterviewExperiencesComponent } from './features/interview-experiences/interview-experiences.component';
import { InterviewExperienceDetailComponent } from './features/interview-experiences/experience-detail.component';
import { InterviewQuestionsComponent } from './features/interview-questions/interview-questions.component';
import { QuestionDetailComponent } from './features/interview-questions/question-detail.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';
import { PostJobComponent } from './features/admin/forms/post-job/post-job.component';
import { PostBlogComponent } from './features/admin/forms/post-blog/post-blog.component';
import { PostInterviewQuestionComponent } from './features/admin/forms/post-question/post-interview-question.component';
import { PendingApprovalsComponent } from './features/admin/approvals/pending-approvals.component';
import { roleGuard } from './core/role.guard';
import { LegalPageComponent } from './features/legal/legal-page.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'jobs', component: JobsComponent },
  { path: 'blogs', component: BlogsComponent },
  { path: 'blogs/:id', component: BlogDetailComponent },
  { path: 'interview-experiences', component: InterviewExperiencesComponent },
  { path: 'interview-experiences/new', component: InterviewExperiencesComponent },
  { path: 'interview-experiences/:id', component: InterviewExperienceDetailComponent },
  { path: 'interview-questions', component: InterviewQuestionsComponent },
  { path: 'questions', component: InterviewQuestionsComponent },
  { path: 'interview-questions/:id', component: QuestionDetailComponent },
  { path: 'questions/:id', component: QuestionDetailComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'privacy-policy', component: LegalPageComponent, data: { type: 'privacy-policy' } },
  { path: 'terms-and-conditions', component: LegalPageComponent, data: { type: 'terms-conditions' } },
  { path: 'cookie-policy', component: LegalPageComponent, data: { type: 'cookie-policy' } },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [roleGuard] },
  { path: 'admin/post-job', component: PostJobComponent, canActivate: [roleGuard] },
  { path: 'admin/post-job/:id', component: PostJobComponent, canActivate: [roleGuard] },
  { path: 'admin/post-blog', component: PostBlogComponent, canActivate: [roleGuard] },
  { path: 'admin/post-blog/:id', component: PostBlogComponent, canActivate: [roleGuard] },
  { path: 'admin/post-question', component: PostInterviewQuestionComponent, canActivate: [roleGuard] },
  { path: 'admin/post-question/:id', component: PostInterviewQuestionComponent, canActivate: [roleGuard] },
  { path: 'admin/pending-approvals', component: PendingApprovalsComponent, canActivate: [roleGuard] },
  { path: '**', redirectTo: '' }
];
