import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../../../services/productos.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductosModalComponent } from '../productos-modal/productos-modal.component';


@Component({
  selector: 'app-productos',
  standalone: true,
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css',
  imports: [FormsModule, CommonModule, ProductosModalComponent]
})

export class ProductosComponent implements OnInit {
  productos: any[] = [];
  originalProducto: any[] = [];
  mostrarModal = false;
  productoSeleccionado: any = null;
  modoVista = false;

  // Filtros
  filtroProducto = '';
  fechaInicio = '';
  fechaFin = '';

  // Paginación
  paginaActual = 1;
  elementosPorPagina = 10;

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productoService.obtenerProductos().subscribe({
      next: (data) => {
        this.originalProducto = data;
        this.productos = [...data];
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar productos',
          text: error.message || 'Hubo un problema al cargar los productos.'
        });
      }
    });
  }

  buscarProducto() {
    if (!this.filtroProducto.trim()) {
      this.productos = [...this.originalProducto];
      return;
    }

    const filtro = this.filtroProducto.toLowerCase();
    this.productos = this.originalProducto.filter(p =>
      p.nombre.toLowerCase().includes(filtro) ||
      p.codigo.toLowerCase().includes(filtro)
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

    this.productos = this.originalProducto.filter(p => {
      const fecha = new Date(p.fechaCreacion);
      return fecha >= inicio && fecha <= fin;
    });
  }

  productosPaginados(): any[] {
    return this.productos.slice(
      (this.paginaActual - 1) * this.elementosPorPagina,
      this.paginaActual * this.elementosPorPagina
    );
  }

  totalPaginas(): number {
    return Math.ceil(this.productos.length / this.elementosPorPagina);
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
    this.productoSeleccionado = {
      id: 0,
      nombre: '',
      codigo: '',
      estado: 'Activo',
      precioAdquisicion: 0,
      precioVenta: 0,
      imagen: '',
      fechaCreacion: new Date().toISOString()
    };
    this.mostrarModal = true;
    this.modoVista = false;
  }

  abrirModalEditar(producto: any) {
    this.productoSeleccionado = { ...producto };
    this.modoVista = false;
    this.mostrarModal = true;
  }

  verProducto(producto: any) {
    this.productoSeleccionado = { ...producto };
    this.modoVista = true;
    this.mostrarModal = true;
  }

  guardarProducto(producto: any) {
    this.productoService.guardarProducto(producto).subscribe({
      next: () => {
        this.cargarProductos();
        this.cerrarModal();
        Swal.fire({
          icon: 'success',
          title: producto.id === 0 ? 'Producto creado' : 'Producto actualizado',
          text: 'La operación se ha realizado correctamente.'
        });
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al guardar el producto.'
        });
      }
    });
  }

  eliminarProductoLogico(id: number) {
    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar producto?',
      text: 'Esta acción desactivará el producto.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productoService.eliminarProductoLogico(id).subscribe({
          next: () => {
            this.cargarProductos();
            Swal.fire({
              icon: 'success',
              title: 'Producto eliminado',
              text: 'El producto ha sido desactivado correctamente.'
            });
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el producto.'
            });
          }
        });
      }
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.productoSeleccionado = null;
  }
}
