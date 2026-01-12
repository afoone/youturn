import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service } from '../models/service.model';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private apiUrl = 'http://localhost:3100/api/services'; // Cambia la URL a tu API real

  constructor(private http: HttpClient) {}

  getServices(ticketPointId?: string): Observable<Service[]> {
    let params = new HttpParams();
    if (ticketPointId) {
      params = params.set('ticketPointId', ticketPointId);
    }
    return this.http.get<Service[]>(this.apiUrl, { params });
  }

  createService(service: Service): Observable<Service> {
    return this.http.post<Service>(this.apiUrl, service);
  }

  updateService(service: Service): Observable<Service> {
    console.log('Updating service:', service);
    return this.http.put<Service>(`${this.apiUrl}/${service._id}`, service);
  }

  deleteService(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getServiceById(id: string): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}`);
  }
}
