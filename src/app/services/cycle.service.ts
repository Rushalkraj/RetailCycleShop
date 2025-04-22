import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Cycle } from '../models/cycle.model';

@Injectable({
  providedIn: 'root'
})
export class CycleService {
  private apiUrl = 'http://localhost:5104/api/cycles';

  constructor(private http: HttpClient) { }

  getCycles(): Observable<Cycle[]> {
    return this.http.get<Cycle[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getCycleById(id: number): Observable<Cycle> {
    return this.http.get<Cycle>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  addCycle(cycle: Omit<Cycle, 'cycleId'>): Observable<Cycle> {
    return this.http.post<Cycle>(this.apiUrl, cycle).pipe(
      catchError(this.handleError)
    );
  }

  updateCycle(id: number, cycle: Omit<Cycle, 'cycleId'>): Observable<Cycle> {
    return this.http.put<Cycle>(`${this.apiUrl}/${id}`, cycle).pipe(
      catchError(this.handleError)
    );
  }

  deleteCycle(id: number): Observable<void> {
    const userRole = localStorage.getItem('role');
    if (userRole === 'Admin') {
      return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
        catchError(this.handleError)
      );
    } else {
      alert('You do not have permission to delete cycles.');
      return new Observable<void>();
    }
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'An unknown error occurred.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.error?.Message) {
        errorMessage = error.error.Message;
        if (error.error.Details) {
          errorMessage += ` (${error.error.Details})`;
        }
      } else {
        errorMessage = `Server returned code ${error.status}: ${error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }

}