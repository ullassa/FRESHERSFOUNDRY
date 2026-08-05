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
  { path: '**', redirectTo: '' }
];
