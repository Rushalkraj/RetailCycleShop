import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

declare var Razorpay: any;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:5104/api/razorpay';

  constructor(private http: HttpClient) { }

  createRazorpayOrder(orderId: number, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-order`, { orderId, amount });
  }

  verifyPayment(paymentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-payment`, paymentData);
  }

  openRazorpay(options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const rzp = new Razorpay(options);
      rzp.open();
      
      rzp.on('payment.success', (response: any) => {
        resolve(response);
      });
      
      rzp.on('payment.error', (error: any) => {
        reject(error);
      });
    });
  }
}