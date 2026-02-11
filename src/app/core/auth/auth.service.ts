import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { User, LoginRequest, LoginResponse } from '../../shared/models/user.model';

interface JwtPayload {
  sub: string;
  roles: string[];
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = 'http://localhost:3000';
  private readonly TOKEN_KEY = 'housemate_token';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor() {
    this.loadUserFromToken();
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token && this.hasValidToken()) {
      // In a real app, you'd fetch user details from the server
      // For now, we'll decode from token
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        // Fetch user details from server using the ID
        this.http.get<User>(`${this.API_URL}/users/${decoded.sub}`).subscribe({
          next: (user) => {
            this.currentUserSubject.next(user);
            this.isLoggedInSubject.next(true);
          },
          error: () => {
            this.logout();
          }
        });
      } catch {
        this.logout();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Mock login - in real app this would be a POST to /auth/login
    const params = { phone: credentials.phone };
    return this.http.get<User[]>(`${this.API_URL}/users`, { params }).pipe(
      map(users => {
        const user = users.find(u => u.password === credentials.password);
        if (!user) {
          throw new Error('Invalid credentials');
        }

        // Mock JWT token
        const token = this.createMockToken(user);
        return { token, user };
      }),
      tap(response => {
        this.setToken(response.token);
        this.currentUserSubject.next(response.user);
        this.isLoggedInSubject.next(true);
      })
    );
  }

  private createMockToken(user: User): string {
    // In a real app, this would come from the server
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sub: user.id,
      roles: user.roles,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
    };

    // Helper to base64url encode
    const base64UrlEncode = (str: string) => {
      return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signature = 'mocksignature';

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.roles || [];
    } catch {
      return [];
    }
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }
}

