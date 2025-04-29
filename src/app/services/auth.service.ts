import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5104/api/auth';
  private jwtHelper = new JwtHelperService();
  private redirectUrl: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        // const role = this.getUserRole();

        // if (role === 'Admin') this.router.navigate(['/admin/inventory']);
        // else if (role === 'Employee') this.router.navigate(['/employee/orders']);
        // else if (role === 'Customer') this.router.navigate(['/customer/orders']);
      })
    );
  }

  getUserRole(): string | null {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    }
    return null;
  }
  getCustomerId(): number | null {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = this.jwtHelper.decodeToken(token);
      console.log('Decoded token:', decoded);
      return decoded['customerId'] || decoded['nameidentifier'] || null;
    }
    return null;
  }

  getEmployeeId(): number | null {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = this.jwtHelper.decodeToken(token);
      return decoded['employeeId'] || null;
    }
    return null;
  }



  isAdmin(): boolean {
    return this.getUserRole() === 'Admin';
  }

  isEmployee(): boolean {
    return this.getUserRole() === 'Employee';
  }

  isCustomer(): boolean {
    return this.getUserRole() === 'Customer';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }
  register(registerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, registerData);
  }
  setRedirectUrl(url: string) {
    this.redirectUrl = url;
  }

  getRedirectUrl(): string | null {
    const temp = this.redirectUrl;
    this.redirectUrl = null;
    return temp;
  }
  adminCreateUser(userData: any): Observable<any> {
    console.log('Creating user with data:', userData);
    
    return this.http.post(`${this.apiUrl}/admin-create-user`, userData);
  }
  validateInvitation(email: string): Observable<{ isValid: boolean }> {
    return this.http.get<{ isValid: boolean }>(`${this.apiUrl}/validate-invitation?email=${email}`);
  }
  validateRegistrationToken(token: string, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate-registration-token`, { token, email });
  }
  getPendingRegistration(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pending-registration/${token}`);
  }

  setupPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/setup-password`, data);
  }
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(email: string, token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      email,
      token,
      newPassword
    });
  }


}