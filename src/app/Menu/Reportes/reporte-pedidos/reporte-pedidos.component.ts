import { Component } from '@angular/core';

@Component({
  selector: 'app-reporte-pedido',
  standalone: false,
  templateUrl: './reporte-pedidos.component.html',
  styleUrl: './reporte-pedidos.component.css'
})
export class ReportePedidosComponent {
  pedido = []; // Aquí se carga la lista de usuarios

  generarReporte() {
    // Filtrar o cargar pedido
  }

  exportarPDF() {
    // Usar html2pdf o jspdf para exportar
  }
}