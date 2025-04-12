import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoriaModalComponent } from '../categoria-modal/categoria-modal.component';
import { CategoriaService } from '../../../../services/categoria.service';

interface Categoria {
  Id?: number;
  Nombre?: string;
  Descripcion?: string;
  Estado?: string;
  fechaCreacion?: string;
}

@Component({
  selector: 'app-categoria',
  standalone: true,
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.css'],
  imports: [FormsModule, CommonModule, CategoriaModalComponent]
})
export class CategoriaComponent implements OnInit {
  categorias: Categoria[] = [];
  originalCategorias: Categoria[] = [];
  mostrarModal: boolean  = false;
  categoriaSeleccionada: Categoria | null = null;
  modoVista: boolean = false;
  modoEdicion: boolean = false;
 // modoVista: 'crear' | 'editar' = 'crear';

  // Filtros
  filtroCategoria = '';
  fechaInicio: string = '';
  fechaFin: string = '';

  // Paginación
  paginaActual = 1;
  elementosPorPagina = 10;

  constructor(private categoriaService: CategoriaService) { }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.categoriaService.obtenerCategorias().subscribe({
      next: (data) => {
        this.originalCategorias = data;
        this.categorias = [...data];
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar categorías',
          text: error.message || 'Hubo un problema al cargar las categorías.'
        });
      }
    });
  }

  buscarCategoria() {
    if (!this.filtroCategoria.trim()) {
      this.categorias = [...this.originalCategorias];
      return;
    }

    const filtro = this.filtroCategoria.toLowerCase();
    this.categorias = this.originalCategorias.filter(categoria =>
      categoria.Nombre?.toLowerCase().includes(filtro) ||
      categoria.Descripcion?.toLowerCase().includes(filtro)
    );
  }

  filtrarPorFecha() {
    if (!this.fechaInicio || !this.fechaFin) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas incompletas',
        text: 'Por favor seleccione ambas fechas.'
      });
      return;
    }

    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas inválidas',
        text: 'Por favor ingrese fechas válidas.'
      });
      return;
    }

    this.categorias = this.originalCategorias.filter(categoria => {
      const fecha = new Date(categoria.fechaCreacion || '');
      return fecha >= inicio && fecha <= fin;
    });
  }

  categoriasPaginadas(): Categoria[] {
    return this.categorias.slice(
      (this.paginaActual - 1) * this.elementosPorPagina,
      this.paginaActual * this.elementosPorPagina
    );
  }

  totalPaginas(): number {
    return Math.ceil(this.categorias.length / this.elementosPorPagina);
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas()) {
      this.paginaActual++;
    }
  }

  abrirModalCrear() {
    this.categoriaSeleccionada = {
      Id: 0,
      Nombre: '',
      Descripcion: '',
      Estado: 'Activo'
    };
    this.mostrarModal = true;
    this.modoVista = false;
  }

  abrirModalEditar(categoria: Categoria) {
    this.categoriaSeleccionada = { ...categoria };
    this.mostrarModal = true;
    this.modoVista = false;
  }

  verCategoria(categoria: Categoria) {
    this.categoriaSeleccionada = { ...categoria };
    this.modoVista = true;
    this.mostrarModal = true;
  }

  guardarCategoria(categoria: Categoria) {
    const nuevaCategoria = {
      ...categoria,
      Id: this.categoriaSeleccionada?.Id || 0
    };

    this.categoriaService.guardarCategoria(nuevaCategoria).subscribe({
      next: () => {
        this.cargarCategorias();
        this.cerrarModal();
        Swal.fire({
          icon: 'success',
          title: nuevaCategoria.Id ? 'Categoría actualizada' : 'Categoría creada',
          text: nuevaCategoria.Id ? 'Se actualizó correctamente.' : 'Se creó correctamente.'
        });
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Error al guardar categoría.'
        });
      }
    });
  }

  eliminarCategoria(id: number) {
    Swal.fire({
      icon: 'warning',
      title: 'Confirmar eliminación',
      text: '¿Está seguro de eliminar esta categoría?',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoriaService.eliminarCategoria(id).subscribe({
          next: () => {
            this.cargarCategorias();
            Swal.fire({
              icon: 'success',
              title: 'Categoría eliminada',
              text: 'La categoría ha sido eliminada con éxito.'
            });
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Hubo un problema al eliminar la categoría.'
            });
          }
        });
      }
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.categoriaSeleccionada = null;
  }
}
