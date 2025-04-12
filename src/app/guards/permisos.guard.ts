import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class PermisosGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): boolean {

        const requiredPermission = route.data['requiredPermission'] as string;

        if (!this.authService.isAuthenticated()) {
            console.log('PermisosGuard: User is not authenticated, redirecting to login');
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            return false;
        }

        if (!requiredPermission || this.authService.hasPermission(requiredPermission)) {
            console.log(`PermisosGuard: User has permission '${requiredPermission}' or no permission required`);
            return true;
        }

        console.log(`PermisosGuard: User does not have required permission '${requiredPermission}'`);
        // Redirigir a página de acceso denegado
        this.router.navigate(['/access-denied']);
        return false;
    }
}