import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductoService } from '../../../../services/productos.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductosModalComponent } from '../productos-modal/productos-modal.component';
import { AuthService } from '../../../../services/auth.service';

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
  @ViewChild(ProductosModalComponent) productoModalComponent!: ProductosModalComponent;

  // Filtros
  filtroProducto = '';
  fechaInicio = '';
  fechaFin = '';

  // Paginación
  paginaActual = 1;
  elementosPorPagina = 10;

  // Permisos
  puedeCrear = false;
  puedeEditar = false;
  puedeEliminar = false;
  puedeVer = false;

  constructor(
    private productoService: ProductoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarPermisos();
  }

  cargarPermisos() {
    const permisos = this.authService.obtenerPermisos();
    this.puedeCrear = permisos.includes('Crear Productos');
    this.puedeEditar = permisos.includes('Editar Productos');
    this.puedeEliminar = permisos.includes('Eliminar Productos');
    this.puedeVer = permisos.includes('Ver Productos');
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
      p.codigoProducto.toLowerCase().includes(filtro)
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
      codigoProducto: '',
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
    this.productoSeleccionado = {
      id: producto.id || producto.Id,
      nombre: producto.nombre || producto.Nombre,
      codigoProducto: producto.codigoProducto || producto.CodigoProducto,
      marca: producto.marca || producto.Marca,
      descripcion: producto.descripcion || producto.Descripcion,
      precioAdquisicion: producto.precioAdquisicion || producto.PrecioAdquisicion,
      precioVenta: producto.precioVenta || producto.PrecioVenta,
      stock: producto.stock || producto.Stock,
      categoriaId: producto.categoriaId || producto.CategoriaId,
      proveedorId: producto.proveedorId || producto.ProveedorId,
      imagen: producto.imagen || producto.Imagen,
      estado: producto.estado ?? producto.Estado,
    };

    this.mostrarModal = true;
    this.modoVista = false;

    setTimeout(() => {
      if (this.productoSeleccionado.imagen) {
        const imagen = this.productoSeleccionado.imagen;
        this.productoModalComponent.imagenPrevia = imagen.startsWith('data:image')
          ? imagen
          : this.productoService.getImagenUrl(imagen);
      }
    });
  }

  verProducto(producto: any) {
    this.productoSeleccionado = {
      id: producto.id || producto.Id,
      nombre: producto.nombre || producto.Nombre,
      codigoProducto: producto.codigoProducto || producto.CodigoProducto,
      marca: producto.marca || producto.Marca,
      descripcion: producto.descripcion || producto.Descripcion,
      precioAdquisicion: producto.precioAdquisicion || producto.PrecioAdquisicion,
      precioVenta: producto.precioVenta || producto.PrecioVenta,
      stock: producto.stock || producto.Stock,
      categoriaId: producto.categoriaId || producto.CategoriaId,
      proveedorId: producto.proveedorId || producto.ProveedorId,
      imagen: producto.imagen || producto.Imagen,
      estado: producto.estado ?? producto.Estado,
    };

    this.modoVista = true;
    this.mostrarModal = true;

    setTimeout(() => {
      if (this.productoSeleccionado.imagen) {
        const imagen = this.productoSeleccionado.imagen;
        this.productoModalComponent.imagenPrevia = imagen.startsWith('data:image')
          ? imagen
          : this.productoService.getImagenUrl(imagen);
      }
    });
  }

  guardarProducto(producto: any) {
    const codigoExistente = this.originalProducto.find(p =>
      p.codigoProducto.toLowerCase() === producto.codigoProducto.toLowerCase() &&
      p.id !== this.productoSeleccionado?.id
    );

    if (codigoExistente) {
      Swal.fire({
        icon: 'warning',
        title: 'Código duplicado',
        text: `Ya existe un producto con el código "${producto.codigoProducto}".`
      });
      return;
    }

    const productoParaGuardar = {
      ...producto,
      id: this.productoSeleccionado?.id || 0,
      estadoId: producto.estadoId ?? true
    };

    console.log('Producto a enviar:', JSON.stringify(productoParaGuardar, null, 2));

    this.productoService.guardarProducto(productoParaGuardar).subscribe({
      next: () => {
        this.cargarProductos();
        this.cerrarModal();
        Swal.fire({
          icon: 'success',
          title: productoParaGuardar.id === 0 ? 'Producto creado' : 'Producto actualizado',
          text: 'La operación se ha realizado correctamente.'
        });
      },
      error: (error) => {
        console.error('Error al guardar producto:', error);
        let mensajeError = 'Error al guardar producto.';
        if (error.error?.errors) {
          mensajeError = Object.entries(error.error.errors)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join('\n');
        }
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensajeError
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
          error: () => {
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

 