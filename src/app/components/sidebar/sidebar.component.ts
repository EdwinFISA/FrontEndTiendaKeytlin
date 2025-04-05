import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';  // Importa el Router para la navegación

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  isDropdownOpen = {
    caja: false,
    productos: false,
    inventario: false,
    ventas: false,
    administracion: false,
    reportes: false,
    usuario: false  // Añadir el estado del dropdown del usuario
  };

  currentUser: any; 

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Obtener el usuario actual al inicializar
    this.currentUser = this.authService.currentUserValue;
  }
  
  toggleDropdown(menu: string): void {
    // Cerrar todos los desplegables
    Object.keys(this.isDropdownOpen).forEach(key => {
      if (key !== menu) {
        this.isDropdownOpen[key as keyof typeof this.isDropdownOpen] = false;
      }
    });

    // Alternar el estado del menú seleccionado
    this.isDropdownOpen[menu as keyof typeof this.isDropdownOpen] = !this.isDropdownOpen[menu as keyof typeof this.isDropdownOpen];
  }

  // Método para ir al perfil del usuario
  goToProfile(): void {
    this.router.navigate(['/home/perfil']);  // Ajusta la ruta según tu configuración
  }

  // Método para cerrar sesión
  logout(): void {
    this.authService.logout();  // Asegúrate de que el servicio de autenticación tenga un método de logout
    this.router.navigate(['/login']);  // Redirige al login después de cerrar sesión
  }
}
