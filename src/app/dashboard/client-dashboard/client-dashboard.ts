import { Component } from '@angular/core';
import { PolicyService, Policy } from '../../policy/policy.service';
import { QuotationService, Quotation } from '../../quotation/quotation.service';
import { CarService, Car } from '../../car/car.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-dashboard.html',
  styleUrl: './client-dashboard.css'
})
export class ClientDashboard {
  totalActivePolicies$: Observable<number>;
  totalPendingQuotations$: Observable<number>;
  totalCars$: Observable<number>;

  recentPolicies$: Observable<Policy[]>;
  recentQuotations$: Observable<Quotation[]>;

  constructor(
    private policyService: PolicyService,
    private quotationService: QuotationService,
    private carService: CarService
  ) {
    this.totalActivePolicies$ = this.policyService.getPolicies().pipe(
      map(policies => policies.filter(p => p.status === 'Active').length)
    );
    this.totalPendingQuotations$ = this.quotationService.getQuotations().pipe(
      map(quotations => quotations.filter(q => q.status === 'Pending').length)
    );
    this.totalCars$ = this.carService.getCars().pipe(map(cars => cars.length));

    this.recentPolicies$ = this.policyService.getPolicies().pipe(
      map(policies => [...policies].sort((a, b) => b.id - a.id).slice(0, 5))
    );
    this.recentQuotations$ = this.quotationService.getQuotations().pipe(
      map(quotations => [...quotations].sort((a, b) => b.id - a.id).slice(0, 5))
    );
  }
}
