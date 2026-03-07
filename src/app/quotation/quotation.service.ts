import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

export interface Quotation {
  id: number;
  quotationNumber: string;
  policyType: string;
  status: string;
  amount: number;
  createdDate: string;
  clientId?: number;
  clientName?: string;
  carId?: number;
  carRegNumber?: string;
  agentId?: number;
  client?: { id: number; fullName?: string };
  agent?: { id: number; fullName?: string };
  car?: { id: number; regNumber?: string };
}

@Injectable({ providedIn: 'root' })
export class QuotationService {
  constructor(private api: ApiService) {}

  getQuotations(params: Record<string, string> = {}): Observable<Quotation[]> {
    const hasParams = params && Object.keys(params).length > 0;
    return this.api.get<Quotation[]>('/quotations', hasParams ? params : undefined);
  }

  addQuotation(quotation: Partial<Quotation>): Observable<Quotation> {
    const body = {
      quotationNumber: quotation.quotationNumber,
      policyType: quotation.policyType,
      status: quotation.status,
      amount: quotation.amount,
      createdDate: quotation.createdDate,
      clientId: quotation.clientId ?? quotation.client?.id,
      carId: quotation.carId ?? quotation.car?.id,
    };
    return this.api.post<Quotation>('/quotations', body);
  }

  updateQuotation(id: number, quotation: Partial<Quotation>): Observable<Quotation> {
    const body = {
      quotationNumber: quotation.quotationNumber,
      policyType: quotation.policyType,
      status: quotation.status,
      amount: quotation.amount,
      createdDate: quotation.createdDate,
    };
    return this.api.put<Quotation>(`/quotations/${id}`, body);
  }

  deleteQuotation(id: number): Observable<any> {
    return this.api.delete(`/quotations/${id}`);
  }
} 