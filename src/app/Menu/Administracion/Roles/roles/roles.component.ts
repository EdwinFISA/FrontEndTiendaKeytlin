import { Component, OnInit } from '@angular/core';
import { RolUsuarioService } from '../../../../services/roles.service';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';

import Swal from 'sweetalert2';  // Importa SweetAlert2

@Component({
  selector: 'app-roles',
  standalone: false,
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  roles: any[] = [];
  mostrarModal = false;
  mostrarModalPermisos = false;  // Nueva variable para el modal de permisos
  rolSeleccionado: any = {};
  modoVista = false;
  filtroRol = '';
  paginaActual = 1;
  elementosPorPagina = 10;
  usuariosPorRol: { [key: number]: any[] } = {};  // Para almacenar los usuarios por rol
  permisosPorRol: { [key: number]: any[] } = {};  // Para almacenar los permisos por rol

   //Variables de Permisos
  puedeCrear: boolean = false;
  puedeEditar: boolean = false;
  puedeEliminar: boolean = false;
  puedeVer: boolean = false;


  constructor(
    private rolService: RolUsuarioService,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.cargarRoles();
    this.cargarPermisos();
  }

  cargarRoles(): void {
    this.rolService.obtenerRoles().subscribe({
      next: (data) => {
        this.roles = data;

        // Para cada rol, obtener los usuarios y permisos asignados
        this.roles.forEach(rol => {
          this.cargarUsuariosYPermisos(rol);
        });
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar los roles',
          text: 'Hubo un problema al cargar los roles. Intente nuevamente.'
        });
        console.error('Error al cargar roles:', error);
      }
    });
  }

  cargarPermisos() {
    const permisos = this.authService.obtenerPermisos(); // o donde guardes los permisos del usuario
  
    this.puedeCrear = permisos.includes('Crear Roles');
    this.puedeEditar = permisos.includes('Editar Roles');
    this.puedeEliminar = permisos.includes('Eliminar Roles');
    this.puedeVer = permisos.includes('Ver Roles');
  }

  
  cargarUsuariosYPermisos(rol: any): void {
    // Cargar los usuarios asignados al rol
    this.rolService.obtenerUsuariosPorRol(rol.id).subscribe({
      next: (usuarios) => {
        this.usuariosPorRol[rol.id] = usuarios;
      },
      error: (error) => {
        console.error('Error al obtener usuarios asignados:', error);
      }
    });

    // Cargar los permisos asignados al rol
    this.rolService.obtenerPermisosDeRol(rol.id).subscribe({
      next: (permisos) => {
        this.permisosPorRol[rol.id] = permisos;

        // Forzar la actualización de la vista después de cargar los permisos
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener permisos asignados:', error);
      }
    });
  }

  
  

  abrirModalCrear(): void {
    this.rolSeleccionado = {};
    this.modoVista = false;
    this.mostrarModal = true;
  }

  abrirModalEditar(rol: any): void {
    this.rolSeleccionado = { ...rol };
    this.modoVista = false;
    this.mostrarModal = true;
  }

  verRol(rol: any): void {
    this.rolSeleccionado = { ...rol };
    this.modoVista = true;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarRol(rol: any): void {
    if (rol.id) {
      this.rolService.actualizarRol(rol.id, rol).subscribe({
        next: () => {
          // Usando SweetAlert2 para mostrar éxito
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Rol actualizado con éxito.'
          });
          this.cerrarModal();
          this.cargarRoles();
        },
        error: (error) => {
          // Usando SweetAlert2 para mostrar error
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar el rol',
            text: 'Hubo un problema al actualizar el rol. Intente nuevamente.'
          });
          console.error('Error al actualizar rol:', error);
        }
      });
    } else {
      this.rolService.crearRol(rol).subscribe({
        next: () => {
          // Usando SweetAlert2 para mostrar éxito
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Rol creado con éxito.'
          });
          this.cerrarModal();
          this.cargarRoles();
        },
        error: (error) => {
          // Usando SweetAlert2 para mostrar error
          Swal.fire({
            icon: 'error',
            title: 'Error al crear el rol',
            text: 'Hubo un problema al crear el rol. Intente nuevamente.'
          });
          console.error('Error al crear rol:', error);
        }
      });
    }
  }

  eliminarRol(id: number): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: '¿Desea eliminar este rol?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.rolService.eliminarRol(id).subscribe({
          next: () => {
            // Usando SweetAlert2 para mostrar éxito
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: 'Rol eliminado con éxito.'
            });
            this.cargarRoles();
          },
          error: (error) => {
            // Usando SweetAlert2 para mostrar error
            Swal.fire({
              icon: 'error',
              title: 'Error al eliminar el rol',
              text: error.status === 400
                ? 'No se puede eliminar el rol porque hay usuarios asignados a él.'
                : 'Hubo un problema al eliminar el rol. Intente nuevamente.'
            });
            console.error('Error al eliminar rol:', error);
          }
        });
      }
    });
  }

  buscarRol(): void {
    // Esta función se puede expandir para filtrar los roles en el cliente
    // o para hacer una llamada a la API con parámetros de búsqueda
  }

  rolesPaginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.roles.slice(inicio, fin);
  }

  totalPaginas(): number {
    return Math.ceil(this.roles.length / this.elementosPorPagina);
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas()) {
      this.paginaActual++;
    }
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  // Nueva función para abrir el modal de asignación de permisos
  asignarPermisos(rol: any): void {
    if (rol.nombre?.toLowerCase() === 'admin') {
      Swal.fire({
        icon: 'warning',
        title: 'Acción no permitida',
        text: 'No se pueden modificar los permisos del rol Admin.',
        confirmButtonText: 'Entendido'
      });
      return; // 🚫 Detiene la ejecución antes de abrir el modal
    }
    this.rolSeleccionado = { ...rol };
    this.mostrarModalPermisos = true;
  }

  // Nueva función para cerrar el modal de asignación de permisos
  cerrarModalPermisos(): void {
    this.mostrarModalPermisos = false;
  }

  // Nueva función para actualizar después de asignar permisos
  actualizarDespuesDeAsignarPermisos(): void {
    this.cargarRoles();
  }


// Método que cuenta los permisos solo si están cargados
 // Método para contar los permisos
 contarPermisosPorRol(rolId: number): number {
  const permisos = this.permisosPorRol[rolId];
  return permisos ? permisos.length : 0;
}
}

