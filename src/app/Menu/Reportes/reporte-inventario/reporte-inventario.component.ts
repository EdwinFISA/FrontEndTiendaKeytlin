import { Component } from '@angular/core';

@Component({
  selector: 'app-reporte-inventario',
  standalone: false,
  templateUrl: './reporte-inventario.component.html',
  styleUrl: './reporte-inventario.component.css'
})
export class ReporteInventarioComponent {
  inventario = []; // Aquí se carga la lista de usuarios

  generarReporte() {
    // Filtrar o cargar Inventario
  }

  exportarPDF() {
    // Usar html2pdf o jspdf para exportar
  }
}