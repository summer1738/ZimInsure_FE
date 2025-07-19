import { Component } from '@angular/core';
import { ClientService, Client } from '../../client/client.service';
import { PolicyService, Policy } from '../../policy/policy.service';
import { QuotationService, Quotation } from '../../quotation/quotation.service';
import { CarService, Car } from '../../car/car.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AddClientModal } from '../../client/add-client-modal';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../notification/notification-center/notification-center';
import { NotificationCenter } from '../../notification/notification-center/notification-center';
import { NzModalModule } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AddClientModal,
    RouterModule,
    NotificationCenter,
    NzModalModule,
  ],
  templateUrl: './agent-dashboard.html',
  styleUrl: './agent-dashboard.css'
})
export class AgentDashboard {
  totalClients$: Observable<number>;
  totalActivePolicies$: Observable<number>;
  totalPendingQuotations$: Observable<number>;

  recentPolicies$: Observable<Policy[]>;
  recentQuotations$: Observable<Quotation[]>;

  selectedCard: 'clients' | 'policies' | 'quotations' | null = null;
  isModalVisible = false;
  modalTitle = '';
  modalContent: any[] = [];

  // For demo, hardcode agentId = 1
  public agentId = 1;

  showAddClientModal = false;

  constructor(
    private clientService: ClientService,
    private policyService: PolicyService,
    private quotationService: QuotationService,
    private carService: CarService,
    private notificationService: NotificationService
  ) {
    this.totalClients$ = this.clientService.getClientsByAgentId(this.agentId).pipe(
      map(clients => clients.length)
    );
    this.totalActivePolicies$ = this.policyService.getPolicies().pipe(
      map(policies => policies.filter(p => p.status === 'Active').length)
    );
    this.totalPendingQuotations$ = this.quotationService.getQuotations().pipe(
      map(quotations => quotations.filter(q => q.status === 'Pending').length)
    );

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

  openCardModal(card: 'clients' | 'policies' | 'quotations') {
    this.selectedCard = card;
    this.isModalVisible = true;
    switch (card) {
      case 'clients':
        this.modalTitle = 'Assigned Clients';
        this.modalContent = [{ name: 'Client 1' }, { name: 'Client 2' }];
        break;
      case 'policies':
        this.modalTitle = 'Active Policies';
        this.modalContent = [{ number: 'POL001' }, { number: 'POL002' }];
        break;
      case 'quotations':
        this.modalTitle = 'Pending Quotations';
        this.modalContent = [{ quote: 'Q-1001' }, { quote: 'Q-1002' }];
        break;
    }
  }

  closeModal() {
    this.isModalVisible = false;
    this.selectedCard = null;
    this.modalContent = [];
  }

  handleAddClient({ client, cars }: { client: any, cars: any[] }) {
    // Add client with agentId set
    client.agentId = this.agentId;
    this.clientService.addClient(client as Client);
    // Get the new client id (assume it's the max id)
    const newClientId = Math.max(...(this.clientService as any).clients.map((c: Client) => c.id));
    // Notify admin and agent
    this.notificationService.addNotification({
      message: `New client added: ${client.name}`,
      type: 'info',
      forRole: 'SUPER_ADMIN',
    });
    this.notificationService.addNotification({
      message: `You added a new client: ${client.name}`,
      type: 'success',
      forRole: 'AGENT',
      agentId: this.agentId,
    });
    for (const car of cars) {
      this.carService.addCar({
        id: 0,
        regNumber: car.regNumber!,
        make: car.make!,
        model: car.model!,
        year: car.year!,
        owner: car.owner!,
        status: car.status!,
        clientId: newClientId,
        type: car.type!
      });
      // Notify admin and agent for each car
      this.notificationService.addNotification({
        message: `New car added for client ${client.name}: ${car.regNumber}`,
        type: 'info',
        forRole: 'SUPER_ADMIN',
      });
      this.notificationService.addNotification({
        message: `You added a new car for client ${client.name}: ${car.regNumber}`,
        type: 'success',
        forRole: 'AGENT',
        agentId: this.agentId,
      });
    }
    this.showAddClientModal = false;
  }
}
