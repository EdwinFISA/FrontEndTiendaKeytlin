import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

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
    usuario: false
  };

  currentUser: any;

  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef;

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
  }

  toggleDropdown(menu: string): void {
    Object.keys(this.isDropdownOpen).forEach(key => {
      if (key !== menu) {
        this.isDropdownOpen[key as keyof typeof this.isDropdownOpen] = false;
      }
    });

    this.isDropdownOpen[menu as keyof typeof this.isDropdownOpen] = !this.isDropdownOpen[menu as keyof typeof this.isDropdownOpen];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (
      this.isDropdownOpen.usuario &&
      this.dropdownContainer &&
      !this.dropdownContainer.nativeElement.contains(event.target)
    ) {
      this.isDropdownOpen.usuario = false;
    }
  }

  goToProfile(): void {
    this.router.navigate(['/home/perfil']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
