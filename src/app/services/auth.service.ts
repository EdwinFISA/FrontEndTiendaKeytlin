import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginModel {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  userName: string;
  userApellido: string;
  userEmail: string;
  userRole: string;
  userPermissions: string[];
}

export interface User {
  id: number;
  email: string;
  name: string;
  apellido: string;
  role: string;
  permisos?: string[];
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
      tap(response => {
        console.log('Login response:', response); // Agregar para debug
        this.handleLoginSuccess(response);
      }),
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
    
    if (!token) return false;
    
    // En una aplicación real, también deberías validar la expiración del token
    try {
      // Verificar si el token no está expirado usando fecha de expiración almacenada
      const expiration = localStorage.getItem('tokenExpiration');
      if (expiration) {
        return new Date(expiration) > new Date();
      }
      return true;
    } catch (e) {
      console.error('Error al verificar la autenticación:', e);
      return false;
    }
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

  private handleLoginSuccess(response: LoginResponse): void {
    console.log('Handling login success:', response);
    
    // Store token
    localStorage.setItem('token', response.token);
    
    // Extraer fecha de expiración del token (opcional, pero útil)
    try {
      // Si usas JWT, puedes decodificarlo para obtener la expiración
      const payload = JSON.parse(atob(response.token.split('.')[1]));
      const expirationDate = new Date(payload.exp * 1000).toISOString();
      localStorage.setItem('tokenExpiration', expirationDate);
      console.log('Token expiration set:', expirationDate);
    } catch (e) {
      console.error('Error extracting token expiration:', e);
      // Si no puedes extraer la expiración, establece un tiempo predeterminado (24h)
      const expirationDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString();
      localStorage.setItem('tokenExpiration', expirationDate);
    }

    // Store user data
    const user: User = {
      id: response.userId,
      email: response.userEmail,
      name: response.userName,
      apellido: response.userApellido,
      role: response.userRole,
      permisos: response.userPermissions
    };

    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);

     // Almacenar permisos por separado para acceso rápido
  localStorage.setItem('userPermissions', JSON.stringify(response.userPermissions));

    // Set auto logout timer
    const expiration = localStorage.getItem('tokenExpiration');
    if (expiration) {
      this.setAutoLogoutTimer(expiration);
    }
    
    console.log('Login completed successfully, user stored:', user);
  }

  // Añadir método para verificar permisos
hasPermission(permissionName: string): boolean {
  // Verificar si el usuario está autenticado
  if (!this.isAuthenticated()) {
    return false;
  }

  // Obtener permisos del localStorage
  const permissionsString = localStorage.getItem('userPermisos');
  if (!permissionsString) {
    return false;
  }

  try {
    const permissions: string[] = JSON.parse(permissionsString);
    return permissions.includes(permissionName);
  } catch (error) {
    console.error('Error parsing permisos:', error);
    return false;
  }
}

  private setAutoLogoutTimer(expiration: string): void {
    const expirationDate = new Date(expiration);
    const expirationDuration = expirationDate.getTime() - Date.now();

    console.log(`Setting auto logout timer for ${expirationDuration}ms (${new Date(Date.now() + expirationDuration)})`);

    // Clear existing timer if any
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    this.tokenExpirationTimer = setTimeout(() => {
      console.log('Auto logout triggered');
      this.logout().subscribe();
    }, expirationDuration);
  }

  private clearLocalAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userPermissions'); 
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
      return new Error('Network error: Compruebe su Conexión a internet');
    }
    return new Error('Login failed: Compruebe su Correo o Contraseña');
  }
  enviarCodigoRecuperacion(correo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/recuperar-contrasena`, JSON.stringify(correo), {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(error => {
        // Verificar si el error es un HTTP error real
        console.error('Error en la solicitud:', error);
        return throwError(error); // Retornar el error para que se pueda manejar en el componente
      })
    );
  }
  
  verificarCodigoRecuperacion(correo: string, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verificar-codigo-recuperacion`, {
      correo: correo,
      codigo: codigo
    }).pipe(
      catchError((error) => {
        // Si hay un error real (status diferente a 200), lo gestionamos.
        return throwError(error);
      })
    );
  }
  
  cambiarContrasena(correo: string, nuevaContrasena: string, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      correo: correo,
      newContrasena: nuevaContrasena,
      verificationCode: codigo
    });
  }


  
}