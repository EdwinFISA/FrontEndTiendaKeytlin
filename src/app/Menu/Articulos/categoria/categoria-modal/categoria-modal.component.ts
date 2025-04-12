import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Categoria {
  Id?: number;
  Nombre?: string;
  Descripcion?: string;
  Estado?: string;
  fechaCreacion?: string;
}

@Component({
  selector: 'app-categoria-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categoria-modal.component.html',
  styleUrl: './categoria-modal.component.css',
})
export class CategoriaModalComponent {
  @Input() categoria: Categoria | null = null;
  @Input() modoVista: 'crear' | 'editar' | 'ver' = 'crear';
  
  @Output() guardar = new EventEmitter<Categoria>();
  @Output() cerrar = new EventEmitter<void>();

  nombreCategoria: string = '';
  descripcion: string = '';
  estado: string = 'Activo';

  ngOnInit() {
    if (this.categoria) {
      this.nombreCategoria = this.categoria.Nombre || '';
      this.descripcion = this.categoria.Descripcion || '';
      this.estado = this.categoria.Estado || 'Activo';
    }
  }

  guardarCategoria() {
    const categoriaActualizada: Categoria = {
      Id: this.categoria?.Id || 0,
      Nombre: this.nombreCategoria,
      Descripcion: this.descripcion,
      Estado: this.estado,
      fechaCreacion: this.categoria?.fechaCreacion
    };
    
    this.guardar.emit(categoriaActualizada);
  }

  cancelar() {
    this.cerrar.emit();
  }
}
