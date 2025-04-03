import { Component } from '@angular/core';

@Component({
  selector: 'app-categoria',
  standalone: false,
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.css'
})
export class CategoriaComponent {
  fechaInicio: string = '';  // Definir como string o Date según necesidad
  fechaFin: string = '';
  mostrarModal: boolean = false;

  constructor() { }

  filtrarPorFecha() {
    console.log('Filtrando por fecha:', this.fechaInicio, this.fechaFin);
    // Aquí puedes agregar la lógica para filtrar
  }

  // Lista de categorías
  categorias = [
    { id: '01', nombre: 'Gaseosas', descripcion: 'Disponible' }
  ];

  // Método para abrir el modal de creación
  abrirModalCrear() {
    this.mostrarModal = true;
  }
  cerrarModal() {
    this.mostrarModal = false;
  }
  // Variable para el filtro
  filtroCategoria: string = '';

  // Método para buscar proveedor
  buscarProveedor() {
    console.log('Buscando proveedor:', this.filtroCategoria);
    // Aquí puedes agregar lógica de filtrado
  }
}
