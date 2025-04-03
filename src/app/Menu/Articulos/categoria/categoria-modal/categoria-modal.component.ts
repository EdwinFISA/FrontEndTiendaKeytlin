import { Component } from '@angular/core';

@Component({
  selector: 'app-categoria-modal',
  standalone: false,
  templateUrl: './categoria-modal.component.html',
  styleUrl: './categoria-modal.component.css',
  
})
export class CategoriaModalComponent {
  nombreCategoria: string = '';
  descripcion: string = '';

  guardarCategoria() {
    console.log('Categoría guardada:', this.nombreCategoria, this.descripcion);
  }
 
  cancelar() {
    this.nombreCategoria = '';
    this.descripcion = '';

  }
}
