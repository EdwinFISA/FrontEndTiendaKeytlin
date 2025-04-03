import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginModel {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiration: string;
  name: string;
  userId: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromLocalStorage());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get currentUserId(): number | null {
    return this.currentUserValue?.id || null;
  }

  login(loginData: LoginModel): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginData).pipe(
      tap(response => this.handleLoginSuccess(response, loginData.email)),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => this.getLoginErrorMessage(error));
      })
    );
  }

  logout(): Observable<void> {
    // Clear local data first
    this.clearLocalAuthData();

    // Make HTTP call to backend
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      catchError(error => {
        console.error('Logout error:', error);
        // Ensure local data is cleared even if HTTP call fails
        this.clearLocalAuthData();
        return throwError(() => error);
      })
    );
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('tokenExpiration');

    if (!token || !expiration) return false;

    return new Date(expiration) > new Date();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      catchError(error => {
        console.error('Profile error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to get user profile'));
      })
    );
  }

  private handleLoginSuccess(response: LoginResponse, email: string): void {
    // Store token and user data
    localStorage.setItem('token', response.token);
    localStorage.setItem('tokenExpiration', response.expiration);

    const user: User = {
      id: response.userId,
      email: email,
      name: response.name
    };

    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);

    // Set auto logout timer
    this.setAutoLogoutTimer(response.expiration);
  }

  private setAutoLogoutTimer(expiration: string): void {
    const expirationDuration = new Date(expiration).getTime() - Date.now();

    // Clear existing timer if any
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    this.tokenExpirationTimer = setTimeout(() => {
      this.logout().subscribe();
    }, expirationDuration);
  }

  private clearLocalAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);

    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }

  private getUserFromLocalStorage(): User | null {
    const userData = localStorage.getItem('currentUser');
    if (!userData) return null;

    try {
      return JSON.parse(userData) as User;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  }

  private getLoginErrorMessage(error: any): Error {
    if (error.error?.message) {
      return new Error(error.error.message);
    }
    if (error.status === 0) {
      return new Error('Network error: Please check your internet connection');
    }
    return new Error('Login failed: Please check your credentials');
  }
}
