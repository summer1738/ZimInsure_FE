import { Component, OnInit } from '@angular/core';
import { QuotationService, Quotation } from '../quotation.service';
import { ClientService, Client } from '../../client/client.service';
import { CarService, Car } from '../../car/car.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../auth/auth.service';
import { BehaviorSubject } from 'rxjs';

function createEmptyQuotation(): Quotation {
  return {
    id: 0,
    quotationNumber: '',
    policyType: '',
    status: '',
    amount: 0,
    createdDate: '',
    client: undefined,
    agent: undefined,
    car: undefined,
  };
}

const PAGE_SIZE = 7;

@Component({
  selector: 'app-quotation-management',
  templateUrl: './quotation-management.html',
  styleUrl: './quotation-management.css',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class QuotationManagement implements OnInit {
  quotations: Quotation[] = [];
  filteredQuotations: Quotation[] = [];
  searchTerm = '';
  selectedQuotation: Quotation = createEmptyQuotation();
  isModalVisible = false;
  isEditMode = false;
  public isLoading = false;

  clients: Client[] = [];
  cars: Car[] = [];
  filteredCars: Car[] = [];

  // Pagination
  currentPage = 1;
  pageSize = PAGE_SIZE;
  totalQuotations = 0;

  // Sorting
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentRole: string = '';

  private quotationsList: Quotation[] = [];
  private quotationsSubject = new BehaviorSubject<Quotation[]>([]);
  quotations$ = this.quotationsSubject.asObservable();

  constructor(
    private quotationService: QuotationService,
    private clientService: ClientService,
    private carService: CarService,
    private message: NzMessageService,
    private authService: AuthService // Inject AuthService
  ) { }

  ngOnInit() {
    this.currentRole = this.authService.getRole() ?? '';
    this.quotationService.getQuotations().subscribe(quotations => {
      this.quotationsList = quotations;
      this.quotationsSubject.next(this.quotationsList);
    });
    this.loadClients();
    this.loadCars();
  }

  loadQuotations() {
    this.quotationService.getQuotations().subscribe(quotations => {
      this.quotationsList = quotations;
      this.quotationsSubject.next(this.quotationsList);
    });
  }

  loadClients() {
    this.clientService.getClients().subscribe(data => {
      this.clients = data;
    });
  }

  loadCars() {
    this.carService.getCars().subscribe(data => {
      this.cars = data;
      this.updateFilteredCars();
    });
  }

  applyFilters() {
    let filtered = this.quotationsList;
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      filtered = filtered.filter(q =>
        (q.quotationNumber?.toLowerCase().includes(term) || '') ||
        (q.client?.fullName?.toLowerCase().includes(term) || '') ||
        (q.policyType?.toLowerCase().includes(term) || '') ||
        (q.status?.toLowerCase().includes(term) || '') ||
        (q.createdDate?.toLowerCase().includes(term) || '') ||
        (q.car?.regNumber?.toLowerCase().includes(term) || '') ||
        (q.amount?.toString().includes(term) || '')
      );
    }
    if (this.sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = (a as any)[this.sortColumn] || '';
        const bValue = (b as any)[this.sortColumn] || '';
        if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    this.totalQuotations = filtered.length;
    const start = (this.currentPage - 1) * this.pageSize;
    this.filteredQuotations = filtered.slice(start, start + this.pageSize);
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.currentPage = 1;
    this.applyFilters();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.applyFilters();
  }

  onSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  showAddModal() {
    this.selectedQuotation = createEmptyQuotation();
    this.isEditMode = false;
    this.isModalVisible = true;
    this.updateFilteredCars();
  }

  showEditModal(quotation: Quotation) {
    this.selectedQuotation = { ...quotation };
    this.isEditMode = true;
    this.isModalVisible = true;
    this.updateFilteredCars();
  }

  handleModalOk(quotation: Quotation) {
    this.isLoading = true;
    if (this.isEditMode) {
      this.quotationService.updateQuotation(quotation.id, quotation).subscribe({
        next: () => {
          this.loadQuotations();
          this.message.success('Quotation updated successfully');
          this.isModalVisible = false;
          this.isLoading = false;
        },
        error: () => {
          this.message.error('Failed to update quotation');
          this.isLoading = false;
        }
      });
    } else {
      this.quotationService.addQuotation(quotation).subscribe({
        next: (newQuotation) => {
          this.quotationsList = [newQuotation, ...this.quotationsList];
          this.quotationsSubject.next(this.quotationsList);
          this.loadQuotations(); // Optionally sync with backend
          this.message.success('Quotation created successfully');
          this.isModalVisible = false;
          this.isLoading = false;
        },
        error: () => {
          this.message.error('Failed to create quotation');
          this.isLoading = false;
        }
      });
    }
  }

  handleModalCancel() {
    this.isModalVisible = false;
  }

  deleteQuotation(id: number) {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      this.isLoading = true;
      this.quotationService.deleteQuotation(id).subscribe({
        next: () => {
          this.loadQuotations();
          this.message.success('Quotation deleted successfully');
          this.isLoading = false;
        },
        error: () => {
          this.message.error('Failed to delete quotation');
          this.isLoading = false;
        }
      });
    }
  }

  onClientChange() {
    this.selectedQuotation.car = undefined;
    this.updateFilteredCars();
  }

  updateFilteredCars() {
    if (this.selectedQuotation.client?.id) {
      this.filteredCars = this.cars.filter(car => car.clientId === this.selectedQuotation.client?.id);
    } else {
      this.filteredCars = [];
    }
  }

  get totalPages() {
    return Array.from({ length: Math.ceil(this.totalQuotations / this.pageSize) });
  }

  get canEditDelete(): boolean {
    return this.currentRole === 'AGENT' || this.currentRole === 'SUPER_ADMIN';
  }
}
