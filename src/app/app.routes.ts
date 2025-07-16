import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { SuperAdminDashboard } from './dashboard/super-admin-dashboard/super-admin-dashboard';
import { AgentDashboard } from './dashboard/agent-dashboard/agent-dashboard';
import { ClientDashboard } from './dashboard/client-dashboard/client-dashboard';
import { AgentManagement } from './agent/agent-management/agent-management';
import { ClientManagement } from './client/client-management/client-management';
import { CarManagement } from './car/car-management/car-management';
import { PolicyManagement } from './policy/policy-management/policy-management';
import { QuotationManagement } from './quotation/quotation-management/quotation-management';
import { NotificationCenter } from './notification/notification-center/notification-center';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Welcome } from './pages/welcome/welcome';
import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './auth/role.guard';
import { ClientProfileComponent } from './client/client-profile.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'dashboard/super-admin', component: SuperAdminDashboard, canActivate: [AuthGuard, RoleGuard], data: { roles: ['SUPER_ADMIN'] } },
      { path: 'dashboard/agent', component: AgentDashboard, canActivate: [AuthGuard, RoleGuard], data: { roles: ['AGENT'] } },
      { path: 'dashboard/client', component: ClientDashboard, canActivate: [AuthGuard, RoleGuard], data: { roles: ['CLIENT'] } },
      { path: 'profile', component: ClientProfileComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['CLIENT'] } },
      { path: 'agents', component: AgentManagement, canActivate: [AuthGuard, RoleGuard], data: { roles: ['SUPER_ADMIN'] } },
      { path: 'clients', component: ClientManagement, canActivate: [AuthGuard, RoleGuard], data: { roles: ['SUPER_ADMIN', 'AGENT'] } },
      { path: 'cars', component: CarManagement, canActivate: [AuthGuard, RoleGuard], data: { roles: ['SUPER_ADMIN', 'AGENT'] } },
      { path: 'policies', component: PolicyManagement, canActivate: [AuthGuard, RoleGuard], data: { roles: ['SUPER_ADMIN', 'AGENT'] } },
      { path: 'quotations', component: QuotationManagement, canActivate: [AuthGuard, RoleGuard], data: { roles: ['SUPER_ADMIN', 'AGENT'] } },
      { path: 'notifications', component: NotificationCenter, canActivate: [AuthGuard, RoleGuard], data: { roles: ['SUPER_ADMIN', 'AGENT', 'CLIENT'] } }
    ]
  }
];
