import { Component } from '@angular/core';
import { PolicyService, Policy } from '../../policy/policy.service';
import { QuotationService, Quotation } from '../../quotation/quotation.service';
import { CarService, Car } from '../../car/car.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationCenter } from '../../notification/notification-center/notification-center';
import { NzModalModule } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NotificationCenter,
    NzModalModule,
  ],
  templateUrl: './client-dashboard.html',
  styleUrl: './client-dashboard.css'
})
export class ClientDashboard {
  selectedCard: 'policies' | 'quotations' | 'cars' | null = null;
  isModalVisible = false;
  modalTitle = '';
  modalContent: any[] = [];

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

  openCardModal(card: 'policies' | 'quotations' | 'cars') {
    this.selectedCard = card;
    this.isModalVisible = true;
    switch (card) {
      case 'policies':
        this.modalTitle = 'Active Policies';
        this.modalContent = [{ number: 'POL001' }, { number: 'POL002' }];
        break;
      case 'quotations':
        this.modalTitle = 'Pending Quotations';
        this.modalContent = [{ quote: 'Q-1001' }, { quote: 'Q-1002' }];
        break;
      case 'cars':
        this.modalTitle = 'Cars';
        this.modalContent = [{ reg: 'ABC123' }, { reg: 'XYZ789' }];
        break;
    }
  }

  closeModal() {
    this.isModalVisible = false;
    this.selectedCard = null;
    this.modalContent = [];
  }
}
