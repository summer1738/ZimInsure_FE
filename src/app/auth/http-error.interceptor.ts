import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private message: NzMessageService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.message.error('Session expired. Please log in again.');
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          this.message.error('You are not authorized to perform this action.');
          this.router.navigate(['/login']);
        } else if (error.status === 500) {
          this.message.error('A server error occurred. Please try again later.');
        } else if (error.error && typeof error.error === 'string') {
          this.message.error(error.error);
        } else {
          this.message.error('An error occurred. Please try again.');
        }
        return throwError(() => error);
      })
    );
  }
} 