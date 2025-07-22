import { Component } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentService, Agent } from '../agent.service';
import { NzMessageService } from 'ng-zorro-antd/message';

function createEmptyAgent(): Agent {
  return {
    id: 0,
    full_name: '',
    email: '',
    phone: '',
    idNumber: '',
    address: '',
    status: '',
  };
}

const PAGE_SIZE = 7;

@Component({
  selector: 'app-agent-management',
  templateUrl: './agent-management.html',
  styleUrl: './agent-management.css',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AgentManagement {
  private agentsList: Agent[] = [];
  private agentsSubject = new BehaviorSubject<Agent[]>([]);
  agents$ = this.agentsSubject.asObservable();
  filteredAgents$: Observable<Agent[]>;
  searchTerm$ = new BehaviorSubject<string>('');
  selectedAgent: Agent = createEmptyAgent();
  isModalVisible = false;
  isEditMode = false;

  // Pagination
  currentPage$ = new BehaviorSubject<number>(1);
  pageSize = PAGE_SIZE;
  totalAgents = 0;

  // Sorting
  sortColumn$ = new BehaviorSubject<string>('');
  sortDirection$ = new BehaviorSubject<'asc' | 'desc'>('asc');

  constructor(
    private agentService: AgentService,
    private message: NzMessageService
  ) {
    this.agentService.getAgents().subscribe(agents => {
      this.agentsList = agents;
      this.agentsSubject.next(this.agentsList);
    });
    this.filteredAgents$ = combineLatest([
      this.agents$,
      this.searchTerm$,
      this.currentPage$,
      this.sortColumn$,
      this.sortDirection$
    ]).pipe(
      map(([agents, searchTerm, currentPage, sortColumn, sortDirection]) => {
        // Filter
        let filtered = agents;
        if (searchTerm.trim()) {
          const term = searchTerm.trim().toLowerCase();
          filtered = agents.filter(agent =>
            agent.full_name.toLowerCase().includes(term) ||
            agent.email.toLowerCase().includes(term) ||
            agent.phone.toLowerCase().includes(term) ||
            agent.idNumber.toLowerCase().includes(term) ||
            agent.address.toLowerCase().includes(term) ||
            agent.status.toLowerCase().includes(term)
          );
        }
        // Sort
        if (sortColumn) {
          filtered = [...filtered].sort((a, b) => {
            const aValue = (a as any)[sortColumn] || '';
            const bValue = (b as any)[sortColumn] || '';
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
          });
        }
        // Pagination
        this.totalAgents = filtered.length;
        const start = (currentPage - 1) * this.pageSize;
        return filtered.slice(start, start + this.pageSize);
      })
    );
  }

  refreshAgents() {
    this.agentService.getAgents().subscribe(agents => {
      this.agentsList = agents;
      this.agentsSubject.next(this.agentsList);
    });
  }

  onSearch(term: string) {
    this.searchTerm$.next(term);
    this.currentPage$.next(1); // Reset to first page on search
  }

  onPageChange(page: number) {
    this.currentPage$.next(page);
  }

  onSort(column: string) {
    if (this.sortColumn$.value === column) {
      this.sortDirection$.next(this.sortDirection$.value === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn$.next(column);
      this.sortDirection$.next('asc');
    }
  }

  showAddModal() {
    this.selectedAgent = createEmptyAgent();
    this.isEditMode = false;
    this.isModalVisible = true;
  }

  showEditModal(agent: Agent) {
    this.selectedAgent = { ...agent };
    this.isEditMode = true;
    this.isModalVisible = true;
  }

  handleModalOk(agent: Agent) {
    if (this.isEditMode) {
      this.agentService.updateAgent(agent).subscribe({
        next: () => this.refreshAgents(),
        error: () => this.message.error('Failed to update agent')
      });
    } else {
      this.agentService.addAgent(agent).subscribe({
        next: (newAgent) => {
          this.agentsList = [newAgent, ...this.agentsList];
          this.agentsSubject.next(this.agentsList);
          this.refreshAgents(); // Optionally sync with backend
        },
        error: () => this.message.error('Failed to add agent')
      });
    }
    this.isModalVisible = false;
  }

  handleModalCancel() {
    this.isModalVisible = false;
  }

  deleteAgent(id: number) {
    this.agentService.deleteAgent(id).subscribe({
      next: () => this.refreshAgents(),
      error: () => this.message.error('Failed to delete agent')
    });
  }

  get totalPages() {
    return Array.from({ length: Math.ceil(this.totalAgents / this.pageSize) });
  }
}
