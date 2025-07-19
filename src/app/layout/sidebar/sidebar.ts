import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  role: 'SUPER_ADMIN' | 'AGENT' | 'CLIENT' = 'SUPER_ADMIN';

  constructor(private authService: AuthService) {
    const storedRole = this.authService.getRole();
    if (storedRole === 'SUPER_ADMIN' || storedRole === 'AGENT' || storedRole === 'CLIENT') {
      this.role = storedRole;
    }
  }
}
