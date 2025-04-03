import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  proveedorForm: Proveedor = {
    nombre: '',
    nombreContacto: '',
    telefono: '',
    telefonoContacto: '', // <- Corrige aquí
    correo: '',
    direccion: '', // <- Corrige aquí
    estado: 'Activo',
    descripcion: '' // <- Corrige aquí
  };


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
      this.guardarProveedor.emit(this.proveedorForm);
    }
  }
}
