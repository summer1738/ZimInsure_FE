import { Component } from '@angular/core';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { RouterModule } from '@angular/router';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NotificationCenter } from '../../notification/notification-center/notification-center';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [Header, Sidebar, RouterModule, NzModalModule, NotificationCenter],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {
}
