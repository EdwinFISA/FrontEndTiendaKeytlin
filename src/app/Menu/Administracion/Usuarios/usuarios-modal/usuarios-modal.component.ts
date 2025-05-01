import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { UsuarioService } from '../../../../services/usuario.service';
import { finalize } from 'rxjs/operators';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';

// Interfaces para tipado fuerte
interface Usuario {
  Id?: number;
  Nombre?: string;
  Apellido?: string;
  Correo?: string;
  Telefono?: string;
  FechaNacimiento?: 'Date',
  Imagen?: string;
  EstadoId?: number;
  RolId?: number;
  Estado?: any;
  Rol?: any;
}

// interface Rol {
//   Id: number;
//   Nombre: string;
// }

// interface Estado {
//   Id: number;
//   Nombre: string;
// }

@Component({
  selector: 'app-usuario-modal',
  standalone: true,
  templateUrl: './usuarios-modal.component.html',
  styleUrls: ['./usuarios-modal.component.css'],
  imports: [FormsModule, CommonModule]
})
export class UsuarioModalComponent implements OnInit {
  @Input() usuario: Usuario = {};
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<Usuario>();
  @ViewChild('usuarioForm') usuarioForm!: NgForm;
  @Input() modoVista: boolean = false;

  roles: any[] = [];
  estados: any[] = [];
  imagenPrevia: string | ArrayBuffer | null = null;
  archivoImagen!: File;
  cargando = false;

  constructor(
    private usuarioService: UsuarioService,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    this.cargarDatos();

    if (this.usuario.Imagen) {
      this.imagenPrevia = this.getImagenUrl(this.usuario.Imagen);
    }
  }
  minFechaNacimiento = '1940-01-01'; // Fecha mínima
  maxFechaNacimiento = new Date().toISOString().split('T')[0]; // Fecha máxima (hoy)
  edad!: number;

  calcularEdad() {
    if (this.usuario.FechaNacimiento) {
      const fechaNacimiento = new Date(this.usuario.FechaNacimiento);
      const diferencia = Date.now() - fechaNacimiento.getTime();
      this.edad = new Date(diferencia).getUTCFullYear() - 1970;
    }
  }

  cargarDatos(): void {
    this.usuarioService.obtenerRoles().subscribe(roles => {
      console.log('Roles recibidos en modal:', roles);
      this.roles = roles;
      if (!this.usuario.Id && roles.length > 0) {
        const rolVendedor = roles.find(r => r.Nombre?.toLowerCase() === 'vendedor');
        if (rolVendedor) {
          this.usuario.RolId = rolVendedor.Id;
          console.log('Rol por defecto establecido:', rolVendedor);
        }
      }
    });
    this.usuarioService.obtenerEstados().subscribe(estados => {
      console.log('Estados recibidos en modal:', estados);
      this.estados = estados;
      if (!this.usuario.Id && estados.length > 0) {
        const estadoActivo = estados.find(e => e.Nombre?.toLowerCase() === 'activo');
        if (estadoActivo) {
          this.usuario.EstadoId = estadoActivo.Id;
          console.log('Estado por defecto establecido:', estadoActivo);
        }
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
      alert('Solo se permiten archivos JPG o PNG');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no debe superar los 2MB');
      return;
    }

    this.archivoImagen = file;
    this.usuario.Imagen = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPrevia = reader.result;
    };
    reader.readAsDataURL(file);
  }
  

  onFileInputClick(): void {
    this.document.getElementById('fileInput')?.click();
  }

  getImagenUrl(nombreImagen: string): string {
    return this.usuarioService.getImagenUrl(nombreImagen);
  }

  convertirArchivoABase64(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = () => {
        resolve(reader.result); // contiene la imagen como base64
      };
  
      reader.onerror = error => {
        reject(error);
      };
  
      reader.readAsDataURL(file);
    });
  }
  

  async onSubmit(): Promise<void> {
    if (this.cargando) return;

    if (this.usuarioForm.invalid || !this.validarFormulario()) {
      this.marcarCamposComoTocados();
      return;
    }

    this.cargando = true;
    console.log(this.usuarioForm.value)
    try {
      let imagen = this.archivoImagen 
      const base64 = await this.convertirArchivoABase64(imagen);
        console.log(base64)
      const usuarioCompleto: Usuario = {
        ...this.usuario,
        Estado: this.estados.find(e => e.Id === this.usuario.EstadoId),
        Imagen: base64?.toString(),
        Rol: this.roles.find(r => r.Id === this.usuario.RolId)
      };

      this.guardar.emit(usuarioCompleto);
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert('Ocurrió un error al guardar el usuario. Intente nuevamente.');
    } finally {
      this.cargando = false;
    }
  }

  private validarFormulario(): boolean {
    const camposRequeridos = [
      { campo: this.usuario.Nombre?.trim(), mensaje: 'El nombre es requerido' },
      { campo: this.usuario.Apellido?.trim(), mensaje: 'El apellido es requerido' },
      { campo: this.usuario.Correo?.trim(), mensaje: 'El correo es requerido' },
      { campo: this.usuario.Telefono?.trim(), mensaje: 'El teléfono es requerido' },
      //{ campo: this.usuario.EstadoId, mensaje: 'El estado es requerido' },
      //{ campo: this.usuario.RolId, mensaje: 'El rol es requerido' }
    ];

    for (const { campo, mensaje } of camposRequeridos) {
      if (!campo) {
        alert(mensaje);
        return false;
      }
    }

    if (!this.validarCorreo(this.usuario.Correo!)) {
      alert('El correo no tiene un formato válido');
      return false;
    }

    return true;
  }

  private marcarCamposComoTocados(): void {
    Object.values(this.usuarioForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  private validarCorreo(correo: string): boolean {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(correo);
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }
}