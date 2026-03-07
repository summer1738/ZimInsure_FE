import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ClientService, Client } from '../client.service';
import { Car } from '../../car/car.service';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';

function createEmptyClient(): Client {
  return {
    id: 0,
    full_name: '',
    email: '',
    phone: '',
    address: '',
    idNumber: '',
    status: '',
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
  imports: [CommonModule, FormsModule],
})
export class ClientManagement {
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);
  clients$: Observable<Client[]>;
  filteredClients$: Observable<Client[]>;
  searchTerm$ = new BehaviorSubject<string>('');
  selectedClient: Client = createEmptyClient();
  isModalVisible = false;
  isEditMode = false;
  /** True after client + cars have been loaded in edit modal (so Update can be enabled). */
  editFormLoaded = false;

  // Cars for new client
  carsForClient: Partial<Car>[] = [createEmptyCarForClient()];

  // Pagination
  currentPage$ = new BehaviorSubject<number>(1);
  pageSize = PAGE_SIZE;
  totalClients = 0;

  // Sorting
  sortColumn$ = new BehaviorSubject<string>('');
  sortDirection$ = new BehaviorSubject<'asc' | 'desc'>('asc');

  public currentYear = new Date().getFullYear();

  @ViewChild('clientForm') clientFormRef?: NgForm;

  constructor(
    private clientService: ClientService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.clients$ = this.refreshTrigger$.pipe(
      switchMap(() => this.clientService.getClients())
    );
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
            (client.email || '').toLowerCase().includes(term) ||
            (client.phone || '').toLowerCase().includes(term) ||
            (client.address || '').toLowerCase().includes(term) ||
            (client.idNumber || '').toLowerCase().includes(term) ||
            (client.status || '').toLowerCase().includes(term)
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
    this.editFormLoaded = false;
    this.selectedClient = {
      id: 0,
      full_name: '',
      email: '',
      phone: '',
      idNumber: '',
      address: '',
      status: '',
      agentId: undefined
    };
    this.isEditMode = false;
    this.isModalVisible = true;
    this.carsForClient = [createEmptyCarForClient()];
  }

  showEditModal(client: Client) {
    this.editFormLoaded = false;
    this.selectedClient = { ...client };
    this.isEditMode = true;
    this.isModalVisible = true;
    this.carsForClient = [];
    // Load client with cars and status for the form
    this.clientService.getClientWithCars(client.id).subscribe({
      next: (full) => {
        this.selectedClient = {
          id: full.id,
          full_name: (full as any).full_name ?? full.full_name ?? '',
          email: full.email,
          phone: full.phone ?? '',
          address: full.address ?? '',
          idNumber: (full as any).idNumber ?? full.idNumber ?? '',
          status: full.status ?? 'Active',
          agentId: (full as any).createdBy
        };
        const cars = (full as any).cars;
        if (cars && Array.isArray(cars) && cars.length > 0) {
          this.carsForClient = cars.map((c: any) => ({
            id: c.id,
            regNumber: c.regNumber ?? '',
            make: c.make ?? '',
            model: c.model ?? '',
            year: c.year ?? new Date().getFullYear(),
            owner: c.owner ?? '',
            status: c.status ?? 'Active',
            type: c.type?.toLowerCase() ?? 'private'
          }));
        } else {
          this.carsForClient = [createEmptyCarForClient()];
        }
        this.editFormLoaded = true;
        this.cdr.detectChanges();
        setTimeout(() => this.clientFormRef?.form?.updateValueAndValidity(), 0);
      },
      error: () => {
        this.message.error('Failed to load client details');
        this.isModalVisible = false;
      }
    });
  }

  addCarForm() {
    this.carsForClient.push(createEmptyCarForClient());
  }

  removeCarForm(idx: number) {
    if (this.carsForClient.length > 1) {
      this.carsForClient.splice(idx, 1);
    }
  }

  handleModalOk(client: Client) {
    if (!this.isEditMode) {
      // Validate at least one car and all car fields
      if (
        !this.carsForClient.length ||
        this.carsForClient.some(
          car =>
            !car.regNumber ||
            !car.make ||
            !car.model ||
            !car.year ||
            !car.owner ||
            !car.status
        )
      ) {
        alert('Please enter at least one car and fill in all car details.');
        return;
      }

      // Create client together with their cars in a single request
      this.clientService
        .addClientWithCars({
          client,
          cars: this.carsForClient,
        })
        .subscribe({
          next: () => this.refreshClients(),
          error: () => this.message.error('Failed to add client'),
        });
    } else {
      this.clientService.updateClientWithCars(client, this.carsForClient).subscribe({
        next: () => this.refreshClients(),
        error: () => this.message.error('Failed to update client'),
      });
    }
    this.isModalVisible = false;
  }

  handleModalCancel() {
    this.isModalVisible = false;
    this.editFormLoaded = false;
  }

  deleteClient(id: number) {
    this.clientService.deleteClient(id).subscribe({
      next: () => {
        this.message.success('Client deleted');
        this.refreshClients();
      },
      error: () => {
        // ApiService handleError already shows the backend message
      }
    });
  }

  refreshClients() {
    this.refreshTrigger$.next();
  }

  get totalPages() {
    return Array.from({ length: Math.ceil(this.totalClients / this.pageSize) });
  }
}
