import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Client } from './client.service';
import { Car } from '../car/car.service';

function createEmptyClient(): Partial<Client> {
  return {
    name: '',
    email: '',
    phone: '',
    address: '',
    idNumber: '',
    status: '',
    agentId: 0,
  };
}

function createEmptyCarForClient(): Partial<Car> {
  return {
    regNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    owner: '',
    status: '',
    type: 'private',
  };
}

@Component({
  selector: 'app-add-client-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-client-modal.html',
})
export class AddClientModal {
  @Input() visible = false;
  @Input() agentId: number | null = null; // If null, show agent selector
  @Input() agentOptions: { id: number, name: string }[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<{ client: Partial<Client>, cars: Partial<Car>[] }>();

  client: Partial<Client> = createEmptyClient();
  carsForClient: Partial<Car>[] = [createEmptyCarForClient()];

  ngOnInit() {
    if (this.agentId) {
      this.client.agentId = this.agentId;
    }
  }

  addCarForm() {
    this.carsForClient.push(createEmptyCarForClient());
  }

  removeCarForm(idx: number) {
    if (this.carsForClient.length > 1) {
      this.carsForClient.splice(idx, 1);
    }
  }

  handleSubmit() {
    // Validate client fields
    if (!this.client.name || !this.client.email || !this.client.phone || !this.client.address || !this.client.idNumber || !this.client.status || !this.client.agentId) {
      alert('Please fill in all client details.');
      return;
    }
    // Validate at least one car and all car fields
    if (!this.carsForClient.length || this.carsForClient.some(car => !car.regNumber || !car.make || !car.model || !car.year || !car.owner || !car.status)) {
      alert('Please enter at least one car and fill in all car details.');
      return;
    }
    this.submit.emit({ client: this.client, cars: this.carsForClient });
    this.reset();
  }

  handleClose() {
    this.close.emit();
    this.reset();
  }

  reset() {
    this.client = createEmptyClient();
    if (this.agentId) {
      this.client.agentId = this.agentId;
    }
    this.carsForClient = [createEmptyCarForClient()];
  }

  public currentYear = new Date().getFullYear();
} 