import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Agent {
  id: number;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class AgentService {
  private apiUrl = '/api/agents';

  constructor(private http: HttpClient) {}

  getAgents(): Observable<Agent[]> {
    return this.http.get<Agent[]>(this.apiUrl);
  }

  addAgent(agent: Agent): Observable<Agent> {
    return this.http.post<Agent>(this.apiUrl, agent);
  }

  updateAgent(agent: Agent): Observable<Agent> {
    return this.http.put<Agent>(`${this.apiUrl}/${agent.id}`, agent);
  }

  deleteAgent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
} 