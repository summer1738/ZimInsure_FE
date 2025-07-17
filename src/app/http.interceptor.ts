import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, finalize, retry, tap, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';
import { LoadingService } from './loading.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable()
export class AppHttpInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private auth: AuthService,
    private loading: LoadingService,
    private message: NzMessageService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req;
    const token = this.auth.getToken();
    if (token) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    this.loading.show();
    console.log('[HTTP] Request:', authReq.method, authReq.url, authReq.body || '');

    return next.handle(authReq).pipe(
      retry(1), // Retry once on error (can be increased)
      tap(event => {
        // Optionally log responses here
        // console.log('[HTTP] Response:', event);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token might be expired, try to refresh
          return this.handle401Error(authReq, next);
        }
        let msg = 'An error occurred';
        if (error.error && error.error.message) {
          msg = error.error.message;
        } else if (error.status === 0) {
          msg = 'Network error: Unable to reach server';
        } else if (error.status) {
          msg = `Error ${error.status}: ${error.statusText}`;
        }
        this.message.error(msg);
        console.error('[HTTP] Error:', error);
        return throwError(() => error);
      }),
      finalize(() => {
        this.loading.hide();
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      return this.auth.refreshToken().pipe(
        switchMap((res) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(res.token);
          // Clone the failed request with the new token
          const newReq = request.clone({
            setHeaders: { Authorization: `Bearer ${res.token}` }
          });
          return next.handle(newReq);
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.auth.logout();
          return throwError(() => err);
        })
      );
    } else {
      // Wait until the refresh is done, then retry
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          const newReq = request.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          });
          return next.handle(newReq);
        })
      );
    }
  }
} 