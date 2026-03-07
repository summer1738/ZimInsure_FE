import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { InsuranceService } from './car/insurance.service';
import { AuthService } from './auth/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NzModalModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected title = 'ZimInsure';
  isTestModalVisible = false;
  private insuranceScanInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private insuranceService: InsuranceService,
    private auth: AuthService,
    private http: HttpClient
  ) {
    console.log('App component constructed');
  }

  ngOnInit() {
    this.runScanIfLoggedIn();
    this.insuranceScanInterval = setInterval(() => this.runScanIfLoggedIn(), 24 * 60 * 60 * 1000);
  }

  private runScanIfLoggedIn() {
    if (!this.auth.hasToken()) return;
    this.insuranceService.scanExpiringInsurances().subscribe({
      error: () => { /* avoid 401/404 triggering global error handler repeatedly */ }
    });
  }

  ngOnDestroy() {
    if (this.insuranceScanInterval) {
      clearInterval(this.insuranceScanInterval);
    }
  }
}
