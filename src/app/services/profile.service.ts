// services/profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:5104/api/profile'; 

  constructor(private http: HttpClient) {}

  getProfile(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put(this.apiUrl, profileData);
  }
}