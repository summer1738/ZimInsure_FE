import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../notification/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NzIconModule, NzButtonModule, RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit, OnDestroy {
  // TODO: Replace with real user info from authentication service
  userName = 'John Doe';
  userRole: 'SUPER_ADMIN' | 'AGENT' | 'CLIENT' = 'SUPER_ADMIN';
  agentId: number = 1; // TODO: Replace with real agent id from auth
  clientId: number = 0; // TODO: Replace with real client id from auth
  unreadCount = 0;
  private notifSub?: Subscription;

  constructor(private router: Router, private notificationService: NotificationService) {}

  ngOnInit() {
    this.notifSub = this.notificationService.getNotifications().subscribe((notifs: Notification[]) => {
      let filtered: Notification[] = [];
      if (this.userRole === 'SUPER_ADMIN') {
        filtered = notifs;
      } else if (this.userRole === 'AGENT') {
        filtered = notifs.filter((n: Notification) => n.agentId === this.agentId || n.forRole === 'AGENT');
      } else if (this.userRole === 'CLIENT') {
        filtered = notifs.filter((n: Notification) => n.clientId === this.clientId || n.forRole === 'CLIENT');
      }
      this.unreadCount = filtered.filter((n: Notification) => !n.read).length;
    });
  }

  ngOnDestroy() {
    this.notifSub?.unsubscribe();
  }

  openNotifications() {
    this.router.navigate(['/notifications']);
  }

  logout() {
    // TODO: Clear auth tokens and redirect to login
    this.router.navigate(['/login']);
  }
}
