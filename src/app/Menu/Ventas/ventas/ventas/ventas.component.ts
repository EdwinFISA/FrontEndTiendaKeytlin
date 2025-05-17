import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductoService } from '../../../../services/productos.service';
import { VentaService } from '../../../../services/ventas.service';
import Swal from 'sweetalert2';
import { DetalleVentasComponent } from '../detalle-ventas/detalle-ventas.component';
import { ReciboVentasComponent, ReciboVentaData } from '../recibo-ventas/recibo-ventas.component';

interface ProductoCarrito {
  id: number;
  nombre: string;
  codigo: string;
  precio: number;
  cantidad: number;
  disponibles: number;
  imagen: string;
}

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.scss'],
  standalone: false
})
export class VentasComponent implements OnInit {
  productos: any[] = [];
  carrito: ProductoCarrito[] = [];
  buscarProducto: string = '';
  vendedorId: number = 1;
  productosFiltrados: any[] = [];
  
  // Añadimos referencias a los componentes hijo
  @ViewChild(DetalleVentasComponent) detalleVentasComponent!: DetalleVentasComponent;
  @ViewChild(ReciboVentasComponent) reciboVentasComponent!: ReciboVentasComponent;
  
  // Variables para controlar la visibilidad de los modales
  mostrarDetalleVenta: boolean = false;
  mostrarReciboVenta: boolean = false;
  
  // Datos para el recibo
  datosRecibo: ReciboVentaData | null = null;

  constructor(
    private productoService: ProductoService,
    private ventaService: VentaService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.obtenerProductos().subscribe({
      next: (data) => {
        this.productos = data.map(p => ({
          id: p.id,
          nombre: p.nombre,
          codigo: p.codigoProducto,
          precio: p.precioVenta,
          disponibles: 50,
          imagen: p.imagen || 'assets/no-image.png'
        }));
        this.actualizarProductosFiltrados();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar productos'
        });
      }
    });
  }

  actualizarProductosFiltrados(): void {
    const filtro = this.buscarProducto.trim().toLowerCase();
    this.productosFiltrados = this.productos.filter(p =>
      p.nombre.toLowerCase().includes(filtro) ||
      p.codigo.toLowerCase().includes(filtro)
    );
  }

  agregarAlCarrito(producto: any): void {
    const item = this.carrito.find(i => i.id === producto.id);
    if (item) {
      if (item.cantidad < producto.disponibles) {
        item.cantidad += 1;
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Sin stock disponible',
          text: 'No hay más unidades disponibles de este producto'
        });
      }
    } else {
      this.carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        codigo: producto.codigo,
        precio: producto.precio,
        cantidad: 1,
        disponibles: producto.disponibles,
        imagen: producto.imagen
      });
    }
  }

  cambiarCantidad(item: ProductoCarrito, cambio: number): void {
    const nuevaCantidad = item.cantidad + cambio;
    if (nuevaCantidad > 0 && nuevaCantidad <= item.disponibles) {
      item.cantidad = nuevaCantidad;
    } else if (nuevaCantidad <= 0) {
      const index = this.carrito.findIndex(i => i.id === item.id);
      if (index !== -1) this.carrito.splice(index, 1);
    }
  }

  obtenerTotal(): number {
    return this.carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
  }

  obtenerSubtotal(): number {
    return this.obtenerTotal();
  }

  cancelarVenta(): void {
    if (this.carrito.length > 0) {
      Swal.fire({
        title: '¿Cancelar venta?',
        text: '¿Estás seguro de cancelar la venta actual?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.isConfirmed) {
          this.carrito = [];
        }
      });
    }
  }

  confirmarVenta(): void {
    if (this.carrito.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Carrito vacío',
        text: 'Agrega productos al carrito para realizar una venta'
      });
      return;
    }

    // Mostrar el componente detalle-venta
    this.mostrarDetalleVenta = true;
  }

  onCancelarDetalle(): void {
    this.mostrarDetalleVenta = false;
  }

  onConfirmarDetalle(detalleVenta: any): void {
    this.mostrarDetalleVenta = false;
    this.procesarVenta(detalleVenta);
  }

  procesarVenta(detalleVenta: any): void {
    const venta = {
      subtotal: detalleVenta.subtotal,
      total: detalleVenta.total,
      montoRecibido: detalleVenta.montoRecibido,
      cambio: detalleVenta.cambio,
      observaciones: detalleVenta.observaciones || '',
      vendedorId: this.vendedorId,
      detallesVenta: this.carrito.map(item => ({
        productoId: item.id,
        cantidad: item.cantidad,
        precioUnitario: item.precio,
        subtotal: item.precio * item.cantidad
      }))
    };

    this.ventaService.crearVenta(venta).subscribe({
      next: (response) => {
        this.mostrarRecibo(response.id);
        this.carrito = [];
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al procesar la venta'
        });
      }
    });
  }

  mostrarRecibo(ventaId: number): void {
    this.ventaService.obtenerReciboVenta(ventaId).subscribe({
      next: (recibo) => {
        console.log('RECIBO:', recibo);
        
        // Preparar los datos para el componente RecibosVenta
        this.datosRecibo = {
          ventaId: ventaId,
          fechaVenta: recibo.fechaVenta,
          direccionTienda: recibo.direccionTienda || 'Calle Principal #123',
          telefonoVendedor: recibo.telefonoVendedor,
          emailVendedor: recibo.emailVendedor,
          nombreVendedor: recibo.nombreVendedor,
          productos: recibo.productos || [],
          subtotal: recibo.subtotal || recibo.total,
          total: recibo.total,
          montoRecibido: recibo.montoRecibido,
          cambio: recibo.cambio
        };
        
        // Mostrar el componente de recibo
        this.mostrarReciboVenta = true;
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al obtener el recibo'
        });
      }
    });
  }

  cerrarRecibo(): void {
    this.mostrarReciboVenta = false;
    this.datosRecibo = null;
  }
}