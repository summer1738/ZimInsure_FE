import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Quotation {
  id: number;
  quotationNumber: string;
  policyType: string;
  status: string;
  amount: number;
  createdDate: string;
  client?: { id: number; fullName?: string };
  agent?: { id: number; fullName?: string };
  car?: { id: number; regNumber?: string };
}

@Injectable({ providedIn: 'root' })
export class QuotationService {
  private apiUrl = '/api/quotations';

  constructor(private http: HttpClient) {}

  getQuotations(params: any = {}): Observable<Quotation[]> {
    return this.http.get<Quotation[]>(this.apiUrl, { params });
  }

  addQuotation(quotation: Partial<Quotation>): Observable<Quotation> {
    return this.http.post<Quotation>(this.apiUrl, quotation);
  }

  updateQuotation(id: number, quotation: Partial<Quotation>): Observable<Quotation> {
    return this.http.put<Quotation>(`${this.apiUrl}/${id}`, quotation);
  }

  deleteQuotation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
} 