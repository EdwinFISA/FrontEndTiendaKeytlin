import { Component } from '@angular/core';

@Component({
  selector: 'app-reporte-venta',
  standalone: false,
  templateUrl: './reporte-venta.component.html',
  styleUrl: './reporte-venta.component.css'
})
export class ReporteVentaComponent {
  ventas = []; // Aquí se carga la lista de usuarios

  generarReporte() {
    // Filtrar o cargar usuarios
  }

  exportarPDF() {
    // Usar html2pdf o jspdf para exportar
  }
}
