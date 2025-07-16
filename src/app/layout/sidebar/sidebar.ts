import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  // TODO: Replace with real role from authentication service
  role: 'SUPER_ADMIN' | 'AGENT' | 'CLIENT' = 'SUPER_ADMIN';
}
