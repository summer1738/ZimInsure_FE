import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { ClientService } from '../../client/client.service';
import { AgentService } from '../../agent/agent.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NotificationService, Notification } from '../notification.service';

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
    // Use /me so backend returns only current user's notifications (fixes agent loading and applies displayMessage)
    this.notificationService.getNotificationsMe().subscribe({
      next: (notifs) => { this.notifications = notifs; },
      error: () => this.message.error('Failed to load notifications')
    });
    if (this.userRole === 'CLIENT') {
      this.clientService.getMyProfile().subscribe(profile => {
        this.clientId = profile.id;
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
    this.notificationService.markAllAsReadMe().subscribe({
      next: () => { this.notifications = this.notifications.map(n => ({ ...n, read: true })); },
      error: () => this.message.error('Failed to mark all as read')
    });
  }

  deleteNotification(id: number) {
    this.notificationService.delete(id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.message.success('Notification deleted');
      },
      error: () => this.message.error('Failed to delete notification')
    });
  }

  get unreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }
}
