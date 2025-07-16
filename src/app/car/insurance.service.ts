import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface InsuranceTerm {
  id: number;
  car: { id: number; regNumber?: string };
  startDate: string;
  endDate: string;
  termCount: number;
}

@Injectable({ providedIn: 'root' })
export class InsuranceService {
  private apiUrl = '/api/insurance-terms';

  constructor(private http: HttpClient) {}

  getTerms(carId?: number): Observable<InsuranceTerm[]> {
    let params = new HttpParams();
    if (carId) {
      params = params.set('carId', carId.toString());
    }
    return this.http.get<InsuranceTerm[]>(this.apiUrl, { params });
  }

  addTerm(term: Partial<InsuranceTerm>): Observable<InsuranceTerm> {
    return this.http.post<InsuranceTerm>(this.apiUrl, term);
  }

  deleteTerm(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  scanExpiringInsurances(): Observable<any> {
    return this.http.get(`${this.apiUrl}/scan-expiring`);
  }

  getCurrentTermByCarId(carId: number): Observable<InsuranceTerm> {
    return this.http.get<InsuranceTerm>(`${this.apiUrl}/current`, { params: new HttpParams().set('carId', carId.toString()) });
  }

  isCarInsured(carId: number): Observable<boolean> {
    return this.http.get<{ insured: boolean }>(`${this.apiUrl}/is-insured`, { params: new HttpParams().set('carId', carId.toString()) })
      .pipe(map(res => res.insured));
  }
} 