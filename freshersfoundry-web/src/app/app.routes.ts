import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { JobsComponent } from './features/jobs/jobs.component';
import { BlogsComponent } from './features/blogs/blogs.component';
import { InterviewExperiencesComponent } from './features/interview-experiences/interview-experiences.component';
import { InterviewQuestionsComponent } from './features/interview-questions/interview-questions.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { ApplyCreatorComponent } from './features/auth/apply-creator.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { PostJobComponent } from './features/admin/post-job.component';
import { PostInterviewQuestionComponent } from './features/admin/post-interview-question.component';
import { PendingApprovalsComponent } from './features/admin/pending-approvals.component';
import { AdManagerComponent } from './features/admin/ad-manager.component';
import { roleGuard } from './core/role.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'jobs', component: JobsComponent },
  { path: 'blogs', component: BlogsComponent },
  { path: 'interview-experiences', component: InterviewExperiencesComponent },
  { path: 'interview-questions', component: InterviewQuestionsComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/apply-creator', component: ApplyCreatorComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [roleGuard] },
  { path: 'admin/post-job', component: PostJobComponent, canActivate: [roleGuard] },
  { path: 'admin/post-job/:id', component: PostJobComponent, canActivate: [roleGuard] },
  { path: 'admin/post-question', component: PostInterviewQuestionComponent, canActivate: [roleGuard] },
  { path: 'admin/post-question/:id', component: PostInterviewQuestionComponent, canActivate: [roleGuard] },
  { path: 'admin/pending-approvals', component: PendingApprovalsComponent, canActivate: [roleGuard] },
  { path: 'admin/ads', component: AdManagerComponent, canActivate: [roleGuard] },
  { path: '**', redirectTo: '' }
];
