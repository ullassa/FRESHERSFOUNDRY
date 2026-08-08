import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface AdminMetric {
  key: string;
  label: string;
  value: number | null;
  todayChange: string | null;
  icon: string;
  sectionId: string;
}

export interface AdminQuickAction {
  label: string;
  sectionId: string;
  variant: string;
}

export interface AdminActivityItem {
  title: string;
  subtitle: string;
  status: string;
  sectionId: string;
  createdAt: string;
}

export interface AdminActivityGroup {
  key: string;
  title: string;
  items: AdminActivityItem[];
  emptyState: string;
}

export interface AdminDashboardResponse {
  metrics: AdminMetric[];
  quickActions: AdminQuickAction[];
  recentActivity: AdminActivityGroup[];
}

export interface AdminSearchResult {
  type: string;
  title: string;
  subtitle: string;
  sectionId: string;
}

export interface AdminSearchResponse {
  query: string;
  results: AdminSearchResult[];
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeJobs: number;
  pendingJobs: number;
  pendingExperiences: number;
  totalQuestions: number;
}

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<AdminDashboardResponse> {
    return this.http.get<AdminDashboardResponse>(`${environment.apiBaseUrl}/admin/dashboard`);
  }

  getDashboardStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(`${environment.apiBaseUrl}/admin/dashboard-stats`);
  }

  search(query: string): Observable<AdminSearchResponse> {
    return this.http.get<AdminSearchResponse>(`${environment.apiBaseUrl}/admin/search`, {
      params: { query }
    });
  }
}