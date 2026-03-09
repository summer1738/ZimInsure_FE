import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

export interface InsuranceTerm {
  id: number;
  car: { id: number; regNumber?: string };
  startDate: string;
  endDate: string;
  termCount: number;
}

@Injectable({ providedIn: 'root' })
export class InsuranceService {
  constructor(private api: ApiService) {}

  getTerms(carId?: number): Observable<InsuranceTerm[]> {
    const params = carId ? { carId: carId.toString() } : undefined;
    return this.api.get<InsuranceTerm[]>('/insurance-terms', params);
  }

  addTerm(term: Partial<InsuranceTerm>): Observable<InsuranceTerm> {
    return this.api.post<InsuranceTerm>('/insurance-terms', term);
  }

  deleteTerm(id: number): Observable<any> {
    return this.api.delete(`/insurance-terms/${id}`);
  }

  scanExpiringInsurances(): Observable<any> {
    return this.api.get('/insurance-terms/scan-expiring');
  }

  getCurrentTermByCarId(carId: number): Observable<InsuranceTerm> {
    return this.api.get<InsuranceTerm>('/insurance-terms/current', { carId: carId.toString() });
  }

  /**
   * Backend returns a plain boolean body (true/false) from /insurance-terms/is-insured.
   */
  isCarInsured(carId: number): Observable<boolean> {
    return this.api.get<boolean>('/insurance-terms/is-insured', { carId: carId.toString() });
  }
} 