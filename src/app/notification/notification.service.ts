import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  forRole?: 'SUPER_ADMIN' | 'AGENT' | 'CLIENT';
  agentId?: number;
  clientId?: number;
  carId?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = '/api/notifications';

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }
} 