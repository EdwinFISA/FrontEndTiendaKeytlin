import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RolUsuarioService, Permiso } from '../../../../services/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-permisos-modal',
  standalone: false,
  templateUrl: './permisos-modal.component.html',
  styleUrls: ['./permisos-modal.component.scss']
})
export class PermisosModalComponent implements OnInit {
  @Input() rolId: number = 0;
  @Input() rolNombre: string = '';
  @Output() cerrar = new EventEmitter<void>();
  @Output() actualizar = new EventEmitter<void>();

  todosLosPermisos: Permiso[] = [];
  permisosAsignados: Permiso[] = [];
  permisosSeleccionados: { [id: number]: boolean } = {};
  cargando = false;
  filtroPermiso = '';

  constructor(private rolService: RolUsuarioService) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;

    // Obtener todos los permisos disponibles
    this.rolService.obtenerTodosLosPermisos().subscribe({
        next: (permisos) => {
            this.todosLosPermisos = permisos;
            
            // Obtener permisos asignados al rol desde la tabla RolPermisos
            this.rolService.obtenerPermisosDeRol(this.rolId).subscribe({
                next: (permisosAsignados) => {
                    this.permisosAsignados = permisosAsignados;

                    // Inicializar el estado de selección
                    // Comparamos los permisos asignados con los permisos disponibles
                    this.todosLosPermisos.forEach(permiso => {
                        // Marcar como seleccionado si el permiso está en la lista de permisosAsignados
                        this.permisosSeleccionados[permiso.id] = this.permisosAsignados.some(p => p.id === permiso.id);
                    });

                    this.cargando = false;
                },
                error: (error) => {
                    console.error('Error al obtener permisos asignados:', error);
                    this.cargando = false;
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudieron cargar los permisos asignados.'
                    });
                }
            });
        },
        error: (error) => {
            console.error('Error al obtener todos los permisos:', error);
            this.cargando = false;
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los permisos disponibles.'
            });
        }
    });
}

  cerrarModal(): void {
    this.cerrar.emit();
  }

  toggleSeleccionTodos(seleccionar: boolean): void {
    this.permisosFiltrados().forEach(permiso => {
      this.permisosSeleccionados[permiso.id] = seleccionar;
    });
  }

  guardarPermisos(): void {
    this.cargando = true;

    // Obtener los IDs de permisos seleccionados y no seleccionados
    const permisosIdsSeleccionados = Object.keys(this.permisosSeleccionados)
        .filter(id => this.permisosSeleccionados[Number(id)])
        .map(id => Number(id));

    const permisosIdsDeseleccionados = Object.keys(this.permisosSeleccionados)
        .filter(id => !this.permisosSeleccionados[Number(id)])
        .map(id => Number(id));

    console.log("Permisos seleccionados:", permisosIdsSeleccionados);
    console.log("Permisos deseleccionados:", permisosIdsDeseleccionados);

    // Realizar las solicitudes para agregar y eliminar permisos

    // Agregar permisos seleccionados
    if (permisosIdsSeleccionados.length > 0) {
        this.rolService.asignarPermisosARol1(this.rolId, permisosIdsSeleccionados).subscribe({
            next: () => {
                console.log('Permisos seleccionados asignados correctamente.');
            },
            error: (error) => {
                console.error('Error al asignar permisos seleccionados:', error);
            }
        });
    }

    // Eliminar permisos deseleccionados
    if (permisosIdsDeseleccionados.length > 0) {
        this.rolService.eliminarPermisosDeRol(this.rolId, permisosIdsDeseleccionados).subscribe({
            next: () => {
                console.log('Permisos deseleccionados eliminados correctamente.');
            },
            error: (error) => {
                console.error('Error al eliminar permisos deseleccionados:', error);
            }
        });
    }

    // Mostrar mensaje de éxito cuando todo haya terminado
    this.cargando = false;
    Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Permisos actualizados correctamente.'
    });
    this.actualizar.emit();
    this.cerrarModal();
}


  permisosFiltrados(): Permiso[] {
    if (!this.filtroPermiso.trim()) {
      return this.todosLosPermisos;
    }
    
    const filtro = this.filtroPermiso.toLowerCase();
    return this.todosLosPermisos.filter(permiso => 
      permiso.codigo.toLowerCase().includes(filtro)
    );
  }

  contarSeleccionados(): number {
    return Object.values(this.permisosSeleccionados).filter(selected => selected).length;
  }
}