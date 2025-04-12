import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm} from '@angular/forms';
import { Proveedor } from '../../../../services/proveedor.service';

@Component({
  selector: 'app-proveedores-modal',
  standalone: true,
  templateUrl: './proveedores-modal.component.html',
  styleUrls: ['./proveedores-modal.component.css'],
  imports: [CommonModule, FormsModule]
})
export class ProveedoresModalComponent {
  @Input() proveedor: Proveedor | null = null;
  @Input() modoVer: boolean = false;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() guardarProveedor = new EventEmitter<Proveedor>();
  @Output() actualizarProveedor = new EventEmitter<{ id: number, proveedor: Proveedor }>();
  @Output() eliminarProveedor = new EventEmitter<number>();
  @ViewChild('proveedor') proveedorForm1!: NgForm;

  proveedorForm: Proveedor = {
    nombre: '',
    nombreContacto: '',
    telefono: '',
    telefonoContacto: '',
    correo: '',
    direccion: '',
    estado: 'Activo',
    descripcion: ''
  };

  cargando = false;

  ngOnInit() {
    if (this.proveedor) {
      this.proveedorForm = { ...this.proveedor };
    }
  }

  guardar() {
    if (!this.modoVer) {
      if (!this.proveedorForm.nombre || !this.proveedorForm.nombreContacto || !this.proveedorForm.telefono) {
        alert('Los campos marcados con * son obligatorios');
        return;
      }
      if (this.proveedor && this.proveedor.id) {
        // Si existe un proveedor con ID, actualizar
        this.actualizarProveedor.emit({ id: this.proveedor.id, proveedor: this.proveedorForm });
      } else {
        // Si no existe ID, guardar como nuevo proveedor
        this.guardarProveedor.emit(this.proveedorForm);
      }
    }
  }

  eliminar() {
    if (this.proveedor && this.proveedor.id && confirm('¿Estás seguro de eliminar este proveedor?')) {
      this.eliminarProveedor.emit(this.proveedor.id);
    }
  }
}
