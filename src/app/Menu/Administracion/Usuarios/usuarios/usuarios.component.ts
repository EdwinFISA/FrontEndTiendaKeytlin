import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../../../services/usuario.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioModalComponent } from '../usuarios-modal/usuarios-modal.component';


@Component({
  selector: 'app-usuarios',
  standalone: true,
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
  imports: [FormsModule, CommonModule, UsuarioModalComponent]
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  mostrarModal = false;
  usuarioSeleccionado: any = null;
  modoVista: boolean = false;

  // Filtros
  filtroUsuario = '';
  fechaInicio: string = '';
  fechaFin: string = '';

  // Paginación
  paginaActual = 1;
  elementosPorPagina = 10;

  constructor(private usuarioService: UsuarioService) { }

  originalUsuarios: any[] = [];

  ngOnInit(): void {
    this.cargarUsuarios();
    this.verificarPropiedadesUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (data) => {
        console.log('Datos de usuarios recibidos:', data);
        this.originalUsuarios = data;
        this.usuarios = [...data];
        this.verificarPropiedadesUsuarios();
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar usuarios',
          text: error.message || 'Hubo un problema al cargar los usuarios.'
        });
      }
    });
  }

  verificarPropiedadesUsuarios() {
    if (this.usuarios.length > 0) {
      console.log('Estructura de Usuarios:', Object.keys(this.usuarios[0]));
      console.log('Primer Usuario:', this.usuarios[0]);
    }
  }

  buscarUsuario() {
    if (!this.filtroUsuario.trim()) {
      this.usuarios = [...this.originalUsuarios];
      return;
    }

    const filtro = this.filtroUsuario.toLowerCase();
    this.usuarios = this.originalUsuarios.filter(usuario =>
      usuario.nombre.toLowerCase().includes(filtro) ||
      usuario.apellido.toLowerCase().includes(filtro) ||
      usuario.correo.toLowerCase().includes(filtro)
    );
    this.aplicarFiltros();
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

    this.usuarios = this.originalUsuarios.filter(usuario => {
      const fechaCreacion = new Date(usuario.fechaCreacion);
      return fechaCreacion >= inicio && fechaCreacion <= fin;
    });
    this.aplicarFiltros();
  }


  usuariosPaginados(): any[] {
    return this.usuarios.slice(
      (this.paginaActual - 1) * this.elementosPorPagina,
      this.paginaActual * this.elementosPorPagina
    );
  }

  totalPaginas(): number {
    return Math.ceil(this.usuarios.length / this.elementosPorPagina);
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.aplicarFiltros();
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas()) {
      this.paginaActual++;
      this.aplicarFiltros();
    }
  }

  aplicarFiltros() {
    this.buscarUsuario();
  }

  abrirModalCrear() {
    this.usuarioSeleccionado = {
      Id: 0,
      Nombre: '',
      Apellido: '',
      Correo: '',
      Telefono: '',
      Imagen: '',
      EstadoId: '',
      RolId: '',
    };
    this.mostrarModal = true;
    this.modoVista = false;
  }

  abrirModalEditar(usuario: any) {
    // Asignar todos los campos al modal para edición
    this.usuarioSeleccionado = {
      Id: usuario.id || usuario.Id,
      Nombre: usuario.nombre || usuario.Nombre,
      Apellido: usuario.apellido || usuario.Apellido,
      Correo: usuario.correo || usuario.Correo,
      Telefono: usuario.telefono || usuario.Telefono,
      Imagen: usuario.imagen || usuario.Imagen,
      EstadoId: usuario.estadoId || usuario.EstadoId,
      RolId: usuario.rolId || usuario.RolId
    };

    console.log('Usuario para editar:', this.usuarioSeleccionado);
    this.mostrarModal = true;
    this.modoVista = false;
  }

  verUsuario(usuario: any) {
    this.usuarioSeleccionado = {
      Id: usuario.id || usuario.Id,
      Nombre: usuario.nombre || usuario.Nombre,
      Apellido: usuario.apellido || usuario.Apellido,
      Correo: usuario.correo || usuario.Correo,
      Telefono: usuario.telefono || usuario.Telefono,
      Imagen: usuario.imagen || usuario.Imagen,
      EstadoId: usuario.estadoId || usuario.EstadoId,
      RolId: usuario.rolId || usuario.RolId
    };
    this.modoVista = true;
    this.mostrarModal = true; // Asegúrate de que este modal solo muestre información
  }

  guardarUsuario(usuario: any) {
    const usuarioParaGuardar = {
      ...usuario,
      Id: this.usuarioSeleccionado.Id || 0,  // Si es un nuevo usuario, el Id será 0
      RolId: this.usuarioSeleccionado.RolId,
      EstadoId: this.usuarioSeleccionado.EstadoId,
      Nombre: usuario.Nombre,
      Apellido: usuario.Apellido,
      Correo: usuario.Correo,
      Telefono: usuario.Telefono
    };

    console.log('Datos preparados para enviar:', JSON.stringify(usuarioParaGuardar, null, 2));

    this.usuarioService.guardarUsuario(usuarioParaGuardar).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.cargarUsuarios();  // Recargar la lista de usuarios
        this.cerrarModal();      // Cerrar el modal después de guardar

        // Mostrar mensaje de éxito dependiendo si es crear o editar
        if (!usuarioParaGuardar.Id) {
          Swal.fire({
            icon: 'success',
            title: 'Usuario creado',
            text: `Contraseña generada: ${response.contrasenaGenerada}`
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Usuario actualizado',
            text: 'El usuario se ha actualizado correctamente.'
          });
        }
      },
      error: (error) => {
        console.error('Error completo:', error);
        let mensajeError = 'Error al guardar usuario';
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

  eliminarUsuario(id: number) {
    Swal.fire({
      icon: 'warning',
      title: 'Confirmar eliminación',
      text: '¿Está seguro de eliminar este usuario?',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.eliminarUsuario(id).subscribe({
          next: () => {
            this.cargarUsuarios();
            Swal.fire({
              icon: 'success',
              title: 'Usuario eliminado',
              text: 'El usuario ha sido eliminado con éxito.'
            });
          },
          error: (error) => {
            console.error('Error al eliminar usuario:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Hubo un problema al eliminar el usuario.'
            });
          }
        });
      }
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.usuarioSeleccionado = null;
  }
}
