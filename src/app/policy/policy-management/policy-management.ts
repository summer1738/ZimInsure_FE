import { Component, ChangeDetectorRef } from '@angular/core';
import { PolicyService, Policy } from '../policy.service';
import { QuotationService } from '../../quotation/quotation.service';
import { AuthService } from '../../auth/auth.service';
import { ClientService, Client } from '../../client/client.service';
import { CarService, Car } from '../../car/car.service';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzMessageService } from 'ng-zorro-antd/message';

function createEmptyPolicy(): Policy {
  return {
    id: 0,
    policyNumber: '',
    type: '',
    status: '',
    startDate: '',
    endDate: '',
    carId: undefined,
    clientId: undefined,
    insuranceCompany: '',
  };
}

@Component({
  selector: 'app-policy-management',
  templateUrl: './policy-management.html',
  styleUrl: './policy-management.css',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    FormsModule
  ],
})
export class PolicyManagement {
  filteredPolicies$: Observable<Policy[]>;
  searchTerm$ = new BehaviorSubject<string>('');
  selectedPolicy: Policy = createEmptyPolicy();
  isModalVisible = false;
  isEditMode = false;
  clients: Client[] = [];
  clientCars: Car[] = [];

  private policiesList: Policy[] = [];
  private policiesSubject = new BehaviorSubject<Policy[]>([]);
  policies$ = this.policiesSubject.asObservable();

  currentRole: string = '';

  constructor(
    private policyService: PolicyService,
    private clientService: ClientService,
    private carService: CarService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef,
    private quotationService: QuotationService,
    private authService: AuthService
  ) {
    this.currentRole = this.authService.getRole() ?? '';
    // Only AGENT / SUPER_ADMIN need full client list for assigning policies.
    if (this.currentRole === 'AGENT' || this.currentRole === 'SUPER_ADMIN') {
      this.clientService.getClients().subscribe(list => this.clients = list || []);
    }
    this.policyService.getPolicies().subscribe(policies => {
      this.policiesList = policies;
      this.policiesSubject.next(this.policiesList);
    });
    this.filteredPolicies$ = combineLatest([
      this.policies$,
      this.searchTerm$
    ]).pipe(
      map(([policies, searchTerm]) => {
        if (!searchTerm.trim()) return policies;
        const term = searchTerm.trim().toLowerCase();
        return policies.filter(policy =>
          policy.policyNumber.toLowerCase().includes(term) ||
          policy.type.toLowerCase().includes(term) ||
          policy.status.toLowerCase().includes(term)
        );
      })
    );
  }

  onSearch(term: string) {
    this.searchTerm$.next(term);
  }

  /** Load cars for the selected client and clear car when client changes. */
  onClientChange(): void {
    const clientId = this.selectedPolicy.clientId;
    this.selectedPolicy.carId = undefined;
    this.loadCarsForClient(clientId);
  }

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

  showAddModal() {
    if (!this.canEditDelete) return;
    this.selectedPolicy = createEmptyPolicy();
    this.clientCars = [];
    this.isEditMode = false;
    this.isModalVisible = true;
  }

  showEditModal(policy: Policy) {
    if (!this.canEditDelete) return;
    this.selectedPolicy = { ...policy };
    this.isEditMode = true;
    this.isModalVisible = true;
    this.loadCarsForClient(policy.clientId ?? undefined);
  }

  handleModalOk(policy: Policy) {
    if (!this.isEditMode && (policy.carId == null || policy.clientId == null)) {
      this.message.error('Please select a client and a car.');
      return;
    }
    if (this.isEditMode) {
      this.policyService.updatePolicy(policy).subscribe({
        next: () => this.refreshPolicies(),
        error: () => this.message.error('Failed to update policy')
      });
    } else {
      this.policyService.addPolicy(policy).subscribe({
        next: (newPolicy) => {
          this.policiesList = [newPolicy, ...this.policiesList];
          this.policiesSubject.next(this.policiesList);
          this.refreshPolicies(); // Optionally sync with backend
        },
        error: () => this.message.error('Failed to add policy')
      });
    }
    this.isModalVisible = false;
  }

  handleModalCancel() {
    this.isModalVisible = false;
  }

  deletePolicy(id: number) {
    if (!this.canEditDelete) return;
    this.policyService.deletePolicy(id).subscribe({
      next: () => this.refreshPolicies(),
      error: () => this.message.error('Failed to delete policy')
    });
  }

  refreshPolicies() {
    this.policyService.getPolicies().subscribe(policies => {
      this.policiesList = policies;
      this.policiesSubject.next(this.policiesList);
    });
  }

  /** Generate a quotation from this policy for its client and car. */
  generateQuotation(policy: Policy) {
    if (!this.canEditDelete) return;
    if (!policy.id) {
      this.message.error('Policy ID missing, cannot generate quotation.');
      return;
    }
    this.quotationService.createFromPolicy(policy.id).subscribe({
      next: () => this.message.success('Quotation generated from policy'),
      error: () => this.message.error('Failed to generate quotation from policy')
    });
  }

  get canEditDelete(): boolean {
    return this.currentRole === 'AGENT' || this.currentRole === 'SUPER_ADMIN';
  }
}
