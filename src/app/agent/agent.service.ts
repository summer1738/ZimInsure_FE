import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

export interface Agent {
  id: number;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  address: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class AgentService {
  constructor(private api: ApiService) { }

  getAgents(): Observable<Agent[]> {
    return this.api.get<Agent[]>('/agents');
  }

  addAgent(agent: Agent): Observable<Agent> {
    return this.api.post<Agent>('/agents', agent);
  }

  updateAgent(agent: Agent): Observable<Agent> {
    return this.api.put<Agent>(`/agents/${agent.id}`, agent);
  }

  deleteAgent(id: number): Observable<any> {
    return this.api.delete(`/agents/${id}`);
  }
} 