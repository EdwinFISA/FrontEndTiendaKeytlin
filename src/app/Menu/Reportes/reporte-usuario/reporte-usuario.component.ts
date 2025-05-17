import { Component } from '@angular/core';

@Component({
  selector: 'app-reporte-usuario',
  standalone: false,
  templateUrl: './reporte-usuario.component.html',
  styleUrl: './reporte-usuario.component.css'
})
export class ReporteUsuarioComponent {
  usuarios = []; // Aquí se carga la lista de usuarios

  generarReporte() {
    // Filtrar o cargar usuarios
  }

  exportarPDF() {
    // Usar html2pdf o jspdf para exportar
  }
}
