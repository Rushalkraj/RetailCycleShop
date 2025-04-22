// services/employee.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:5104/api/employee';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  getEmployee(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  updateEmployee(id: string, employeeData: any): Observable<any> {
    const userRole = this.authService.getUserRole();
    if (userRole === 'Admin') {
      return this.http.put(`${this.apiUrl}/${id}`, employeeData);
    } else {
      alert('You do not have permission to edit employees.');
      return new Observable<any>();
    }
  }

  deleteEmployee(id: string): Observable<void> {
    const userRole = this.authService.getUserRole(); 
    if (userRole === 'Admin') {
      return this.http.delete<void>(`${this.apiUrl}/${id}`);
    } else {
      alert('You do not have permission to delete employees.');
      return new Observable<void>();
    }
  }
}