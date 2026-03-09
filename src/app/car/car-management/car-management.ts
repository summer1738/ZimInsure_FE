import { Component, ChangeDetectorRef } from '@angular/core';
import { CarService, Car } from '../car.service';
import { ClientService, Client } from '../../client/client.service';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, catchError, shareReplay, finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InsuranceService, InsuranceTerm } from '../insurance.service';
import { AuthService } from '../../auth/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';

function createEmptyCar(): Car {
  return {
    id: 0,
    regNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    owner: '',
    status: '',
    clientId: 0,
    type: 'private',
  };
}

const PAGE_SIZE = 7;

@Component({
  selector: 'app-car-management',
  templateUrl: './car-management.html',
  styleUrl: './car-management.css',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [InsuranceService],
})
export class CarManagement {
  cars$: Observable<Car[]>;
  filteredCars$: Observable<Car[]>;
  searchTerm$ = new BehaviorSubject<string>('');
  selectedCar: Car = createEmptyCar();
  isModalVisible = false;
  isEditMode = false;
  userRole: string | null = null;
  /** For Add Car: list of clients (AGENT = their clients, SUPER_ADMIN = all). */
  clients: Client[] = [];

  // Pagination
  currentPage$ = new BehaviorSubject<number>(1);
  pageSize = PAGE_SIZE;
  totalCars = 0;

  // Sorting
  sortColumn$ = new BehaviorSubject<string>('');
  sortDirection$ = new BehaviorSubject<'asc' | 'desc'>('asc');

  // Insurance modal state
  isInsuranceModalVisible = false;
  selectedCarForInsurance: Car | null = null;
  insuranceTermCount = 1;
  insuranceStartDate: string = '';
  insuranceEndDate: string = '';

  // Insurance history modal: view all terms for a car and delete
  isHistoryModalVisible = false;
  selectedCarForHistory: Car | null = null;
  historyTerms: InsuranceTerm[] = [];
  historyLoading = false;
  deletingTermId: number | null = null;

  // Simple per-car caches so async pipes have a stable observable and we avoid spamming HTTP calls.
  private termCache = new Map<number, Observable<InsuranceTerm | null>>();
  private statusCache = new Map<number, Observable<string>>();

