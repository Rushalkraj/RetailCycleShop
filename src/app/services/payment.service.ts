import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment, PaymentRequest, PaymentResponse } from '../models/payment.model';


@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:5104/api/payment/customer';

  constructor(private http: HttpClient) { }

  processPayment(data: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(this.apiUrl, data);
  }

  getPaymentMethods(): Observable<any> {
    return this.http.get(`${this.apiUrl}/methods`);
  }

}

 