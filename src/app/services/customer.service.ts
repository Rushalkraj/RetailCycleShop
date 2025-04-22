import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError, EMPTY } from 'rxjs';
import { Customer, CustomerCreateDto } from '../models/customer.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = 'http://localhost:5104/api/customer';

  constructor(
    private http: HttpClient,
    private authService: AuthService  // ✅ Inject AuthService
  ) { }

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}?includeAddresses=true`);
  }

  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}?includeAddresses=true`);
  }

  createCustomer(customerData: CustomerCreateDto): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/with-address`, {
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
      address: {
        ...customerData.shippingAddress,
        isDefaultShipping: customerData.shippingAddress.isDefaultShipping,
        isDefaultBilling: customerData.shippingAddress.isDefaultBilling
      }
    });
  }

  updateCustomer(id: number, customerData: any): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}/with-address`, customerData, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      catchError(error => {
        console.error('Detailed error:', error);
        return throwError(() => error);
      })
    );
  }

  deleteCustomer(customerId: number): Observable<void> {
    const userRole = this.authService.getUserRole();  // ✅ Get role from AuthService

    if (userRole === 'Admin') {
      return this.http.delete<void>(`${this.apiUrl}/${customerId}`);
    } else if (userRole === 'employee') {
      alert('You do not have permission to delete customers.');
      return EMPTY;
    } else {
      alert('Invalid user role.');
      return EMPTY;
    }
  }
}
