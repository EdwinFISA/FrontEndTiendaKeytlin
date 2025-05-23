import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule, DOCUMENT } from '@angular/common';
import { PedidoService } from '../../../../services/pedido.service';
import { ProductoService } from '../../../../services/productos.service';
import { Proveedor, ProveedorService } from '../../../../services/proveedor.service';
import Swal from 'sweetalert2';

export interface Pedido {
  id?: number;
  numeroPedido?: string;
  productoId?: number;
  cantidadPedido?: number;
  precioAdquisicion?: number;
  totalPedido?: number;
  fechaPedido?: Date | string;
  descripcion?: string;
  proveedorId?: number;
  productosId?: number;
  estadoPedidoId?: number;
  detalles?: any[];
  proveedor?: Proveedor;
  estado?: any;
}

export interface DetallePedido {
  id?: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal?: number;
  nombreProducto?: string;
  producto?: {
    id: number;
    nombre: string;
  };
}

@Component({
  selector: 'app-pedidos-modal',
  standalone: true,
  templateUrl: './pedidos-modal.component.html',
  styleUrls: ['./pedidos-modal.component.css'],
  imports: [FormsModule, CommonModule]
})

export class PedidosModalComponent implements OnInit {
@Input() pedido: Pedido = { 
  detalles: [], 
  estadoPedidoId: 1 // o el valor por defecto que corresponda
};
  @Input() modoVista: boolean = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<Pedido>();
  @ViewChild('pedidoForm') pedidoForm!: NgForm;

  cargando = false;
  productos: any[] = [];
  proveedores: Proveedor[] = [];
  estados: any[] = [];
  fechaFormateada: string = '';
  puedeGuardar: boolean = false;

  


  constructor(
    private pedidoService: PedidoService,
    private productoService: ProductoService,
    private proveedorService: ProveedorService,
    @Inject(DOCUMENT) private document: Document
  ) {}

ngOnInit(): void {
  this.cargarDatos();
  this.formatearFecha();

  if (!this.pedido.id && !this.pedido.numeroPedido) {
    this.generarNumeroPedido();
  }

  // Inicializar detalles si no existen
  if (!this.pedido.detalles) {
    this.pedido.detalles = [];
  }
  
  this.actualizarEstadoBotonGuardar();
}

  generarNumeroPedido(): void {
    const fecha = new Date();
    const timestamp = fecha.getTime();
    this.pedido.numeroPedido = 'PED-' + timestamp;
  }

