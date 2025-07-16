import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-root',
  imports: [RouterLink, NzIconModule, NzLayoutModule, NzMenuModule, NzModalModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  isCollapsed = false;
  isTestModalVisible = false;
}
