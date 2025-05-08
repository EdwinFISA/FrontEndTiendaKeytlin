import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ProductoService } from '../../../../services/productos.service';
import { Categoria, CategoriaService } from '../../../../services/categoria.service';
import { Proveedor, ProveedorService } from '../../../../services/proveedor.service';

// Interfaces para tipado fuerte
interface Producto {
  Codigo?: number;
  Marca?: string;
  PrecioCompra: number | null;
  PrecioVenta: number | null;
  ProveedorId?: any;
  Id?: number;
  Nombre?: string;
  Descripcion?: string;
  Precio?: number;
  Stock?: number;
  CategoriaId?: number;
  EstadoId?: number;
  Imagen?: string;
  Categoria?: any;
  Estado?: any;
//   categorias: Categoria[] = [];
// proveedores: Proveedor[] = [];
}


@Component({
  selector: 'app-productos-modal',
  standalone: true,
  templateUrl: './productos-modal.component.html',
  styleUrl: './productos-modal.component.css',
  imports: [FormsModule, CommonModule]
})

export class ProductosModalComponent implements OnInit {
  @Input() producto: Producto = {
    PrecioCompra: null,
    PrecioVenta: null
  };
  @Input() modoVista: boolean = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<Producto>();
  @ViewChild('productoForm') productoForm!: NgForm;


  imagenPrevia: string | ArrayBuffer | null = null;
  archivoImagen: File | null = null;
  cargando = false;
  categorias: Categoria[] = [];
  proveedores: Proveedor[] = [];
  estados: any[] = [];

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private proveedorService: ProveedorService,
    @Inject(DOCUMENT) private document: Document
  ) {}
  

  ngOnInit(): void {
  
    this.cargarDatos(); // Esta ya carga categorías, proveedores y estados
  
    if (this.producto.Imagen) {
      this.imagenPrevia = this.getImagenUrl(this.producto.Imagen);
    }
  }
  
  cargarDatos(): void {
    this.productoService.obtenerCategorias().subscribe(categorias => {
      console.log('Categorías cargadas:', categorias);
      this.categorias = categorias;
      if (!this.producto.Id) {
        const porDefecto = categorias.find(c => c.categoriaNombre?.toLowerCase() === 'general');
        if (porDefecto) this.producto.CategoriaId = porDefecto.id;
      }
    });
  
    this.productoService.obtenerProveedores().subscribe(proveedores => {
      this.proveedores = proveedores;
      if (!this.producto.Id && proveedores.length > 0) {
        this.producto.ProveedorId = proveedores[0].id;
      }
    });
  
    // this.productoService.obtenerEstados().subscribe(estados => {
    //   this.estados = estados;
    //   if (!this.producto.Id) {
    //     const estadoActivo = estados.find(e => e.Nombre?.toLowerCase() === 'activo');
    //     if (estadoActivo) this.producto.EstadoId = estadoActivo.Id;
    //   }
    // 
    // });
  }  
  

  

  /*ngOnInit(): void {
    this.cargarDatos();

    if (this.producto.Imagen) {
      this.imagenPrevia = this.getImagenUrl(this.producto.Imagen);
    }
  }*/

  /*cargarDatos(): void {
    this.productoService.obtenerCategorias().subscribe(categorias => {
      this.categorias = categorias;
      if (!this.producto.Id) {
        const catPorDefecto = categorias.find(c => c.Nombre?.toLowerCase() === 'general');
        if (catPorDefecto) this.producto.CategoriaId = catPorDefecto.Id;
      }
    });

    this.productoService.obtenerEstados().subscribe(estados => {
      this.estados = estados;
      if (!this.producto.Id) {
        const estadoActivo = estados.find(e => e.Nombre?.toLowerCase() === 'activo');
        if (estadoActivo) this.producto.EstadoId = estadoActivo.Id;
      }
    });
  }*/

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
    this.producto.Imagen = file.name;

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
    return this.productoService.getImagenUrl(nombreImagen);
  }

  async onSubmit(): Promise<void> {
    if (this.cargando) return;

    // if (this.productoForm.invalid || !this.validarFormulario()) {
    //   this.marcarCamposComoTocados();
    //   return;
    // }

    this.cargando = true;

    try {
      if (this.archivoImagen) {
        const nombreImagen = await this.productoService.subirImagen(this.archivoImagen).toPromise();
        this.producto.Imagen = nombreImagen;
      }

      const productoCompleto: Producto = {
        ...this.producto,
        Categoria: this.categorias.find(c => c.id === this.producto.CategoriaId),
        Estado: this.estados.find(e => e.Id === this.producto.EstadoId)
      };

      this.guardar.emit(productoCompleto);
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Ocurrió un error al guardar el producto. Intente nuevamente.');
    } finally {
      this.cargando = false;
    }
  }

  // private validarFormulario(): boolean {
  //   // const camposRequeridos = [
  //   //   // { campo: this.producto.Nombre?.trim(), mensaje: 'El nombre es requerido' },
  //   //   // { campo: this.producto.Precio, mensaje: 'El precio es requerido' },
  //   //   // { campo: this.producto.Stock, mensaje: 'El stock es requerido' }
  //   // ];

  //   for (const { campo, mensaje } of camposRequeridos) {
  //     if (campo === undefined || campo === null || campo === '') {
  //       alert(mensaje);
  //       return false;
  //     }
  //   }

  //   return true;
  // }
  

  private marcarCamposComoTocados(): void {
    if (!this.productoForm?.controls) return;
    Object.values(this.productoForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }
}