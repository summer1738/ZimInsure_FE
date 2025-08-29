import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.log('Session expired. Please log in again.');
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          console.log('You are not authorized to perform this action.');
          this.router.navigate(['/login']);
        } else if (error.status === 500) {
          console.log('A server error occurred. Please try again later.');
        } else if (error.error && typeof error.error === 'string') {
          console.log(error.error);
        } else {
          console.log('An error occurred. Please try again.');
        }
        return throwError(() => error);
      })
    );
  }
} 