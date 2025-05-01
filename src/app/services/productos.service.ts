import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly apiUrl = `${environment.apiUrl}/api/productos`;

  constructor(private http: HttpClient) { }

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
  subirImagen(archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post(`${this.apiUrl}/subir-imagen`, formData, {
      reportProgress: true,
      observe: 'body'
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener URL de la imagen
  public getImagenUrl(nombreImagen: string): string {
    return `${this.apiUrl}/imagenes/${nombreImagen}`;
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
