import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const expectedRoles: string[] = route.data['roles'] || [];
    const userRole = this.authService.getRole();
    if (userRole && expectedRoles.includes(userRole)) {
      return of(true);
    } else {
      return of(this.router.createUrlTree(['/welcome']));
    }
  }
} 