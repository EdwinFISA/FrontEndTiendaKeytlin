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
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AuthGuard: Checking authentication...');

    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      console.log('AuthGuard: User is NOT authenticated, redirecting to login');
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    console.log('AuthGuard: User is authenticated');

    // Verificar si se requiere un permiso para esta ruta
    const permisoRequerido = route.data['permiso'];
    if (permisoRequerido) {
      const tienePermiso = this.authService.tienePermiso(permisoRequerido);
      console.log(`AuthGuard: Checking permiso '${permisoRequerido}' => ${tienePermiso}`);

      if (!tienePermiso) {
        console.log('AuthGuard: User does NOT have required permission, redirecting to no-autorizado');
        this.router.navigate(['/no-autorizado']);
        return false;
      }
    }

    // Si no hay permiso requerido o el usuario lo tiene, permitir el acceso
    return true;
  }
}
