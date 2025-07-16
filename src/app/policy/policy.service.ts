import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Policy {
  id: number;
  policyNumber: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  carId?: number;
  clientId?: number;
  premium?: number;
  clientName?: string;
}

@Injectable({ providedIn: 'root' })
export class PolicyService {
  private apiUrl = '/api/policies';

  constructor(private http: HttpClient) {}

  getPolicies(clientId?: number, carId?: number): Observable<Policy[]> {
    let params = new HttpParams();
    if (clientId) params = params.set('clientId', clientId.toString());
    if (carId) params = params.set('carId', carId.toString());
    return this.http.get<Policy[]>(this.apiUrl, { params });
  }

  addPolicy(policy: Policy): Observable<Policy> {
    return this.http.post<Policy>(this.apiUrl, policy);
  }

  updatePolicy(policy: Policy): Observable<Policy> {
    return this.http.put<Policy>(`${this.apiUrl}/${policy.id}`, policy);
  }

  deletePolicy(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
} 