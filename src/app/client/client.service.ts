import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  idNumber: string;
  status: string;
  agentId: number;
}

@Injectable({ providedIn: 'root' })
export class ClientService {
  private apiUrl = '/api/clients';

  constructor(private http: HttpClient) {}

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  addClient(client: Client): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  updateClient(client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${client.id}`, client);
  }

  deleteClient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getMyProfile(): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/me`);
  }

  updateMyProfile(client: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/me`, client);
  }

  getClientsByAgentId(agentId: number): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl, { params: { agentId: agentId.toString() } });
  }
} 