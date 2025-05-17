import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

export interface Producto {
  nombreProducto: string;
  codigoProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface ReciboVentaData {
  fechaVenta: string;
  ventaId: number;
  direccionTienda: string;
  telefonoVendedor: string;
  emailVendedor: string;
  nombreVendedor: string;
  productos: Producto[];
  subtotal: number;
  total: number;
  montoRecibido: number;
  cambio: number;
}

@Component({
  selector: 'app-recibo-venta',
  templateUrl: './recibo-ventas.component.html',
  styleUrls: ['./recibo-ventas.component.scss'],
  standalone: false
})
export class ReciboVentasComponent implements OnChanges {
  @Input() data!: ReciboVentaData;
  @Output() cerrarRecibo = new EventEmitter<void>();

  fechaFormateada: string = '';
  horaFormateada: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data?.fechaVenta) {
      this.formatearFechaHora();
    }
  }

  formatearFechaHora(): void {
    const fecha = new Date(this.data.fechaVenta);
    if (isNaN(fecha.getTime())) {
      this.fechaFormateada = '';
      this.horaFormateada = '';
      return;
    }

    this.fechaFormateada = fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    this.horaFormateada = fecha.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  cerrar(): void {
    this.cerrarRecibo.emit();
  }

  imprimirRecibo(): void {
    window.print();
  }
}