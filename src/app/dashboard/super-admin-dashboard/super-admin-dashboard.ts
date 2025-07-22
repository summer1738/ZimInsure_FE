import { Component } from '@angular/core';
import { ClientService, Client } from '../../client/client.service';
import { PolicyService, Policy } from '../../policy/policy.service';
import { QuotationService, Quotation } from '../../quotation/quotation.service';
import { CarService, Car } from '../../car/car.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AddClientModal } from '../../client/add-client-modal';
import { RouterModule } from '@angular/router';
import { NotificationCenter } from '../../notification/notification-center/notification-center';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AddClientModal,
    RouterModule,
    NotificationCenter,
    NzModalModule,
  ],
  templateUrl: './super-admin-dashboard.html',
  styleUrl: './super-admin-dashboard.css'
})
export class SuperAdminDashboard {
  totalClients$: Observable<number>;
  totalCars$: Observable<number>;
  totalPolicies$: Observable<number>;
  totalQuotations$: Observable<number>;

  recentPolicies$: Observable<Policy[]>;
  recentQuotations$: Observable<Quotation[]>;

  showAddClientModal = false;
  agentOptions: { id: number, name: string }[] = [
    { id: 1, name: 'Agent 1' },
    { id: 2, name: 'Agent 2' }
  ];

  selectedCard: 'clients' | 'cars' | 'policies' | 'quotations' | null = null;
  isModalVisible = false;
  modalTitle = '';
  modalContent: any[] = [];

  constructor(
    private clientService: ClientService,
    private carService: CarService,
    private policyService: PolicyService,
    private quotationService: QuotationService,
    private modal: NzModalService,
    private message: NzMessageService
  ) {
    this.totalClients$ = this.clientService.getClients().pipe(map(clients => clients.length));
    this.totalCars$ = this.carService.getCars().pipe(map(cars => cars.length));
    this.totalPolicies$ = this.policyService.getPolicies().pipe(map(policies => policies.length));
    this.totalQuotations$ = this.quotationService.getQuotations().pipe(map(quotations => quotations.length));

    this.recentPolicies$ = this.policyService.getPolicies().pipe(
      map(policies => [...policies].sort((a, b) => b.id - a.id).slice(0, 5))
    );
    this.recentQuotations$ = this.quotationService.getQuotations().pipe(
      map(quotations => [...quotations].sort((a, b) => b.id - a.id).slice(0, 5))
    );
  }

  openAddClientModal() {
    this.showAddClientModal = true;
  }

  closeAddClientModal() {
    this.showAddClientModal = false;
  }

  handleAddClient({ client, cars }: { client: any, cars: any[] }) {
    this.clientService.addClient(client as Client).subscribe({
      next: (newClient) => {
        // Add cars for the new client
        let carsAdded = 0;
        if (cars.length === 0) {
          this.message.success('Client added successfully!');
          this.showAddClientModal = false;
          return;
        }
        for (const car of cars) {
          this.carService.addCar({
            id: 0,
            regNumber: car.regNumber!,
            make: car.make!,
            model: car.model!,
            year: car.year!,
            owner: car.owner!,
            status: car.status!,
            clientId: newClient.id,
            type: car.type!
          }).subscribe({
            next: () => {
              carsAdded++;
              if (carsAdded === cars.length) {
                this.message.success('Client and cars added successfully!');
                this.showAddClientModal = false;
              }
            },
            error: () => {
              this.message.error('Failed to add one or more cars.');
              this.showAddClientModal = false;
            }
          });
        }
      },
      error: () => {
        this.message.error('Failed to add client.');
        this.showAddClientModal = false;
      }
    });
  }

  openCardModal(card: 'clients' | 'cars' | 'policies' | 'quotations') {
    this.selectedCard = card;
    this.isModalVisible = true;
    switch (card) {
      case 'clients':
        this.modalTitle = 'Clients';
        // Fetch or assign relevant data here
        this.modalContent = [{ name: 'Client 1' }, { name: 'Client 2' }];
        break;
      case 'cars':
        this.modalTitle = 'Cars';
        this.modalContent = [{ reg: 'ABC123' }, { reg: 'XYZ789' }];
        break;
      case 'policies':
        this.modalTitle = 'Policies';
        this.modalContent = [{ number: 'POL001' }, { number: 'POL002' }];
        break;
      case 'quotations':
        this.modalTitle = 'Quotations';
        this.modalContent = [{ quote: 'Q-1001' }, { quote: 'Q-1002' }];
        break;
    }
  }

  closeModal() {
    this.isModalVisible = false;
    this.selectedCard = null;
    this.modalContent = [];
  }
}
