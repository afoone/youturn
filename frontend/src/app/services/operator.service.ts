import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Operator } from '../models/operator.type';

@Injectable({
  providedIn: 'root',
})
export class OperatorService {
  private apiUrl = 'http://localhost:3100/api/operators'; // Cambia la URL a tu API real

  constructor(private http: HttpClient) {}

  getOperators(): Observable<Operator[]> {
    return this.http.get<Operator[]>(this.apiUrl);
  }

  createOperator(operator: Operator): Observable<Operator> {
    return this.http.post<Operator>(this.apiUrl, operator);
  }

  updateOperator(operator: Operator): Observable<Operator> {
    return this.http.put<Operator>(
      `${this.apiUrl}/${operator._id}`,
      operator
    );
  }

  deleteOperator(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getOperatorById(id: string): Observable<Operator> {
    return this.http.get<Operator>(`${this.apiUrl}/${id}`);
  }

  nextCustomer(operatorId: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${operatorId}/next-customer`,
      {}
    );
  }
}
