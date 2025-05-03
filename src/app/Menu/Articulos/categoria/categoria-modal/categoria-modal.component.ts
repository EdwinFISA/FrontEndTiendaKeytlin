import { Component, EventEmitter, Input, OnInit, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Categoria, EstadoUsuario } from '../../../../services/categoria.service';

@Component({
  selector: 'app-categoria-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './categoria-modal.component.html',
  styleUrls: ['./categoria-modal.component.css']
})
export class CategoriaModalComponent implements OnInit, OnChanges {
  @Input() categoria: Categoria | null = null;
  @Input() estados: EstadoUsuario[] = [];
  @Input() modoVista: boolean = false;
  @Input() modoEdicion: boolean = false;
  
  @Output() guardar = new EventEmitter<Categoria>();
  @Output() cerrar = new EventEmitter<void>();

  // Variables para el formulario
  nombreCategoria: string = '';
  descripcion: string = '';
  estadoId: number = 1;

  constructor() { }

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  ngOnChanges(): void {
    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    if (this.categoria) {
      this.nombreCategoria = this.categoria.categoriaNombre || '';
      this.descripcion = this.categoria.descripcion || '';
      this.estadoId = this.categoria.estadoUsuarioId || 1;
    } else {
      this.nombreCategoria = '';
      this.descripcion = '';
      this.estadoId = 1; // Estado por defecto (Activo)
    }
  }

  guardarCategoria(): void {
    if (!this.nombreCategoria.trim()) {
      alert('El nombre de la categoría es obligatorio');
      return;
    }
    
    const categoriaActualizada: Categoria = {
      id: this.categoria?.id || 0,
      categoriaNombre: this.nombreCategoria,
      descripcion: this.descripcion,
      estadoUsuarioId: this.estadoId,
      fechaCreacion: this.categoria?.fechaCreacion
    };
    
    this.guardar.emit(categoriaActualizada);
  }

  cancelar(): void {
    this.cerrar.emit();
  }

  getTitulo(): string {
    if (this.modoVista) return 'Ver Categoría';
    return (this.categoria?.id && this.categoria.id > 0) ? 'Editar Categoría' : 'Agregar categoría';
  }
}