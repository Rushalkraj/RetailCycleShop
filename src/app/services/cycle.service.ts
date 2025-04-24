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
    return new Observable(observer => {
      this.getCycles().subscribe({
        next: (cycles) => {
          const existingCycle = cycles.find(c =>
            c.brand.toLowerCase() === cycle.brand.toLowerCase() &&
            c.type.toLowerCase() === cycle.type.toLowerCase() &&
            c.model.toLowerCase() === cycle.model.toLowerCase()
          );

          if (existingCycle) {
            observer.error(new Error('A cycle with the same brand, type, and model already exists.'));
          } else {
            this.http.post<Cycle>(this.apiUrl, cycle).pipe(
              catchError(this.handleError)
            ).subscribe({
              next: (result) => observer.next(result),
              error: (error) => observer.error(error),
              complete: () => observer.complete()
            });
          }
        },
        error: (error) => observer.error(error)
      });
    });
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