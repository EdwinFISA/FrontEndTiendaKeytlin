import { Component, OnInit, ViewChild } from '@angular/core';
import { PedidoService } from '../../../../services/pedido.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PedidosModalComponent } from '../pedidos-modal/pedidos-modal.component';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.css',
  imports: [FormsModule, CommonModule, PedidosModalComponent]
})
export class PedidosComponent implements OnInit {
  pedidos: any[] = [];
  originalPedidos: any[] = [];
  mostrarModal = false;
  pedidoSeleccionado: any = null;
  modoVista = false;
  @ViewChild(PedidosModalComponent) pedidosModalComponent!: PedidosModalComponent;

  // Filtros
  filtroPedido = '';
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
    private pedidoService: PedidoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarPedidos();
    this.cargarPermisos();
  }

  cargarPermisos() {
    const permisos = this.authService.obtenerPermisos();
    this.puedeCrear = permisos.includes('Crear Pedidos');
    this.puedeEditar = permisos.includes('Editar Pedidos');
    this.puedeEliminar = permisos.includes('Eliminar Pedidos');
    this.puedeVer = permisos.includes('Ver Pedidos');
  }

  cargarPedidos() {
    this.pedidoService.obtenerPedidos().subscribe({
      next: (data) => {
        console.log('Datos recibidos del backend:', data);
        this.originalPedidos = data.map(pedido => this.normalizarPedido(pedido));
        this.pedidos = [...this.originalPedidos];
        
        // Cargar nombres de productos faltantes
        this.cargarNombresProductosFaltantes();
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar pedidos',
          text: error.message || 'Hubo un problema al cargar los pedidos.'
        });
      }
    });
  }

  private cargarNombresProductosFaltantes(): void {
    // Obtener todos los productos para llenar los nombres faltantes
    this.pedidoService.obtenerProductos?.()?.subscribe?.({
      next: (productos) => {
        this.originalPedidos.forEach(pedido => {
          if (pedido.detalles && pedido.detalles.length > 0) {
            pedido.detalles.forEach((detalle: any) => {
              if (!detalle.nombreProducto && detalle.productoId) {
                const producto = productos.find((p: any) => p.id === detalle.productoId);
                if (producto) {
                  detalle.nombreProducto = pedido.nombre;
                  detalle.producto = {
                    id: pedido.id,
                    nombre: pedido.nombre
                  };
                }
              }
            });
          }
        });
        
        // Actualizar la lista filtrada también
        this.pedidos = [...this.originalPedidos];
      },
      error: (error) => {
        console.warn('No se pudieron cargar los productos:', error);
        // Si el servicio de pedidos no tiene obtenerProductos, intentar con el servicio de productos
        // Esto requeriría inyectar ProductoService, pero por ahora dejamos el warning
      }
    });
  }

  private normalizarPedido(pedido: any): any {
    console.log('Pedido crudo recibido:', pedido);
    
    // Normalizar detalles del pedido
    const detallesNormalizados = this.normalizarDetalles(pedido.detalles || pedido.Detalles || pedido.detallePedidos || []);
    
    return {
      id: pedido.id || pedido.Id,
      numeroPedido: pedido.numeroPedido || pedido.NumeroPedido || pedido.codigo,
      totalPedido: pedido.totalPedido || pedido.TotalPedido || pedido.total || this.calcularTotalPedido(detallesNormalizados),
      fechaPedido: pedido.fechaPedido || pedido.FechaPedido,
      descripcion: pedido.descripcion || pedido.Descripcion || '',
      proveedorId: pedido.proveedorId || pedido.ProveedorId,
      estadoPedidoId: pedido.estadoPedidoId || pedido.EstadoPedidoId,
      detalles: detallesNormalizados,
      proveedor: this.normalizarProveedor(pedido.proveedor || pedido.Proveedor),
      estado: this.normalizarEstado(pedido.estado || pedido.Estado || pedido.estadoPedido)
    };
  }

  private normalizarDetalles(detalles: any[]): any[] {
    if (!Array.isArray(detalles)) return [];
    
    return detalles.map(detalle => ({
      id: detalle.id || detalle.Id,
      productoId: detalle.productoId || detalle.ProductoId,
      cantidad: detalle.cantidad || detalle.Cantidad || 0,
      precioUnitario: detalle.precioUnitario || detalle.PrecioUnitario || 
                     detalle.precioAdquisicion || detalle.PrecioAdquisicion || 0,
      precioAdquisicion: detalle.precioAdquisicion || detalle.PrecioAdquisicion || 
                        detalle.precioUnitario || detalle.PrecioUnitario || 0,
      subtotal: detalle.subtotal || detalle.Subtotal || this.calcularSubtotal(detalle),
      nombreProducto: detalle.nombreProducto || detalle.NombreProducto || 
                     (detalle.producto && (detalle.producto.nombre || detalle.producto.Nombre)) ||
                     (detalle.Producto && (detalle.Producto.nombre || detalle.Producto.Nombre)) || '',
      producto: this.normalizarProducto(detalle.producto || detalle.Producto)
    }));
  }

  private normalizarProducto(producto: any): any {
    if (!producto) return null;
    return {
      id: producto.id || producto.Id,
      nombre: producto.nombre || producto.Nombre || ''
    };
  }

  private calcularSubtotal(detalle: any): number {
    const cantidad = detalle.cantidad || detalle.Cantidad || 0;
    const precio = detalle.precioUnitario || detalle.PrecioUnitario || 
                  detalle.precioAdquisicion || detalle.PrecioAdquisicion || 0;
    return cantidad * precio;
  }

  private normalizarProveedor(proveedor: any): any {
    if (!proveedor) return null;
    return {
      id: proveedor.id || proveedor.Id,
      nombre: proveedor.nombre || proveedor.Nombre || '',
      nombreContacto: proveedor.nombreContacto || proveedor.NombreContacto || ''
    };
  }

  private normalizarEstado(estado: any): any {
    if (!estado) return null;
    return {
      id: estado.id || estado.Id,
      nombre: estado.nombre || estado.Nombre || ''
    };
  }

  private calcularTotalPedido(detalles: any[]): number {
    return detalles.reduce((total: number, detalle: any) => {
      return total + (detalle.subtotal || this.calcularSubtotal(detalle));
    }, 0);
  }

  buscarPedido() {
    if (!this.filtroPedido.trim()) {
      this.pedidos = [...this.originalPedidos];
      return;
    }

    const filtro = this.filtroPedido.toLowerCase();
    this.pedidos = this.originalPedidos.filter(p =>
      (p.numeroPedido && p.numeroPedido.toString().toLowerCase().includes(filtro)) ||
      (p.id && p.id.toString().includes(filtro))
    );
    this.paginaActual = 1;
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
    fin.setHours(23, 59, 59, 999);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas inválidas',
        text: 'Por favor ingrese fechas válidas.'
      });
      return;
    }

    if (inicio > fin) {
      Swal.fire({
        icon: 'warning',
        title: 'Rango de fechas inválido',
        text: 'La fecha de inicio debe ser anterior o igual a la fecha final.'
      });
      return;
    }

    this.pedidos = this.originalPedidos.filter(p => {
      const fecha = new Date(p.fechaPedido);
      return fecha >= inicio && fecha <= fin;
    });
    this.paginaActual = 1;
  }

  pedidosPaginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.pedidos.slice(inicio, fin);
  }

  totalPaginas(): number {
    return Math.ceil(this.pedidos.length / this.elementosPorPagina);
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

  calcularCantidadTotal(detalles: any[]): number {
    if (!detalles || detalles.length === 0) return 0;
    return detalles.reduce((total, detalle) => {
      return total + (detalle.cantidad || 0);
    }, 0);
  }

  abrirModalCrear() {
    this.pedidoSeleccionado = {
      detalles: [],
      fechaPedido: new Date().toISOString().split('T')[0]
    };
    this.mostrarModal = true;
    this.modoVista = false;
  }

  abrirModalEditar(pedido: any) {
    console.log('Abriendo modal editar con pedido:', pedido);
    
    // Crear una copia profunda del pedido normalizado
    this.pedidoSeleccionado = {
      id: pedido.id,
      numeroPedido: pedido.numeroPedido,
      totalPedido: pedido.totalPedido,
      fechaPedido: pedido.fechaPedido,
      descripcion: pedido.descripcion || '',
      proveedorId: pedido.proveedorId,
      estadoPedidoId: pedido.estadoPedidoId,
      detalles: pedido.detalles ? [...pedido.detalles] : [],
      proveedor: pedido.proveedor,
      estado: pedido.estado
    };

    console.log('Pedido seleccionado para editar:', this.pedidoSeleccionado);
    
    this.mostrarModal = true;
    this.modoVista = false;
  }

  verPedido(pedido: any) {
    console.log('Abriendo modal ver con pedido:', pedido);
    
    // Crear una copia profunda del pedido normalizado
    this.pedidoSeleccionado = {
      id: pedido.id,
      numeroPedido: pedido.numeroPedido,
      totalPedido: pedido.totalPedido,
      fechaPedido: pedido.fechaPedido,
      descripcion: pedido.descripcion || '',
      proveedorId: pedido.proveedorId,
      estadoPedidoId: pedido.estadoPedidoId,
      detalles: pedido.detalles ? [...pedido.detalles] : [],
      proveedor: pedido.proveedor,
      estado: pedido.estado,
      subtotal: pedido.subtotal || 0
    };

    console.log('Pedido seleccionado para ver:', this.pedidoSeleccionado);
    
    this.modoVista = true;
    this.mostrarModal = true;
  }

  guardarPedido(pedido: any) {
    this.cargarPedidos();
    this.cerrarModal();
  }

  eliminarPedidoLogico(id: number) {
    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar pedido?',
      text: 'Esta acción Cancelara el pedido.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.pedidoService.eliminarPedidoLogico(id).subscribe({
          next: () => {
            this.cargarPedidos();
            Swal.fire({
              icon: 'success',
              title: 'Pedido eliminado',
              text: 'El pedido ha sido desactivado correctamente.'
            });
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el pedido.'
            });
          }
        });
      }
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.pedidoSeleccionado = null;
  }
}