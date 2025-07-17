import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

export interface Car {
  id: number;
  regNumber: string;
  make: string;
  model: string;
  year: number;
  owner: string;
  status: string;
  clientId: number;
  type?: 'private' | 'commercial';
}

@Injectable({ providedIn: 'root' })
export class CarService {
  constructor(private api: ApiService) {}

  getCars(clientId?: number): Observable<Car[]> {
    const params = clientId ? { clientId: clientId.toString() } : undefined;
    return this.api.get<Car[]>('/cars', params);
  }

  addCar(car: Car): Observable<Car> {
    return this.api.post<Car>('/cars', car);
  }

  updateCar(car: Car): Observable<Car> {
    return this.api.put<Car>(`/cars/${car.id}`, car);
  }

  deleteCar(id: number): Observable<any> {
    return this.api.delete(`/cars/${id}`);
  }
} 