import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../notification/notification.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { ClientService } from '../../client/client.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NzIconModule, NzButtonModule, RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit, OnDestroy {
  userName: string = 'User';
  userRole: 'SUPER_ADMIN' | 'AGENT' | 'CLIENT' = 'SUPER_ADMIN';
  agentId: number = 1; // TODO: Replace with real agent id from auth
  clientId: number = 0; // TODO: Replace with real client id from auth
  unreadCount = 0;
  darkMode = false;
  private notifSub?: Subscription;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthService,
    private clientService: ClientService
  ) { }

  ngOnInit() {
    // Restore dark mode preference
    const darkPref = localStorage.getItem('darkMode');
    this.darkMode = darkPref === 'true';
    this.applyDarkMode();
    // Fetch full name for CLIENT or SUPER_ADMIN
    this.clientService.getMyProfile().subscribe({
      next: (profile) => {
        this.userName = profile.fullName || 'User';
      },
      error: () => {
        this.userName = this.authService.getUsername() || 'User';
      }
    });
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

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', this.darkMode ? 'true' : 'false');
    this.applyDarkMode();
  }

  applyDarkMode() {
    if (this.darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}
