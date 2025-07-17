import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { AuthService } from './auth/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private message: NzMessageService
  ) {
    console.log('ApiService constructed');
  }

  get<T>(endpoint: string, params?: any): Observable<T> {
    console.log('Making HTTP GET request to', this.baseUrl + endpoint);
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params }).pipe(
      catchError(err => this.handleError(err))
    );
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    console.log('Making HTTP POST request to', this.baseUrl + endpoint);
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body).pipe(
      catchError(err => this.handleError(err))
    );
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    console.log('Making HTTP PUT request to', this.baseUrl + endpoint);
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body).pipe(
      catchError(err => this.handleError(err))
    );
  }

  delete<T>(endpoint: string, params?: any): Observable<T> {
    console.log('Making HTTP DELETE request to', this.baseUrl + endpoint);
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, { params }).pipe(
      catchError(err => this.handleError(err))
    );
  }

  private handleError(error: any) {
    let msg = 'An error occurred';
    if (error.error && error.error.message) {
      msg = error.error.message;
    } else if (error.status === 0) {
      msg = 'Network error: Unable to reach server';
    } else if (error.status) {
      msg = `Error ${error.status}: ${error.statusText}`;
    }
    this.message.error(msg);
    return throwError(() => error);
  }
} 