  formatearFecha(): void {
    const fecha = this.pedido.fechaPedido ? new Date(this.pedido.fechaPedido) : new Date();
    this.fechaFormateada = fecha.toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
    this.pedido.fechaPedido = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  cargarDatos(): void {
    this.productoService.obtenerProductos().subscribe(productos => {
      this.productos = productos;
    });

    this.pedidoService.obtenerProveedores().subscribe(proveedores => {
      this.proveedores = proveedores;
      if (!this.pedido.id && proveedores.length > 0) {
        this.pedido.proveedorId = proveedores[0].id;
      }
    });

    this.pedidoService.obtenerEstados().subscribe(estados => {
      this.estados = estados;
      if (!this.pedido.id && estados.length > 0) {
        const estadoPendiente = estados.find(e => e.Nombre?.toLowerCase() === 'pendiente');
        if (estadoPendiente) {
          this.pedido.estadoPedidoId = estadoPendiente.Id;
        }
      }
    });
  }

agregarProductoAlPedido(): void {
    if (!this.pedido.productoId || !this.pedido.cantidadPedido || !this.pedido.precioAdquisicion) {
        Swal.fire('Campos requeridos', 'Completa producto, cantidad y precio antes de agregar.', 'warning');
        return;
    }

    const productoInfo = this.productos.find(p => p.id === this.pedido.productoId);
    if (!productoInfo) {
        Swal.fire('Error', 'Producto no encontrado.', 'error');
        return;
    }

    const subtotal = this.pedido.cantidadPedido * this.pedido.precioAdquisicion;
    
    // Asegurar que detalles existe
    if (!this.pedido.detalles) {
        this.pedido.detalles = [];
    }

    // Verificar si el producto ya existe en los detalles
    const productoExistenteIndex = this.pedido.detalles.findIndex(
        detalle => detalle.productoId === this.pedido.productoId
    );

    const nuevoDetalle = {
        productoId: this.pedido.productoId,
        nombreProducto: productoInfo.nombre,
        cantidad: this.pedido.cantidadPedido,
        precioUnitario: this.pedido.precioAdquisicion,
        precioAdquisicion: this.pedido.precioAdquisicion,
        subtotal: subtotal,
        producto: {
            id: productoInfo.id,
            nombre: productoInfo.nombre
        }
    };

    if (productoExistenteIndex >= 0) {
        // Actualizar producto existente
        this.pedido.detalles[productoExistenteIndex] = nuevoDetalle;
    } else {
        // Agregar nuevo producto
        this.pedido.detalles.push(nuevoDetalle);
    }

    console.log('Producto agregado. Detalles actualizados:', this.pedido.detalles);

    // Limpiar campos del pedido
    this.pedido.productoId = undefined;
    this.pedido.cantidadPedido = undefined;
    this.pedido.precioAdquisicion = undefined;
    
    // Actualizar estado del botón guardar
    this.actualizarEstadoBotonGuardar();
}

  editarProductoPedido(index: number): void {
    const producto = this.pedido.detalles![index];
    this.pedido.productoId = producto.productoId;
    this.pedido.cantidadPedido = producto.cantidad;
    this.pedido.precioAdquisicion = producto.precioAdquisicion;
    this.pedido.detalles!.splice(index, 1);

    this.actualizarEstadoBotonGuardar();
  }

eliminarProductoPedido(index: number): void {
  Swal.fire({
    title: '¿Eliminar producto?',
    text: '¿Estás seguro de que quieres eliminar este producto del pedido?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#070826',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.pedido.detalles!.splice(index, 1);
      this.actualizarEstadoBotonGuardar();
      Swal.fire('Eliminado', 'El producto ha sido eliminado del pedido', 'success');
    }
  });
}

async onSubmit(): Promise<void> {
  // Primero verificar si hay productos agregados


    // Luego verificar el resto del formulario


    if (this.cargando) return;

    if (!await this.validarFormulario()) {
      this.marcarCamposComoTocados();
      return;
    }

    this.cargando = true;

    try {
      this.pedido.totalPedido = this.pedido.detalles?.reduce((total, detalles) => total + (detalles.subtotal || 0), 0) || 0;

      const pedidoParaGuardar = {
        ...this.pedido,
        productos: this.pedido.detalles?.map(producto => ({
          productoId: producto.productoId,
          cantidad: producto.cantidad,
          precioAdquisicion: producto.precioAdquisicion
        }))
      };

      if (this.pedido.id) {
        await this.pedidoService.actualizarPedido(this.pedido.id, pedidoParaGuardar).toPromise();
      } else {
        await this.pedidoService.crearPedido(pedidoParaGuardar).toPromise();
      }

      Swal.fire('Éxito', 'El pedido se ha guardado correctamente', 'success');
      this.guardar.emit(pedidoParaGuardar);
      this.cerrarModal();
    } catch (error) {
      console.error('Error al guardar el pedido:', error);
      Swal.fire('Error', 'No se pudo guardar el pedido', 'error');
    } finally {
      this.cargando = false;
    }
  }

  private async validarFormulario(): Promise<boolean> {
    const camposRequeridos = [
      { campo: this.pedido.fechaPedido, mensaje: 'La fecha del pedido es requerida' },
      { campo: this.pedido.proveedorId, mensaje: 'El proveedor es requerido' },
      { campo: this.pedido.estadoPedidoId, mensaje: 'El estado del pedido es requerido' }
    ];

    for (const { campo, mensaje } of camposRequeridos) {
      if (
        campo === null ||
        campo === undefined ||
        (typeof campo === 'string' && campo.trim() === '') ||
        (typeof campo === 'number' && isNaN(campo)) ||
        (Array.isArray(campo) && campo.length === 0)
      ) {
        await Swal.fire('Error', mensaje, 'error');
        return false;
      }
    }

    if (!this.pedido.detalles || this.pedido.detalles.length === 0) {
      await Swal.fire('Error', 'Debe agregar al menos un producto al pedido.', 'error');
      return false;
    }

    return true;
  }

  private marcarCamposComoTocados(): void {
    if (!this.pedidoForm?.controls) return;
    Object.values(this.pedidoForm.controls).forEach(control => control.markAsTouched());
  }

private actualizarEstadoBotonGuardar(): void {
  this.puedeGuardar = !!(this.pedido.detalles && this.pedido.detalles.length > 0);
}

  cerrarModal(): void {
    this.cerrar.emit();
  }
}
