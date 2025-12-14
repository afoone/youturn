import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Enterprise } from '../models/enterprise.model';

@Injectable({
  providedIn: 'root',
})
export class EnterpriseService {
  private apiUrl = 'http://localhost:3100/api/enterprises'; // Cambia la URL a tu API real

  constructor(private http: HttpClient) {}

  getEnterprises(): Observable<Enterprise[]> {
    return this.http.get<Enterprise[]>(this.apiUrl);
  }

  createEnterprise(enterprise: Omit<Enterprise, '_id'>): Observable<Enterprise> {
    return this.http.post<Enterprise>(this.apiUrl, enterprise);
  }

  updateEnterprise(enterprise: Enterprise): Observable<Enterprise> {
    return this.http.put<Enterprise>(
      `${this.apiUrl}/${enterprise._id}`,
      enterprise
    );
  }

  deleteEnterprise(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getEnterpriseById(id: string): Observable<Enterprise> {
    return this.http.get<Enterprise>(`${this.apiUrl}/${id}`);
  }
}
