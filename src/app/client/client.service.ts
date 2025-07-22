import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

export interface Client {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  idNumber: string;
  address: string;
  status: string;
  agentId?: number;
}

@Injectable({ providedIn: 'root' })
export class ClientService {
  constructor(private api: ApiService) { }

  getClients(): Observable<Client[]> {
    return this.api.get<Client[]>('/clients');
  }

  addClient(client: Client): Observable<Client> {
    return this.api.post<Client>('/clients', client);
  }

  updateClient(client: Client): Observable<Client> {
    return this.api.put<Client>(`/clients/${client.id}`, client);
  }

  deleteClient(id: number): Observable<any> {
    return this.api.delete(`/clients/${id}`);
  }

  getMyProfile(): Observable<Client> {
    return this.api.get<Client>('/clients/me');
  }

  updateMyProfile(client: Partial<Client>): Observable<Client> {
    return this.api.put<Client>('/clients/me', client);
  }

  getClientsByAgentId(agentId: number): Observable<Client[]> {
    return this.api.get<Client[]>('/clients', { agentId: agentId.toString() });
  }
} 