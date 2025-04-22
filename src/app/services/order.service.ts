import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Order, OrderCreateDto } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:5104/api/order';

  constructor(private http: HttpClient) { }

  createOrder(order: OrderCreateDto): Observable<any> {
    console.log('Sending order data:', order);
    return this.http.post(`${this.apiUrl}/customer`, order, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      tap(response => console.log('Order creation response:', response)),
      catchError(error => {
        console.error('Full error:', error);
        let errorMessage = 'Failed to place order';
        if (error.error) {
          errorMessage = typeof error.error === 'string' 
            ? error.error 
            : error.error.message || error.error.title || errorMessage;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl).pipe(
      tap(orders => console.log('API Response:', orders)),
      catchError(error => {
        console.error('Error fetching orders:', error);
        return throwError(() => error);
      })
    );
  }
  updateOrderStatus(orderId: number, newStatus: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${orderId}/status`, { status: newStatus }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      catchError(error => {
        console.error('Status update error:', error);
        return throwError(() => error);
      })
    );
  }
  deleteOrder(orderId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${orderId}`);
  }
}