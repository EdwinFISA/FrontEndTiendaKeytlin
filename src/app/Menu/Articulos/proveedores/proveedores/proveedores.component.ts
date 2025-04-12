import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProveedoresModalComponent } from '../proveedores-modal/proveedores-modal.component';
import { ProveedorService, Proveedor } from '../../../../services/proveedor.service';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css'],
  imports: [CommonModule, FormsModule, ProveedoresModalComponent]
})
export class ProveedoresComponent implements OnInit {
  proveedores: Proveedor[] = [];
  proveedoresFiltrados: Proveedor[] = [];
  filtroProveedor: string = '';
  mostrarModal: boolean = false;
  proveedorSeleccionado: Proveedor | null = null;
  modoVer: boolean = false;

  // Paginación
  paginaActual: number = 1;
  registrosPorPagina: number = 10;

  constructor(private proveedorService: ProveedorService) { }

  ngOnInit() {
    this.obtenerProveedores();
  }

  obtenerProveedores() {
    this.proveedorService.getProveedores().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.proveedoresFiltrados = [...data];
      },
      error: (error) => console.error('Error al obtener proveedores:', error)
    });
  }

  buscarProveedor() {
    if (!this.filtroProveedor) {
      this.proveedoresFiltrados = [...this.proveedores];
      return;
    }

    const filtro = this.filtroProveedor.toLowerCase();
    this.proveedoresFiltrados = this.proveedores.filter(p =>
      p.nombre.toLowerCase().includes(filtro) ||
      p.nombreContacto.toLowerCase().includes(filtro) ||
      p.telefono.includes(filtro)
    );
    this.paginaActual = 1;
  }

  abrirModal(proveedor?: Proveedor, modoVer: boolean = false) {
    this.proveedorSeleccionado = proveedor ? { ...proveedor } : null;
    this.modoVer = modoVer;
    this.mostrarModal = true; // Mostrar el modal
  }

  cerrarModal() {
    this.mostrarModal = false; // Cerrar el modal
    this.proveedorSeleccionado = null;
    this.modoVer = false;
  }

  // Este método maneja tanto la creación como la actualización
  manejarProveedorGuardado(proveedor: Proveedor) {
    if (proveedor.id) {
      // Actualizar proveedor existente
      this.proveedorService.updateProveedor(proveedor.id, proveedor).subscribe({
        next: (updatedProveedor) => {
          const index = this.proveedores.findIndex(p => p.id === updatedProveedor.id);
          if (index !== -1) {
            this.proveedores[index] = updatedProveedor;
          }
          this.proveedoresFiltrados = [...this.proveedores];
          this.cerrarModal();
        },
        error: (error) => console.error('Error al actualizar proveedor:', error)
      });
    } else {
      // Agregar nuevo proveedor
      this.proveedorService.addProveedor(proveedor).subscribe({
        next: (newProveedor) => {
          this.proveedores.push(newProveedor);
          this.proveedoresFiltrados = [...this.proveedores];
          this.cerrarModal();
        },
        error: (error) => console.error('Error al agregar proveedor:', error)
      });
    }
  }

  eliminarProveedor(id: number | undefined) {
    if (!id) return;

    if (confirm('¿Estás seguro de eliminar este proveedor?')) {
      this.proveedorService.deleteProveedor(id).subscribe({
        next: () => {
          this.proveedores = this.proveedores.filter(p => p.id !== id);
          this.proveedoresFiltrados = [...this.proveedores];
        },
        error: (error) => console.error('Error al eliminar proveedor:', error)
      });
    }
  }

  // Métodos de paginación
  proveedoresPaginados() {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.proveedoresFiltrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  totalPaginas() {
    return Math.ceil(this.proveedoresFiltrados.length / this.registrosPorPagina);
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

  // Método para obtener las páginas a mostrar
  getPaginas(): number[] {
    const total = this.totalPaginas();
    const paginas = [];

    // Mostrar máximo 3 páginas alrededor de la actual
    const inicio = Math.max(1, this.paginaActual - 1);
    const fin = Math.min(total, this.paginaActual + 1);

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    return paginas;
  }

  // Método para ir a una página específica
  irAPagina(pagina: number) {
    this.paginaActual = pagina;
  }
}
