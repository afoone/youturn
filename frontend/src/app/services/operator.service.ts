import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Operator } from '../models/operator.type';
import { Customer } from '../models/customer.type';

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
    return this.http.put<Operator>(`${this.apiUrl}/${operator._id}`, operator);
  }

  deleteOperator(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getOperatorById(id: string): Observable<Operator> {
    return this.http.get<Operator>(`${this.apiUrl}/${id}`);
  }

  nextCustomer(operatorId: string): Observable<any> {
    return this.http.post<Customer>(
      `${this.apiUrl}/${operatorId}/next-customer`,
      {}
    );
  }

  attendCustomer(customerId: string): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/${customerId}/attend`, {});
  }

  completeService(customerId: string): Observable<Customer> {
    return this.http.post<Customer>(
      `${this.apiUrl}/${customerId}/complete`,
      {}
    );
  }

  waitingRoom(
    operatorId: string
  ): Observable<{ label: string; count: number }[]> {
    return this.http.post<{ label: string; count: number }[]>(
      `${this.apiUrl}/${operatorId}/waiting-room`,
      {}
    );
  }

  getInServiceCustomer(operatorId: string): Observable<Customer | undefined> {
    // Aquí puedes agregar la lógica para obtener el cliente en servicio
    return this.http.get<Customer | undefined>(
      `${this.apiUrl}/${operatorId}/in-service-customer`
    );
  }
}
