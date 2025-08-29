import { Component } from '@angular/core';
import { ClientService, Client } from '../client.service';
import { CarService, Car } from '../../car/car.service';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddClientModal } from '../add-client-modal';

function createEmptyClient(): Client {
  return {
    id: 0,
    full_name: '',
    email: '',
    phone: '',
    address: '',
    idNumber: '',
    agentId: 0,
  };
}

function createEmptyCarForClient(): Partial<Car> {
  return {
    regNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    owner: '',
    status: '',
  };
}

const PAGE_SIZE = 7;

@Component({
  selector: 'app-client-management',
  templateUrl: './client-management.html',
  styleUrl: './client-management.css',
  standalone: true,
  imports: [CommonModule, FormsModule, AddClientModal],
})
export class ClientManagement {
  clients$: Observable<Client[]>;
  filteredClients$: Observable<Client[]>;
  searchTerm$ = new BehaviorSubject<string>('');
  selectedClient: Client = createEmptyClient();
  isModalVisible = false;
  isEditMode = false;

  // Add Client Modal properties
  showAddClientModal = false;
  agentOptions: { id: number, name: string }[] = [
    { id: 1, name: 'Agent 1' },
    { id: 2, name: 'Agent 2' }
  ];

  // Cars for new client
  carsForClient: Partial<Car>[] = [createEmptyCarForClient()];

  // Pagination
  currentPage$ = new BehaviorSubject<number>(1);
  pageSize = PAGE_SIZE;
  totalClients = 0;

  // Sorting
  sortColumn$ = new BehaviorSubject<string>('');
  sortDirection$ = new BehaviorSubject<'asc' | 'desc'>('asc');

  constructor(
    private clientService: ClientService,
    private carService: CarService,
  ) {
    this.clients$ = this.clientService.getClients();
    this.filteredClients$ = combineLatest([
      this.clients$,
      this.searchTerm$,
      this.currentPage$,
      this.sortColumn$,
      this.sortDirection$
    ]).pipe(
      map(([clients, searchTerm, currentPage, sortColumn, sortDirection]) => {
        // Filter
        let filtered = clients;
        if (searchTerm.trim()) {
          const term = searchTerm.trim().toLowerCase();
          filtered = clients.filter(client =>
            (client.full_name || '').toLowerCase().includes(term) ||
            client.email.toLowerCase().includes(term) ||
            client.phone.toLowerCase().includes(term) ||
                        client.address.toLowerCase().includes(term) ||
            client.idNumber.toLowerCase().includes(term)
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
        this.totalClients = filtered.length;
        const start = (currentPage - 1) * this.pageSize;
        return filtered.slice(start, start + this.pageSize);
      })
    );
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
    this.showAddClientModal = true;
  }

  openAddClientModal() {
    this.showAddClientModal = true;
  }

  closeAddClientModal() {
    this.showAddClientModal = false;
  }

  handleAddClient({ client, cars }: { client: any, cars: any[] }) {
    this.clientService.addClient(client as Client, cars).subscribe({
      next: (newClient) => {
        console.log('Client and cars added successfully!');
        this.showAddClientModal = false;
        this.refreshClients();
      },
      error: () => {
        console.log('Failed to add client.');
        this.showAddClientModal = false;
      }
    });
  }

  showEditModal(client: Client) {
    this.selectedClient = { ...client };
    this.isEditMode = true;
    this.isModalVisible = true;
    this.carsForClient = [];
  }

  handleModalOk(client: Client) {
    if (this.isEditMode) {
      this.clientService.updateClient(client).subscribe({
        next: () => this.refreshClients(),
        error: () => console.log('Failed to update client')
      });
    }
    this.isModalVisible = false;
  }

  handleModalCancel() {
    this.isModalVisible = false;
  }

  deleteClient(id: number) {
    this.clientService.deleteClient(id).subscribe({
      next: () => this.refreshClients(),
      error: () => console.log('Failed to delete client')
    });
  }

  refreshClients() {
    this.clients$ = this.clientService.getClients();
  }

  get totalPages() {
    return Array.from({ length: Math.ceil(this.totalClients / this.pageSize) });
  }

  public currentYear = new Date().getFullYear();
}
