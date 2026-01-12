import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QueueService {
  private apiUrl = 'http://localhost:3100/api/queue'; // Cambia la URL a tu API real

  constructor(private _http: HttpClient) {}

  addToQueue(serviceId: string, ticketPointId?: string): Observable<any> {
    const body = ticketPointId ? { ticketPointId } : {};
    return this._http.post(`${this.apiUrl}/${serviceId}/enqueue`, body);
  }
}
