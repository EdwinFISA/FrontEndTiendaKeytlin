import { Component, OnInit } from '@angular/core';
import { EmpresaService, Empresa } from '../../../../services/empresa.service';

@Component({
  selector: 'app-contacto',
  standalone: false,
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})

export class ContactoComponent implements OnInit {
  isModalOpen = false;
  empresa: Empresa = {
    nombre: '',
    telefono: '',
    correo: '',
    direccion: ''
  };

  constructor(private empresaService: EmpresaService) { }

  ngOnInit(): void {
    this.obtenerEmpresa();
  }

  obtenerEmpresa() {
    this.empresaService.obtenerEmpresa().subscribe(
      (response) => {
        this.empresa = response;
      },
      (error) => {
        console.error('Error al obtener la empresa:', error);
      }
    );
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  actualizarEmpresa(empresa: Empresa) {
    this.empresa = empresa; // Actualiza la información en la vista
  }
}
