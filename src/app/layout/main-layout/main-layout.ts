import { Component, OnInit, OnDestroy } from '@angular/core';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { RouterModule } from '@angular/router';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NotificationCenter } from '../../notification/notification-center/notification-center';
import { InsuranceService } from '../../car/insurance.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [Header, Sidebar, RouterModule, NzModalModule, NotificationCenter],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  private insuranceScanInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private insuranceService: InsuranceService) {}

  ngOnInit() {
    this.runScanExpiring();
    this.insuranceScanInterval = setInterval(() => this.runScanExpiring(), 24 * 60 * 60 * 1000);
  }

  ngOnDestroy() {
    if (this.insuranceScanInterval) {
      clearInterval(this.insuranceScanInterval);
    }
  }

  private runScanExpiring() {
    this.insuranceService.scanExpiringInsurances().subscribe({
      error: () => { /* ignore 401/404 */ }
    });
  }
}
