import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    
    console.log('AuthGuard: Checking authentication...');
    
    if (this.authService.isAuthenticated()) {
      console.log('AuthGuard: User is authenticated');
      return true;
    }

    console.log('AuthGuard: User is NOT authenticated, redirecting to login');
    // Redirigir al login si no está autenticado
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}