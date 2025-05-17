import { Component, OnInit, ViewChild } from '@angular/core';
import { PedidoService } from '../../../../services/pedido.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PedidosModalComponent } from '../pedidos-modal/pedidos-modal.component';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.css',
  imports: [FormsModule, CommonModule, PedidosModalComponent]
})
export class PedidosComponent implements OnInit {
  pedidos: any[] = [];
  originalPedidos: any[] = [];
  mostrarModal = false;
  pedidoSeleccionado: any = null;
  modoVista = false;
  @ViewChild(PedidosModalComponent) pedidosModalComponent!: PedidosModalComponent;

  // Filtros
  filtroPedido = '';
  fechaInicio = '';
  fechaFin = '';

  // Paginación
  paginaActual = 1;
  elementosPorPagina = 10;

  // Permisos
  puedeCrear = false;
  puedeEditar = false;
  puedeEliminar = false;
  puedeVer = false;

  constructor(
    private pedidoService: PedidoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarPedidos();
    this.cargarPermisos();
  }

  cargarPermisos() {
    const permisos = this.authService.obtenerPermisos();
    this.puedeCrear = permisos.includes('Crear Pedidos');
    this.puedeEditar = permisos.includes('Editar Pedidos');
    this.puedeEliminar = permisos.includes('Eliminar Pedidos');
    this.puedeVer = permisos.includes('Ver Pedidos');
  }

  cargarPedidos() {
    this.pedidoService.obtenerPedidos().subscribe({
      next: (data) => {
        this.originalPedidos = data;
        this.pedidos = [...data];
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar pedidos',
          text: error.message || 'Hubo un problema al cargar los pedidos.'
        });
      }
    });
  }

  buscarPedido() {
    if (!this.filtroPedido.trim()) {
      this.pedidos = [...this.originalPedidos];
      return;
    }

    const filtro = this.filtroPedido.toLowerCase();
    this.pedidos = this.originalPedidos.filter(p =>
    (p.codigoPedido && p.codigoPedido.toString().toLowerCase().includes(filtro)) ||
    (p.id && p.id.toString().includes(filtro))
  );

  }

  filtrarPorFecha() {
    if (!this.fechaInicio || !this.fechaFin) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas incompletas',
        text: 'Por favor seleccione ambas fechas.'
      });
      return;
    }

    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas inválidas',
        text: 'Por favor ingrese fechas válidas.'
      });
      return;
    }

    this.pedidos = this.originalPedidos.filter(p => {
      const fecha = new Date(p.fechaPedido);  // Aquí cambia al campo de fecha de pedido
      return fecha >= inicio && fecha <= fin;
    });
  }

  pedidosPaginados(): any[] {
    return this.pedidos.slice(
      (this.paginaActual - 1) * this.elementosPorPagina,
      this.paginaActual * this.elementosPorPagina
    );
  }

  totalPaginas(): number {
    return Math.ceil(this.pedidos.length / this.elementosPorPagina);
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

  abrirModalCrear() {
    this.pedidoSeleccionado = {
      id: 0,
      codigoPedido: 0,
      cantidadPedido: 0,
      totalPedido: 0,
      fechaPedido: new Date().toISOString(),
      contacto: '',
      ProveedorId: '',
      estado: 'Activo'
    };
    this.mostrarModal = true;
    this.modoVista = false;
  }

abrirModalEditar(pedido: any) {
  this.pedidoSeleccionado = {
    id: pedido.id || pedido.Id,
    codigoPedido: pedido.codigoPedido || pedido.CodigoPedido,
    cantidadPedido: pedido.cantidadPedido || pedido.CantidadPedido,
    totalPedido: pedido.totalPedido || pedido.TotalPedido,
    fechaPedido: pedido.fechaPedido || pedido.FechaPedido,
    proveedorId: pedido.proveedorId || pedido.ProveedorId,
    estado: pedido.estado ?? pedido.Estado,
  };

  this.mostrarModal = true;
  this.modoVista = false;
}

verPedido(pedido: any) {
  this.pedidoSeleccionado = {
    id: pedido.id || pedido.Id,
    codigoPedido: pedido.codigoPedido || pedido.CodigoPedido,
    cantidadPedido: pedido.cantidadPedido || pedido.CantidadPedido,
    totalPedido: pedido.totalPedido || pedido.TotalPedido,
    fechaPedido: pedido.fechaPedido || pedido.FechaPedido,
    proveedorId: pedido.proveedorId || pedido.ProveedorId,
    estado: pedido.estado ?? pedido.Estado,
  };

  this.modoVista = true;
  this.mostrarModal = true;
}


  guardarPedido(pedido: any) {
    // Aquí puedes hacer validaciones si es necesario, por ejemplo evitar duplicados por id o contacto si aplica

    const pedidoParaGuardar = {
      ...pedido,
      id: this.pedidoSeleccionado?.id || 0,
      estadoId: pedido.estadoId ?? true
    };

    console.log('Pedido a enviar:', JSON.stringify(pedidoParaGuardar, null, 2));

    this.pedidoService.guardarPedido(pedidoParaGuardar).subscribe({
      next: () => {
        this.cargarPedidos();
        this.cerrarModal();
        Swal.fire({
          icon: 'success',
          title: pedidoParaGuardar.id === 0 ? 'Pedido creado' : 'Pedido actualizado',
          text: 'La operación se ha realizado correctamente.'
        });
      },
      error: (error) => {
        console.error('Error al guardar pedido:', error);
        let mensajeError = 'Error al guardar pedido.';
        if (error.error?.errors) {
          mensajeError = Object.entries(error.error.errors)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join('\n');
        }
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensajeError
        });
      }
    });
  }

  eliminarPedidoLogico(id: number) {
    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar pedido?',
      text: 'Esta acción desactivará el pedido.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.pedidoService.eliminarPedidoLogico(id).subscribe({
          next: () => {
            this.cargarPedidos();
            Swal.fire({
              icon: 'success',
              title: 'Pedido eliminado',
              text: 'El pedido ha sido desactivado correctamente.'
            });
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el pedido.'
            });
          }
        });
      }
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.pedidoSeleccionado = null;
  }
}
