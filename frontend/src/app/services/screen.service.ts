import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Screen } from '../models/screen.type';

@Injectable({
  providedIn: 'root',
})
export class ScreenService {
  private apiUrl = 'http://localhost:3100/api/screens'; // Cambia la URL a tu API real

  constructor(private http: HttpClient) {}

  getScreens(): Observable<Screen[]> {
    return this.http.get<Screen[]>(this.apiUrl);
  }

  createScreen(screen: Screen): Observable<Screen> {
    return this.http.post<Screen>(this.apiUrl, screen);
  }

  updateScreen(screen: Screen): Observable<Screen> {
    return this.http.put<Screen>(`${this.apiUrl}/${screen._id}`, screen);
  }

  deleteScreen(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getScreenById(id: string): Observable<Screen> {
    return this.http.get<Screen>(`${this.apiUrl}/${id}`);
  }

  getScreenCustomers(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/customers`);
  }
}
