import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SiteStats {
  activeJobs: number;
  interviewStories: number;
  practiceQuestions: number;
  expertBlogs: number;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private readonly http: HttpClient) {}

  getStats(): Observable<SiteStats> {
    return this.http.get<SiteStats>(`${environment.apiBaseUrl}/stats`);
  }
}
