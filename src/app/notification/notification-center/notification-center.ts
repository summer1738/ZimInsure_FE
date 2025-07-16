import { Component, Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { ClientService } from '../../client/client.service';
import { AgentService } from '../../agent/agent.service';
import { NzMessageService } from 'ng-zorro-antd/message';

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

  getNotificationsByRole(role: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/role/${role}`);
  }

  getNotificationsByAgent(agentId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/agent/${agentId}`);
  }

  getNotificationsByClient(clientId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/client/${clientId}`);
  }

  addNotification(notification: Partial<Notification>): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, notification);
  }

  markAsRead(id: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.apiUrl}/read/${id}`, {});
  }

  markAllAsRead(forRole?: string, agentId?: number, clientId?: number): Observable<void> {
    let params = new HttpParams();
    if (forRole) params = params.set('forRole', forRole);
    if (agentId) params = params.set('agentId', agentId.toString());
    if (clientId) params = params.set('clientId', clientId.toString());
    return this.http.put<void>(`${this.apiUrl}/readAll`, {}, { params });
  }
}

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './notification-center.html',
  styleUrl: './notification-center.css'
})
export class NotificationCenter implements OnInit {
  notifications: Notification[] = [];
  userRole: 'SUPER_ADMIN' | 'AGENT' | 'CLIENT' = 'SUPER_ADMIN';
  agentId: number | null = null;
  clientId: number | null = null;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private clientService: ClientService,
    private agentService: AgentService,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.userRole = (this.authService.getRole() as any) || 'SUPER_ADMIN';
    if (this.userRole === 'CLIENT') {
      this.clientService.getMyProfile().subscribe(profile => {
        this.clientId = profile.id;
        this.notificationService.getNotificationsByClient(this.clientId).subscribe({
          next: (notifs) => { this.notifications = notifs; },
          error: () => this.message.error('Failed to load notifications')
        });
      });
    } else if (this.userRole === 'AGENT') {
      // If you have a way to get agentId, use it. Otherwise, fallback to username or another identifier.
      // For now, we will just fetch all agent notifications (could be improved with real agentId logic)
      const username = this.authService.getUsername();
      // TODO: If agentId is needed, fetch agent profile by username/email
      this.notificationService.getNotificationsByRole('AGENT').subscribe({
        next: (notifs) => { this.notifications = notifs; },
        error: () => this.message.error('Failed to load notifications')
      });
    } else {
      // SUPER_ADMIN
      this.notificationService.getNotificationsByRole('SUPER_ADMIN').subscribe({
        next: (notifs) => { this.notifications = notifs; },
        error: () => this.message.error('Failed to load notifications')
      });
    }
  }

  markAsRead(id: number) {
    this.notificationService.markAsRead(id).subscribe({
      next: () => { this.notifications = this.notifications.map(n => n.id === id ? { ...n, read: true } : n); },
      error: () => this.message.error('Failed to mark as read')
    });
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead(
      this.userRole,
      this.agentId ?? undefined,
      this.clientId ?? undefined
    ).subscribe({
      next: () => { this.notifications = this.notifications.map(n => ({ ...n, read: true })); },
      error: () => this.message.error('Failed to mark all as read')
    });
  }

  get unreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }
}
