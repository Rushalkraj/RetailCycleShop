import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cycle } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = 'http://localhost:5104/api/cycles';

  constructor(private http: HttpClient) { }

  getCycles(): Observable<Cycle[]> {
    console.log(`Fetching cycles from ${this.apiUrl}`);

    return this.http.get<Cycle[]>(this.apiUrl);
  }

  getCycleById(id: number): Observable<Cycle> {
    return this.http.get<Cycle>(`${this.apiUrl}/${id}`);
  }

  addCycle(cycle: Cycle): Observable<Cycle> {
    return this.http.post<Cycle>(this.apiUrl, cycle);
  }

  updateCycle(id: number, cycle: Cycle): Observable<Cycle> {
    return this.http.put<Cycle>(`${this.apiUrl}/${id}`, cycle);
  }

  deleteCycle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  getLowStockItems(threshold: number = 5): Observable<Cycle[]> {
    return this.http.get<Cycle[]>(`${this.apiUrl}/low-stock?threshold=${threshold}`);
  }
}