  constructor(
    private carService: CarService,
    private clientService: ClientService,
    private insuranceService: InsuranceService,
    private authService: AuthService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.userRole = this.authService.getRole();
    this.cars$ = this.carService.getCars();
    if (this.userRole === 'AGENT' || this.userRole === 'SUPER_ADMIN') {
      this.clientService.getClients().subscribe(list => this.clients = list || []);
    }
    this.filteredCars$ = combineLatest([
      this.cars$,
      this.searchTerm$,
      this.currentPage$,
      this.sortColumn$,
      this.sortDirection$
    ]).pipe(
      map(([cars, searchTerm, currentPage, sortColumn, sortDirection]) => {
        // Filter
        let filtered = cars;
        if (searchTerm.trim()) {
          const term = searchTerm.trim().toLowerCase();
          filtered = cars.filter(c =>
            c.regNumber.toLowerCase().includes(term) ||
            c.make.toLowerCase().includes(term) ||
            c.model.toLowerCase().includes(term) ||
            c.owner.toLowerCase().includes(term) ||
            c.status.toLowerCase().includes(term) ||
            c.year.toString().includes(term)
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
        this.totalCars = filtered.length;
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
    this.selectedCar = createEmptyCar();
    this.isEditMode = false;
    this.isModalVisible = true;
  }

  showEditModal(car: Car) {
    this.selectedCar = { ...car };
    this.isEditMode = true;
    this.isModalVisible = true;
  }

  handleModalOk(car: Car) {
    if (!this.isValidRegNumber(car.regNumber)) {
      alert('Registration number must be 3 uppercase letters followed by 4 digits (e.g., AEE9375).');
      return;
    }
    if (this.isEditMode) {
      this.carService.updateCar(car).subscribe({
        next: () => this.refreshCars(),
        error: () => this.message.error('Failed to update car')
      });
    } else {
      if (this.userRole === 'AGENT' || this.userRole === 'SUPER_ADMIN') {
        if (!car.clientId) {
          this.message.error('Please select a client');
          return;
        }
      }
      const body = {
        regNumber: car.regNumber,
        make: car.make,
        model: car.model,
        year: car.year,
        owner: car.owner,
        status: car.status,
        type: (car.type || 'private').toUpperCase(),
        client: (this.userRole === 'AGENT' || this.userRole === 'SUPER_ADMIN') && car.clientId ? { id: car.clientId } : null
      };
      this.carService.addCar(body as unknown as Car).subscribe({
        next: () => this.refreshCars(),
        error: (err) => this.message.error(err?.error?.message || 'Failed to add car')
      });
    }
    this.isModalVisible = false;
  }

  handleModalCancel() {
    this.isModalVisible = false;
  }

  deleteCar(id: number) {
    this.carService.deleteCar(id).subscribe({
      next: () => this.refreshCars(),
      error: () => this.message.error('Failed to delete car')
    });
  }

  refreshCars() {
    this.cars$ = this.carService.getCars();
    // Bust insurance caches so we see fresh status/terms after changes
    this.termCache.clear();
    this.statusCache.clear();
  }

  isValidRegNumber(reg: string): boolean {
    return /^[A-Z]{3}\d{4}$/.test(reg);
  }

  get totalPages() {
    return Array.from({ length: Math.ceil(this.totalCars / this.pageSize) });
  }

  public currentYear = new Date().getFullYear();

  showInsuranceModal(car: Car) {
    this.selectedCarForInsurance = car;
    this.insuranceTermCount = 1;
    this.insuranceStartDate = new Date().toISOString().slice(0, 10);
    this.insuranceEndDate = this.calculateEndDate(this.insuranceStartDate, 1);
    this.isInsuranceModalVisible = true;
  }

  onInsuranceTermCountChange(count: number) {
    this.insuranceTermCount = count;
    this.insuranceEndDate = this.calculateEndDate(this.insuranceStartDate, count);
  }

  calculateEndDate(start: string, termCount: number): string {
    const startDate = new Date(start);
    startDate.setMonth(startDate.getMonth() + 4 * termCount);
    return startDate.toISOString().slice(0, 10);
  }

  handleInsuranceModalOk() {
    if (!this.selectedCarForInsurance) {
      this.isInsuranceModalVisible = false;
      return;
    }
    this.insuranceService.addTerm({
      car: { id: this.selectedCarForInsurance.id },
      startDate: this.insuranceStartDate,
      endDate: this.insuranceEndDate,
      termCount: Number(this.insuranceTermCount) || 1
    }).subscribe({
      next: () => {
        this.message.success('Car insured successfully');
        this.refreshCars(); // reload cars and clear insurance caches so status updates
        this.isInsuranceModalVisible = false;
        this.selectedCarForInsurance = null;
      },
      error: () => {
        // ApiService already shows a detailed error message; keep this generic
        this.message.error('Failed to insure car');
      }
    });
  }

  handleInsuranceModalCancel() {
    this.isInsuranceModalVisible = false;
    this.selectedCarForInsurance = null;
  }

  showHistoryModal(car: Car) {
    this.selectedCarForHistory = car;
    this.historyTerms = [];
    this.isHistoryModalVisible = true;
    this.loadHistoryTerms();
  }

  loadHistoryTerms() {
    if (!this.selectedCarForHistory) return;
    this.historyLoading = true;
    this.cdr.detectChanges();
    const carId = Number(this.selectedCarForHistory.id);
    this.insuranceService.getTerms(carId).pipe(
      finalize(() => {
        this.historyLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (terms) => {
        this.historyTerms = Array.isArray(terms) ? terms : [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.message.error('Failed to load insurance history');
      }
    });
  }

  closeHistoryModal() {
    this.isHistoryModalVisible = false;
    this.selectedCarForHistory = null;
    this.historyTerms = [];
    this.refreshCars();
  }

  deleteInsuranceTerm(term: InsuranceTerm) {
    if (this.deletingTermId != null) return;
    // Optimistic UI: remove the row immediately
    const previousTerms = [...this.historyTerms];
    this.historyTerms = this.historyTerms.filter(t => t.id !== term.id);
    this.cdr.detectChanges();

    this.deletingTermId = term.id;
    this.insuranceService.deleteTerm(term.id).pipe(
      finalize(() => {
        // Defer reset to next tick to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.deletingTermId = null;
          this.cdr.detectChanges();
        }, 0);
      })
    ).subscribe({
      next: () => {
        this.message.success('Insurance term deleted');
        this.refreshCars();
        this.cdr.detectChanges();
      },
      error: (err: { status?: number }) => {
        if (err?.status === 404) {
          this.message.info('Term not found or already deleted; removed from list.');
          this.cdr.detectChanges();
        } else {
          // Revert optimistic update on unexpected errors
          this.historyTerms = previousTerms;
          this.message.error('Failed to delete insurance term');
          this.cdr.detectChanges();
        }
      }
    });
  }

  termStatus(term: InsuranceTerm): 'Active' | 'Expired' {
    if (!term?.endDate) return 'Expired';
    return new Date(term.endDate) >= new Date() ? 'Active' : 'Expired';
  }

  /**
   * Returns the current (active) insurance term for a car, or null if none is active.
   */
  getCurrentInsuranceTerm(carId: number): Observable<InsuranceTerm | null> {
    if (!this.termCache.has(carId)) {
      const obs = this.insuranceService.getCurrentTermByCarId(carId).pipe(
        catchError(() => of(null)),
        shareReplay(1)
      );
      this.termCache.set(carId, obs);
    }
    return this.termCache.get(carId)!;
  }

  /**
   * Returns 'Active' if the car has an active insurance term, otherwise 'Expired'.
   */
  getInsuranceStatus(carId: number): Observable<string> {
    if (!this.statusCache.has(carId)) {
      const obs = this.insuranceService.isCarInsured(carId).pipe(
        map(isInsured => isInsured ? 'Active' : 'Expired'),
        catchError(() => of('Unknown')),
        shareReplay(1)
      );
      this.statusCache.set(carId, obs);
    }
    return this.statusCache.get(carId)!;
  }
}
