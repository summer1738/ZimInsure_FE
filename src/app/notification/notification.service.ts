import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: number;
  message: string;
  /** When set (e.g. for admin/agent viewing client notifications), show this instead of message. */
  displayMessage?: string;
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
  private apiUrl = environment.apiUrl + '/notifications';

  constructor(private http: HttpClient) {}

  /** Notifications for the current user (by role). Use this for header count and notification center. */
  getNotificationsMe(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/me`);
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }

  markAsRead(id: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.apiUrl}/read/${id}`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  markAllAsReadMe(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/me/readAll`, {});
  }

  addNotification(notification: Partial<Notification>): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, notification);
  }
} 