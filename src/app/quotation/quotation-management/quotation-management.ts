import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { QuotationService, Quotation } from '../quotation.service';
import { ClientService, Client } from '../../client/client.service';
import { CarService, Car } from '../../car/car.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';

function createEmptyQuotation(): Quotation {
  return {
    id: 0,
    quotationNumber: '',
    policyType: '',
    status: '',
    amount: 0,
    createdDate: '',
    clientId: undefined,
    carId: undefined,
    client: undefined,
    agent: undefined,
    car: undefined,
    insuranceCompany: '',
    policyId: undefined,
    clientProposedAmount: undefined,
    clientComment: undefined,
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
  clientCars: Car[] = [];

  // Pagination
  currentPage = 1;
  pageSize = PAGE_SIZE;
  totalQuotations = 0;

  // Sorting
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentRole: string = '';

  // Client negotiation modal state
  isNegotiationModalVisible = false;
  negotiationAmount: number | null = null;
  negotiationComment: string = '';
  negotiationTarget: Quotation | null = null;

  private quotationsList: Quotation[] = [];
  private quotationsSubject = new BehaviorSubject<Quotation[]>([]);
  quotations$ = this.quotationsSubject.asObservable();

  constructor(
    private quotationService: QuotationService,
    private clientService: ClientService,
    private carService: CarService,
    private message: NzMessageService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.currentRole = this.authService.getRole() ?? '';
    this.quotationService.getQuotations().subscribe(quotations => {
      this.quotationsList = quotations || [];
      this.quotationsSubject.next(this.quotationsList);
      this.applyFilters();
      this.cdr.detectChanges();
    });
    this.loadClients();
  }

  loadQuotations() {
    this.quotationService.getQuotations().subscribe(quotations => {
      this.quotationsList = quotations || [];
      this.quotationsSubject.next(this.quotationsList);
      this.applyFilters();
      this.cdr.detectChanges();
    });
  }

  loadClients() {
    this.clientService.getClients().subscribe(data => {
      this.clients = data || [];
    });
  }

  /** Load cars for the selected client (same logic as policy form). */
  loadCarsForClient(clientId: number | undefined): void {
    if (clientId == null) {
      this.clientCars = [];
      return;
    }
    this.carService.getCars(clientId).subscribe(cars => {
      this.clientCars = cars || [];
      this.cdr.detectChanges();
    });
  }

  applyFilters() {
    let filtered = this.quotationsList;
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      filtered = filtered.filter(q =>
        (q.quotationNumber?.toLowerCase().includes(term) || '') ||
        (q.clientName?.toLowerCase().includes(term) || q.client?.fullName?.toLowerCase().includes(term) || '') ||
        (q.policyType?.toLowerCase().includes(term) || '') ||
        (q.status?.toLowerCase().includes(term) || '') ||
        (q.createdDate?.toLowerCase().includes(term) || '') ||
        (q.carRegNumber?.toLowerCase().includes(term) || q.car?.regNumber?.toLowerCase().includes(term) || '') ||
        (q.amount?.toString().includes(term) || '')
      );
    }
    if (this.sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = this.sortColumn === 'client' ? (a.clientName ?? a.client?.fullName ?? '')
          : this.sortColumn === 'car' ? (a.carRegNumber ?? a.car?.regNumber ?? '') : (a as any)[this.sortColumn] ?? '';
        const bVal = this.sortColumn === 'client' ? (b.clientName ?? b.client?.fullName ?? '')
          : this.sortColumn === 'car' ? (b.carRegNumber ?? b.car?.regNumber ?? '') : (b as any)[this.sortColumn] ?? '';
        if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
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
    this.clientCars = [];
    this.isEditMode = false;
    this.isModalVisible = true;
  }

  showEditModal(quotation: Quotation) {
    this.selectedQuotation = {
      ...quotation,
      clientId: quotation.clientId ?? quotation.client?.id,
      carId: quotation.carId ?? quotation.car?.id,
    };
    this.isEditMode = true;
    this.isModalVisible = true;
    this.loadCarsForClient(quotation.clientId ?? quotation.client?.id ?? undefined);
  }

  handleModalOk(quotation: Quotation) {
    if (!this.isEditMode && (quotation.clientId == null || quotation.carId == null)) {
      this.message.error('Please select a client and a car.');
      return;
    }
    this.isLoading = true;
    if (this.isEditMode) {
      this.quotationService.updateQuotation(quotation.id, quotation)
        .pipe(finalize(() => { this.isLoading = false; }))
        .subscribe({
          next: () => {
            this.loadQuotations();
            this.message.success('Quotation updated successfully');
            this.isModalVisible = false;
          },
          error: () => {
            this.message.error('Failed to update quotation');
          }
        });
    } else {
      this.quotationService.addQuotation(quotation)
        .pipe(finalize(() => { this.isLoading = false; }))
        .subscribe({
          next: (newQuotation) => {
            this.quotationsList = [newQuotation, ...this.quotationsList];
            this.quotationsSubject.next(this.quotationsList);
            this.loadQuotations(); // Optionally sync with backend
            this.message.success('Quotation created successfully');
            this.isModalVisible = false;
          },
          error: () => {
            this.message.error('Failed to create quotation');
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
      this.quotationService.deleteQuotation(id)
        .pipe(finalize(() => { this.isLoading = false; }))
        .subscribe({
          next: () => {
            this.loadQuotations();
            this.message.success('Quotation deleted successfully');
          },
          error: () => {
            this.message.error('Failed to delete quotation');
          }
        });
    }
  }

  onClientChange() {
    this.selectedQuotation.carId = undefined;
    this.loadCarsForClient(this.selectedQuotation.clientId ?? undefined);
  }

  /** Client quick actions on a quotation: accept or decline. */
  onClientAction(quotation: Quotation, action: 'ACCEPT' | 'DECLINE') {
    this.isLoading = true;
    this.quotationService.clientAction(quotation.id, action)
      .pipe(finalize(() => { this.isLoading = false; }))
      .subscribe({
        next: () => {
          this.loadQuotations();
          this.message.success(`Quotation ${action.toLowerCase()}ed`);
        },
        error: () => {
          this.message.error('Failed to update quotation');
        }
      });
  }

  /** Client negotiates on a quotation: simple prompt for proposed amount and comment. */
  onClientNegotiate(quotation: Quotation) {
    this.negotiationTarget = quotation;
    this.negotiationAmount = quotation.clientProposedAmount ?? quotation.amount ?? null;
    this.negotiationComment = quotation.clientComment ?? '';
    this.isNegotiationModalVisible = true;
  }

  submitNegotiation() {
    if (!this.negotiationTarget) {
      this.isNegotiationModalVisible = false;
      return;
    }
    const proposed = this.negotiationAmount != null ? Number(this.negotiationAmount) : NaN;
    if (isNaN(proposed) || proposed <= 0) {
      this.message.error('Please enter a valid amount greater than 0.');
      return;
    }
    this.isLoading = true;
    this.quotationService.clientAction(
      this.negotiationTarget.id,
      'NEGOTIATE',
      proposed,
      this.negotiationComment || undefined
    )
      .pipe(finalize(() => { this.isLoading = false; }))
      .subscribe({
        next: () => {
          this.loadQuotations();
          this.message.success('Negotiation request sent to agent');
          this.isNegotiationModalVisible = false;
          this.negotiationTarget = null;
        },
        error: () => {
          this.message.error('Failed to send negotiation request');
        }
      });
  }

  cancelNegotiation() {
    this.isNegotiationModalVisible = false;
    this.negotiationTarget = null;
  }

  get totalPages() {
    return Array.from({ length: Math.ceil(this.totalQuotations / this.pageSize) });
  }

  get canEditDelete(): boolean {
    return this.currentRole === 'AGENT' || this.currentRole === 'SUPER_ADMIN';
  }
}
