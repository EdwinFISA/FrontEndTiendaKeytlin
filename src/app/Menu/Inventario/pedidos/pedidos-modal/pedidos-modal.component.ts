import { Component,  EventEmitter,  Inject,  Input,  OnInit,  Output,  ViewChild} from '@angular/core';
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
  precioAdquisicion?: number; // 
  totalPedido?: number;
  fechaPedido?: Date | string;
  descripcion?: string;
  proveedorId?: number;
  estadoId?: number;
  productos?: any[];
  proveedor?: Proveedor;
  estado?: any;
}


@Component({
  selector: 'app-pedidos-modal',
  standalone: true,
  templateUrl: './pedidos-modal.component.html',
  styleUrls: ['./pedidos-modal.component.css'],
  imports: [FormsModule, CommonModule]
})
export class PedidosModalComponent implements OnInit {
  @Input() pedido: Pedido = { productos: [] };
  @Input() modoVista: boolean = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<Pedido>();
  @ViewChild('pedidoForm') pedidoForm!: NgForm;

  cargando = false;
  productos: any[] = [];
  proveedores: Proveedor[] = [];
  estados: any[] = [];

  fechaFormateada: string = '';

  constructor(
    private pedidoService: PedidoService,
    private productoService: ProductoService,
    private proveedorService: ProveedorService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.productoService.obtenerProductos().subscribe(productos => {
      this.productos = productos;
    });

    // this.proveedorService.obtenerProveedores().subscribe(proveedores => {
    //   this.proveedores = proveedores;
    // });

    // this.pedidoService.obtenerEstados().subscribe(estados => {
    //   this.estados = estados;
    // });
    this.productoService.obtenerProveedores().subscribe(proveedores => {
      this.proveedores = proveedores;
      if (!this.pedido.id && proveedores.length > 0) {
        this.pedido.proveedorId = proveedores[0].id;
      }
    });
  }

  agregarProductoAlPedido(): void {
  const productoSeleccionado = this.productos.find(p => p.id === this.pedido.productoId);
  if (!productoSeleccionado) {
    Swal.fire('Error', 'Debe seleccionar un producto válido.', 'warning');
    return;
  }

  if (!this.pedido.cantidadPedido || this.pedido.cantidadPedido <= 0) {
    Swal.fire('Error', 'Debe ingresar una cantidad válida.', 'warning');
    return;
  }

  if (!this.pedido.precioAdquisicion || this.pedido.precioAdquisicion <= 0) {
    Swal.fire('Error', 'Debe ingresar un precio de adquisición válido.', 'warning');
    return;
  }

  const subtotal = this.pedido.cantidadPedido * this.pedido.precioAdquisicion;

  const productoPedido = {
    ...productoSeleccionado,
    cantidad: this.pedido.cantidadPedido,
    precioAdquisicion: this.pedido.precioAdquisicion,
    subtotal: subtotal
  };

  this.pedido.productos?.push(productoPedido);
  this.pedido.totalPedido = (this.pedido.totalPedido || 0) + subtotal;

  // Limpiar campos
  this.pedido.productoId = undefined;
  this.pedido.cantidadPedido = undefined;
  this.pedido.precioAdquisicion = undefined;
}


  editarProductoPedido(index: number): void {
    const productoEditado = this.pedido.productos?.[index];
    if (productoEditado) {
      this.pedido.productoId = productoEditado.id;
      this.pedido.cantidadPedido = productoEditado.cantidad;
      this.pedido.totalPedido = (this.pedido.totalPedido || 0) - productoEditado.subtotal;
      this.pedido.productos?.splice(index, 1);
    }
  }

  eliminarProductoPedido(index: number): void {
    const productoEliminado = this.pedido.productos?.[index];
    if (productoEliminado) {
      this.pedido.totalPedido = (this.pedido.totalPedido || 0) - productoEliminado.subtotal;
      this.pedido.productos?.splice(index, 1);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.cargando) return;

    if (this.pedidoForm.invalid || !this.validarFormulario()) {
      this.marcarCamposComoTocados();
      return;
    }

    this.cargando = true;

    try {
      const pedidoCompleto: Pedido = {
        ...this.pedido,
        proveedor: this.proveedores.find(p => p.id === this.pedido.proveedorId),
        estado: this.estados.find(e => e.Id === this.pedido.estadoId),
        productos: this.pedido.productos || []
      };

      this.guardar.emit(pedidoCompleto);
    } catch (error: any) {
      console.error('Error al guardar pedido:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al guardar el pedido. Intente nuevamente.'
      });
    } finally {
      this.cargando = false;
    }
  }

  private validarFormulario(): boolean {
    const camposRequeridos = [
      { campo: this.pedido.numeroPedido?.trim(), mensaje: 'El número de pedido es requerido' },
      { campo: this.pedido.fechaPedido, mensaje: 'La fecha del pedido es requerida' },
      { campo: this.pedido.proveedorId, mensaje: 'El proveedor es requerido' },
      { campo: this.pedido.estadoId, mensaje: 'El estado del pedido es requerido' }
    ];

    for (const { campo, mensaje } of camposRequeridos) {
      if (
        campo === null ||
        campo === undefined ||
        campo === '' ||
        (typeof campo === 'number' && isNaN(campo))
      ) {
        alert(mensaje);
        return false;
      }
    }

    if (!this.pedido.productos || this.pedido.productos.length === 0) {
      alert('Debe agregar al menos un producto al pedido.');
      return false;
    }

    return true;
  }

  private marcarCamposComoTocados(): void {
    if (!this.pedidoForm?.controls) return;
    Object.values(this.pedidoForm.controls).forEach(control => control.markAsTouched());
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }
}
