import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plan } from '../models/plan.model';

@Injectable({
  providedIn: 'root',
})
export class PlanService {
  private apiUrl = 'http://localhost:3100/api/plans';

  constructor(private http: HttpClient) {}

  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(this.apiUrl);
  }

  getPlanById(id: string): Observable<Plan> {
    return this.http.get<Plan>(`${this.apiUrl}/${id}`);
  }

  createPlan(plan: Partial<Plan>): Observable<Plan> {
    return this.http.post<Plan>(this.apiUrl, plan);
  }

  updatePlan(id: string, plan: Partial<Plan>): Observable<Plan> {
    return this.http.put<Plan>(`${this.apiUrl}/${id}`, plan);
  }

  deletePlan(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

