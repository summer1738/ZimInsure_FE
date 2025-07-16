import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css'
})
export class Welcome {
  features = [
    { title: 'Super Admin Dashboard', link: '/dashboard/super-admin', desc: 'Admin overview and controls.' },
    { title: 'Agent Dashboard', link: '/dashboard/agent', desc: 'Agent workspace and client management.' },
    { title: 'Client Dashboard', link: '/dashboard/client', desc: 'Client policy and car management.' },
    { title: 'Agent Management', link: '/agents', desc: 'Manage agents (Super Admin).' },
    { title: 'Client Management', link: '/clients', desc: 'Manage clients (Agent/Super Admin).' },
    { title: 'Car Management', link: '/cars', desc: 'Manage cars (Agent/Client).' },
    { title: 'Policy Management', link: '/policies', desc: 'Manage insurance policies.' },
    { title: 'Quotations', link: '/quotations', desc: 'View and generate quotations.' },
    { title: 'Notifications', link: '/notifications', desc: 'View reminders and notifications.' }
  ];
}
