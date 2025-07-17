import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from './loading.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, NgIf],
  template: `
    <div *ngIf="loadingService.loading$ | async" class="global-loading-overlay">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    .global-loading-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255,255,255,0.6);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .spinner {
      border: 8px solid #f3f3f3;
      border-top: 8px solid #1890ff;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  constructor(public loadingService: LoadingService) {}
} 