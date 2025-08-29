import { Component } from '@angular/core';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { RouterModule } from '@angular/router';
import { NotificationCenter } from '../../notification/notification-center/notification-center';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [Header, Sidebar, RouterModule, NotificationCenter],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {
  currentYear = new Date().getFullYear();
}
