import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ClientService, Client } from '../client.service';
import { AgentService, Agent } from '../../agent/agent.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-client-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './client-assignments.html',
  styleUrl: './client-assignments.css',
})
export class ClientAssignments {
  clients: Client[] = [];
  agents: Agent[] = [];
  filterAgentId: number | null = null;
  loading = false;
  reassigningId: number | null = null;

  constructor(
    private clientService: ClientService,
    private agentService: AgentService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.load();
  }

  load() {
    this.loading = true;
    this.clientService.getClients().pipe(
      finalize(() => {
        this.loading = false;
        this.runInNextTick(() => {});
      })
    ).subscribe({
      next: (list) => {
        const data = Array.isArray(list) ? list : (list && (list as any).content && Array.isArray((list as any).content) ? (list as any).content : []);
        this.runInNextTick(() => { this.clients = data; });
      },
      error: () => {
        this.runInNextTick(() => { this.clients = []; });
      },
    });
    this.agentService.getAssignableAgents().subscribe({
      next: (list) => {
        const data = list || [];
        this.runInNextTick(() => { this.agents = data; });
      },
    });
  }

  /** Defer update to next macrotask so zoneless CD doesn't see "expression changed after check". */
  private runInNextTick(fn: () => void) {
    setTimeout(() => {
      fn();
      this.cdr.detectChanges();
    }, 0);
  }

  get filteredClients(): Client[] {
    if (this.filterAgentId == null) return this.clients;
    return this.clients.filter((c) => c.createdBy === this.filterAgentId);
  }

  getAgentName(createdBy: number | undefined): string {
    if (createdBy == null) return '—';
    const id = Number(createdBy);
    const agent = this.agents.find((a) => Number(a.id) === id);
    return agent ? (agent.full_name || agent.email || String(agent.id)) : `Agent #${createdBy}`;
  }

  reassign(clientId: number, newAgentId: number) {
    const client = this.clients.find((c) => c.id === clientId);
    if (client && client.createdBy === newAgentId) return;
    this.reassigningId = clientId;
    this.clientService.assignClientToAgent(clientId, newAgentId).subscribe({
      next: (updated) => {
        this.message.success('Client reassigned.');
        this.reassigningId = null;
        this.applyReassignInList(clientId, updated?.createdBy ?? newAgentId);
        this.refreshClientsAfterReassign();
      },
      error: () => {
        this.reassigningId = null;
      },
    });
  }

  /** Update the client in the list so the Assigned-to column updates immediately. */
  private applyReassignInList(clientId: number, newCreatedBy: number) {
    const idx = this.clients.findIndex((c) => c.id === clientId);
    if (idx >= 0) {
      this.clients = this.clients.slice(0);
      this.clients[idx] = { ...this.clients[idx], createdBy: newCreatedBy };
      this.runInNextTick(() => this.cdr.detectChanges());
    }
  }

  /** Reload clients and force view update so table reflects new assignment. */
  private refreshClientsAfterReassign() {
    this.clientService.getClients().subscribe({
      next: (list) => {
        const data = Array.isArray(list) ? [...list] : [];
        this.runInNextTick(() => {
          this.clients = data;
          this.cdr.detectChanges();
        });
      },
    });
  }
}
