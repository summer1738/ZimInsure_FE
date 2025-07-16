import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { InsuranceService } from './car/insurance.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NzModalModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected title = 'ZimInsure';
  isTestModalVisible = false;
  private insuranceScanInterval: any;

  constructor(private insuranceService: InsuranceService) {}

  ngOnInit() {
    this.insuranceService.scanExpiringInsurances();
    // Scan every 24 hours
    this.insuranceScanInterval = setInterval(() => {
      this.insuranceService.scanExpiringInsurances();
    }, 24 * 60 * 60 * 1000);
  }

  ngOnDestroy() {
    if (this.insuranceScanInterval) {
      clearInterval(this.insuranceScanInterval);
    }
  }
}
