import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzModalModule } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NzModalModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnDestroy {
  protected title = 'ZimInsure';
  isTestModalVisible = false;

  constructor() {
    console.log('App component constructed');
  }

  ngOnDestroy() {}
}
