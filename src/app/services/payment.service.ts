// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { Payment } from '../models/payment.model';

// @Injectable({
//   providedIn: 'root'
// })
// export class PaymentService {
//   private apiUrl = 'http://localhost:5104/api/payment/customer';

//   constructor(private http: HttpClient) { }

//   createPayment(paymentData: { paymentMethod: string; amount: number }): Observable<Payment> {
//     return this.http.post<Payment>(this.apiUrl, {
//       PaymentMethod: paymentData.paymentMethod,
//       Amount: paymentData.amount
//     });
//   }

//   getPayment(paymentId: number): Observable<Payment> {
//     return this.http.get<Payment>(`${this.apiUrl}/${paymentId}`);
//   }
// }