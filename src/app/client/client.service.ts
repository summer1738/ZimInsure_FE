import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../api.service';
import { Car } from '../car/car.service';

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

interface ClientWithCarsPayload {
  client: Partial<Client>;
  cars: Partial<Car>[];
}

@Injectable({ providedIn: 'root' })
export class ClientService {
  constructor(private api: ApiService) { }

  getClients(): Observable<Client[]> {
    return this.api.get<Client[]>('/clients');
  }

  /** Get a single client with cars (for edit form). */
  getClientWithCars(id: number): Observable<Client & { cars?: Car[] }> {
    return this.api.get<Client & { cars?: Car[] }>(`/clients/${id}`);
  }

  /**
   * Create a client together with their cars in one request,
   * matching the backend ClientWithCarsDTO (client + cars).
   */
  addClientWithCars(payload: ClientWithCarsPayload): Observable<Client> {
    const normalized = {
      ...payload,
      cars: (payload.cars || []).map(c => this.normalizeCarForApi(c))
    };
    return this.api.post<Client>('/clients', normalized);
  }

  /** Backend expects CarType enum values PRIVATE | COMMERCIAL (uppercase). */
  private normalizeCarForApi(car: Partial<Car>): Partial<Car> {
    const raw = (car.type ?? 'private') as string;
    const type = raw.toUpperCase() === 'COMMERCIAL' ? 'COMMERCIAL' : 'PRIVATE';
    return { ...car, type: type as Car['type'] };
  }

  updateClient(client: Client): Observable<Client> {
    return this.api.put<Client>(`/clients/${client.id}`, client);
  }

  /** Update client and sync cars (add new, update existing, remove missing). */
  updateClientWithCars(client: Client, cars: Partial<Car>[]): Observable<Client> {
    const normalizedCars = (cars || []).map(c => this.normalizeCarForApi(c));
    const body = { client, cars: normalizedCars };
    return this.api.put<Client & { cars?: Car[] }>(`/clients/${client.id}`, body).pipe(
      map(res => (res as unknown as Client))
    );
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