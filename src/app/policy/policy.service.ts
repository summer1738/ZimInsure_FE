import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

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
  constructor(private api: ApiService) {}

  getPolicies(clientId?: number, carId?: number): Observable<Policy[]> {
    const params: any = {};
    if (clientId) params.clientId = clientId.toString();
    if (carId) params.carId = carId.toString();
    return this.api.get<Policy[]>('/policies', Object.keys(params).length ? params : undefined);
  }

  addPolicy(policy: Policy): Observable<Policy> {
    return this.api.post<Policy>('/policies', policy);
  }

  updatePolicy(policy: Policy): Observable<Policy> {
    return this.api.put<Policy>(`/policies/${policy.id}`, policy);
  }

  deletePolicy(id: number): Observable<any> {
    return this.api.delete(`/policies/${id}`);
  }
} 