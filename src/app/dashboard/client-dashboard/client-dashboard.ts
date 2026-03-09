import { Component, OnInit } from '@angular/core';
import { PolicyService, Policy } from '../../policy/policy.service';
import { QuotationService, Quotation } from '../../quotation/quotation.service';
import { CarService, Car } from '../../car/car.service';
import { ClientService, Client } from '../../client/client.service';
import { InsuranceService, InsuranceTerm } from '../../car/insurance.service';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
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
export class ClientDashboard implements OnInit {
  selectedCard: 'policies' | 'quotations' | 'cars' | null = null;
  isModalVisible = false;
  modalTitle = '';
  modalContent: any[] = [];

  totalActivePolicies$: Observable<number>;
  totalPendingQuotations$: Observable<number>;
  totalCars$: Observable<number>;
  totalActiveInsurances$: Observable<number>;
  /** Human-readable label for remaining days badge. */
  remainingInsuranceLabel = '…';

  recentPolicies$: Observable<Policy[]>;
  recentQuotations$: Observable<Quotation[]>;
  recentInsurances$: Observable<InsuranceTerm[]>;

  /** Client's profile including assigned agent (for "Your agent" section). */
  myProfile$: Observable<Client | null>;

  constructor(
    private policyService: PolicyService,
    private quotationService: QuotationService,
    private carService: CarService,
    private clientService: ClientService,
    private insuranceService: InsuranceService
  ) {
    this.totalActivePolicies$ = this.policyService.getPolicies().pipe(
      map(policies => policies.filter(p => p.status === 'Active').length)
    );
    this.totalPendingQuotations$ = this.quotationService.getQuotations().pipe(
      map(quotations =>
        quotations.filter(q => (q.status || '').toLowerCase() === 'pending').length
      )
    );
    this.totalCars$ = this.carService.getCars().pipe(map(cars => cars.length));

    const today = new Date();
    this.totalActiveInsurances$ = this.insuranceService.getTerms().pipe(
      map(terms =>
        terms.filter(t => t.endDate && new Date(t.endDate) >= today).length
      ),
      catchError(() => of(0))
    );

    this.recentPolicies$ = this.policyService.getPolicies().pipe(
      map(policies => [...policies].sort((a, b) => b.id - a.id).slice(0, 5))
    );
    this.recentQuotations$ = this.quotationService.getQuotations().pipe(
      map(quotations => [...quotations].sort((a, b) => b.id - a.id).slice(0, 5))
    );
    this.recentInsurances$ = this.insuranceService.getTerms().pipe(
      map(terms => [...terms].sort((a, b) => b.id - a.id).slice(0, 5)),
      catchError(() => of([])),
      shareReplay(1)
    );

    this.myProfile$ = this.clientService.getMyProfile().pipe(
      map(p => p ?? null),
      catchError(() => of(null)),
      shareReplay(1)
    );
  }

  ngOnInit() {
    // Compute remaining days label once when dashboard loads.
    this.insuranceService.getTerms().subscribe({
      next: terms => {
        if (!terms || terms.length === 0) {
          this.remainingInsuranceLabel = 'No active insurance';
          return;
        }
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const active = terms.filter(t => t.endDate && new Date(t.endDate) >= now);
        if (active.length === 0) {
          this.remainingInsuranceLabel = 'No active insurance';
          return;
        }
        const daysList = active.map(t => {
          const end = new Date(t.endDate);
          end.setHours(0, 0, 0, 0);
          return Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        });
        const minDays = Math.min(...daysList);
        this.remainingInsuranceLabel = `${minDays} ${minDays === 1 ? 'day' : 'days'} left`;
      },
      error: () => {
        this.remainingInsuranceLabel = 'No active insurance';
      }
    });
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
