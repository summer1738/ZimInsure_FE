import { Component } from '@angular/core';
import { PolicyService, Policy } from '../policy.service';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  };
}

@Component({
  selector: 'app-policy-management',
  templateUrl: './policy-management.html',
  styleUrl: './policy-management.css',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
})
export class PolicyManagement {
  filteredPolicies$: Observable<Policy[]>;
  searchTerm$ = new BehaviorSubject<string>('');
  selectedPolicy: Policy = createEmptyPolicy();
  isModalVisible = false;
  isEditMode = false;

  private policiesList: Policy[] = [];
  private policiesSubject = new BehaviorSubject<Policy[]>([]);
  policies$ = this.policiesSubject.asObservable();

  constructor(
    private policyService: PolicyService,
  ) {
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

  showAddModal() {
    this.selectedPolicy = createEmptyPolicy();
    this.isEditMode = false;
    this.isModalVisible = true;
  }

  showEditModal(policy: Policy) {
    this.selectedPolicy = { ...policy };
    this.isEditMode = true;
    this.isModalVisible = true;
  }

  handleModalOk(policy: Policy) {
    if (this.isEditMode) {
      this.policyService.updatePolicy(policy).subscribe({
        next: () => this.refreshPolicies(),
        error: () => console.log('Failed to update policy')
      });
    } else {
      this.policyService.addPolicy(policy).subscribe({
        next: (newPolicy) => {
          this.policiesList = [newPolicy, ...this.policiesList];
          this.policiesSubject.next(this.policiesList);
          this.refreshPolicies(); // Optionally sync with backend
        },
        error: () => console.log('Failed to add policy')
      });
    }
    this.isModalVisible = false;
  }

  handleModalCancel() {
    this.isModalVisible = false;
  }

  deletePolicy(id: number) {
    this.policyService.deletePolicy(id).subscribe({
      next: () => this.refreshPolicies(),
      error: () => console.log('Failed to delete policy')
    });
  }

  refreshPolicies() {
    this.policyService.getPolicies().subscribe(policies => {
      this.policiesList = policies;
      this.policiesSubject.next(this.policiesList);
    });
  }
}
