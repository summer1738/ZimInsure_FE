import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = '/api/cars';

  constructor(private http: HttpClient) {}

  getCars(clientId?: number): Observable<Car[]> {
    let params = new HttpParams();
    if (clientId) {
      params = params.set('clientId', clientId.toString());
    }
    return this.http.get<Car[]>(this.apiUrl, { params });
  }

  addCar(car: Car): Observable<Car> {
    return this.http.post<Car>(this.apiUrl, car);
  }

  updateCar(car: Car): Observable<Car> {
    return this.http.put<Car>(`${this.apiUrl}/${car.id}`, car);
  }

  deleteCar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
} 