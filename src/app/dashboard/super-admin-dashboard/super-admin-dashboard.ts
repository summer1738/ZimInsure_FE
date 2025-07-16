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

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, AddClientModal, RouterModule],
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

  constructor(
    private clientService: ClientService,
    private carService: CarService,
    private policyService: PolicyService,
    private quotationService: QuotationService
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
    this.clientService.addClient(client as Client);
    // Get the new client id (assume it's the max id)
    const newClientId = Math.max(...(this.clientService as any).clients.map((c: Client) => c.id));
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
    }
    this.showAddClientModal = false;
  }
}
