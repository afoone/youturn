import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TicketPoint } from '../models/ticket-point.model';

@Injectable({
  providedIn: 'root',
})
export class TicketPointService {
  private apiUrl = 'http://localhost:3100/api/ticket-points';

  constructor(private http: HttpClient) {}

  getTicketPoints(): Observable<TicketPoint[]> {
    return this.http.get<TicketPoint[]>(this.apiUrl);
  }

  getTicketPointById(id: string): Observable<TicketPoint> {
    return this.http.get<TicketPoint>(`${this.apiUrl}/${id}`);
  }

  createTicketPoint(ticketPoint: Partial<TicketPoint>): Observable<TicketPoint> {
    return this.http.post<TicketPoint>(this.apiUrl, ticketPoint);
  }

  updateTicketPoint(id: string, ticketPoint: Partial<TicketPoint>): Observable<TicketPoint> {
    return this.http.put<TicketPoint>(`${this.apiUrl}/${id}`, ticketPoint);
  }

  deleteTicketPoint(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

