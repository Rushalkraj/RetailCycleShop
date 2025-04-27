// payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:5104/api/cashfree';

  constructor(private http: HttpClient) { }

  createCashfreeOrder(orderId: number, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-order`, { orderId, amount });
  }

  verifyPayment(paymentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-payment`, paymentData);
  }

  redirectToCashfree(paymentLink: string): void {
    window.location.href = paymentLink;
  }
}