import { Component } from '@angular/core';

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
    reportes: false
  };

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
}
