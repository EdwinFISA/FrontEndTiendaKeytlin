import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Categoria } from './categoria.service';
import { Proveedor } from './proveedor.service';

export interface Producto {}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly apiBaseUrl = `${environment.apiUrl}/api/producto`;
  private readonly apiUrl = `${environment.apiUrl}/api/Producto`;

  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${environment.apiUrl}/api/categorias`);
  }
  
  obtenerProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${environment.apiUrl}/api/proveedores`);
  }
  
  obtenerEstados(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/categorias/estados`);
  }
  

  constructor(private http: HttpClient) { }
  // Método para obtener URL de imágenes
  public getImagenUrl(nombreImagen: string): string {
    return `${this.apiBaseUrl}/imagenes/${nombreImagen}`;
  }

  // Obtener todos los productos
  obtenerProductos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }
  

  // Obtener un producto por ID
  obtenerProductoPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Guardar o actualizar un producto
  guardarProducto(producto: any): Observable<any> {
    if (!producto.id || producto.id === 0) {
      // Crear producto nuevo
      return this.http.post<any>(this.apiUrl, producto).pipe(
        catchError(this.handleError)
      );
    } else {
      // Actualizar producto existente
      return this.http.put<any>(`${this.apiUrl}/${producto.id}`, producto).pipe(
        catchError(this.handleError)
      );
    }
  }

  // Eliminar producto (eliminación lógica)
  eliminarProductoLogico(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/eliminar-logico/${id}`, {}).pipe(
      catchError(this.handleError)
    );
  }


    // Subir imagen de producto
  subirImagen(archivo: File): Observable<string> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<string>('https://localhost:56232/api/productos/subir-imagen', formData);
  }
  

  // Manejo de errores
  private handleError(error: any): Observable<never> {
    console.error('Error detallado:', error);
    let mensajeError = 'Ha ocurrido un error';

    if (error?.error?.errors) {
      mensajeError = Object.entries(error.error.errors)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join('\n');
    } else if (error?.error?.message) {
      mensajeError = error.error.message;
    } else if (error?.message) {
      mensajeError = error.message;
    }

    return throwError(() => new Error(mensajeError));
  }
}


