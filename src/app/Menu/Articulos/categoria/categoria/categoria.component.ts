import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoriaModalComponent } from '../categoria-modal/categoria-modal.component';
import { CategoriaService, Categoria, EstadoUsuario } from '../../../../services/categoria.service';
import { AuthService } from '../../../../services/auth.service';

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
  estados: EstadoUsuario[] = [];
  mostrarModal: boolean = false;
  categoriaSeleccionada: Categoria | null = null;
  modoVista: boolean = false;
  modoEdicion: boolean = false;

  // Filtros
  filtroCategoria = '';
  fechaInicio: string = '';
  fechaFin: string = '';

  // Paginación
  paginaActual = 1;
  elementosPorPagina = 10;

  // Variables de Permisos
  puedeCrear: boolean = false;
  puedeEditar: boolean = false;
  puedeEliminar: boolean = false;
  puedeVer: boolean = false;

  constructor(
    private categoriaService: CategoriaService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarEstados();
    this.cargarPermisos();
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

  cargarEstados() {
    this.categoriaService.obtenerEstados().subscribe({
      next: (data) => {
        this.estados = data;
      },
      error: (error) => {
        console.error('Error al cargar estados:', error);
      }
    });
  }

  cargarPermisos() {
    const permisos = this.authService.obtenerPermisos(); // o donde guardes los permisos del usuario
  
    this.puedeCrear = permisos.includes('Crear Categorías');
    this.puedeEditar = permisos.includes('Editar Categorías');
    this.puedeEliminar = permisos.includes('Eliminar Categorías');
    this.puedeVer = permisos.includes('Ver Categorías');
  }

  buscarCategoria() {
    if (!this.filtroCategoria.trim()) {
      this.categorias = [...this.originalCategorias];
      return;
    }

    const filtro = this.filtroCategoria.toLowerCase();
    this.categorias = this.originalCategorias.filter(categoria =>
      categoria.categoriaNombre?.toLowerCase().includes(filtro) ||
      categoria.descripcion?.toLowerCase().includes(filtro)
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
    // Buscar el estado "Activo" por defecto
    const estadoActivo = this.estados.find(e => e.nombre === 'Activo');
    
    this.categoriaSeleccionada = {
      id: 0,
      categoriaNombre: '',
      descripcion: '',
      estadoUsuarioId: estadoActivo?.id || 1
    };
    this.mostrarModal = true;
    this.modoVista = false;
    this.modoEdicion = false;
  }

  abrirModalEditar(categoria: Categoria) {
    this.categoriaSeleccionada = { ...categoria };
    this.mostrarModal = true;
    this.modoVista = false;
    this.modoEdicion = true;
  }

  verCategoria(categoria: Categoria) {
    this.categoriaSeleccionada = { ...categoria };
    this.modoVista = true;
    this.mostrarModal = true;
    this.modoEdicion = false;
  }

  guardarCategoria(categoria: Categoria) {
    this.categoriaService.guardarCategoria(categoria).subscribe({
      next: () => {
        this.cargarCategorias();
        this.cerrarModal();
        Swal.fire({
          icon: 'success',
          title: categoria.id ? 'Categoría actualizada' : 'Categoría creada',
          text: categoria.id ? 'Se actualizó correctamente.' : 'Se creó correctamente.'
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
      title: '¿Está seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoriaService.eliminarCategoria(id).subscribe({
          next: () => {
            this.cargarCategorias();
            Swal.fire(
              '¡Eliminado!',
              'La categoría ha sido eliminada.',
              'success'
            );
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error.message || 'Error al eliminar categoría.'
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