import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface JobCreateRequest {
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  location: string;
  jobType: 'FullTime' | 'Internship' | 'Contract';
  experienceLevel?: string;
  salaryRange?: string;
  skillTags: string;
  description: string;
  applyLink: string;
  expiryDate?: string | null;
}

export interface JobItem {
  id: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  location: string;
  jobType: string;
  experienceLevel?: string;
  salaryRange?: string;
  skillTags: string;
  description: string;
  applyLink: string;
  expiryDate?: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class JobService {
  constructor(private readonly http: HttpClient) {}

  getApprovedJobs(): Observable<{ items: JobItem[] }> {
    return this.http.get<{ items: JobItem[] }>(`${environment.apiBaseUrl}/jobs`);
  }

  postJob(payload: JobCreateRequest): Observable<JobItem> {
    return this.http.post<JobItem>(`${environment.apiBaseUrl}/jobs`, payload);
  }
}
