import { Component } from '@angular/core';
import { CarService, Car } from '../car.service';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InsuranceService } from '../insurance.service';
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

  constructor(
    private carService: CarService,
    private insuranceService: InsuranceService,
    private authService: AuthService,
    private message: NzMessageService
  ) {
    this.userRole = this.authService.getRole();
    this.cars$ = this.carService.getCars();
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
      this.carService.addCar(car).subscribe({
        next: () => this.refreshCars(),
        error: () => this.message.error('Failed to add car')
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
    if (this.selectedCarForInsurance) {
      this.insuranceService.addTerm({
        car: { id: this.selectedCarForInsurance.id },
        startDate: this.insuranceStartDate,
        endDate: this.insuranceEndDate,
        termCount: this.insuranceTermCount
      }).subscribe();
    }
    this.isInsuranceModalVisible = false;
    this.selectedCarForInsurance = null;
  }

  handleInsuranceModalCancel() {
    this.isInsuranceModalVisible = false;
    this.selectedCarForInsurance = null;
  }

  /**
   * Returns the current (active) insurance term for a car, or null if none is active.
   */
  getCurrentInsuranceTerm(carId: number) {
    return this.insuranceService.getCurrentTermByCarId(carId);
  }

  /**
   * Returns 'Active' if the car has an active insurance term, otherwise 'Expired'.
   */
  getInsuranceStatus(carId: number): Observable<string> {
    return this.insuranceService.isCarInsured(carId).pipe(
      map(isInsured => isInsured ? 'Active' : 'Expired')
    );
  }
}
