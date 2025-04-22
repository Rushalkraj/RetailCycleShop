import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventoryHistory } from '../models/inventory-history.model';

@Injectable({
    providedIn: 'root'
})
export class InventoryHistoryService {
    private apiUrl = 'http://localhost:5104/api/inventoryhistory';

    constructor(private http: HttpClient) { }

    getInventoryHistory(): Observable<InventoryHistory[]> {
        return this.http.get<InventoryHistory[]>(this.apiUrl);
    }

    getHistoryForCycle(cycleId: number): Observable<InventoryHistory[]> {
        return this.http.get<InventoryHistory[]>(`${this.apiUrl}/cycle/${cycleId}`);
    }

    addHistoryEntry(history: InventoryHistory): Observable<InventoryHistory> {
        return this.http.post<InventoryHistory>(this.apiUrl, history);
    }
    getInventorySummary(days: number = 7): Observable<any> {
        return this.http.get(`${this.apiUrl}/summary?days=${days}`);
      }
    
}