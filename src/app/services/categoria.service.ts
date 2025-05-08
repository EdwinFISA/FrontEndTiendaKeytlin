import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Categoria {

  id?: number;
  categoriaNombre: string;
  descripcion: string;
  estadoUsuarioId: number;
  estadoUsuario?: EstadoUsuario;
  fechaCreacion?: string;
}

export interface EstadoUsuario {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private readonly apiUrl = `${environment.apiUrl}/api/categorias`;

  constructor(private http: HttpClient) {}

  // Obtener todas las categorías
  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl).pipe(
      map(categorias => categorias.map(cat => this.mapearCategoria(cat)))
    );
  }

  // Obtener una categoría por ID
  obtenerCategoria(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`).pipe(
      map(categoria => this.mapearCategoria(categoria))
    );
  }

  // Guardar categoría (crear nueva o actualizar existente)
  guardarCategoria(categoria: Categoria): Observable<any> {
    const categoriaBackend = this.mapearCategoriaParaBackend(categoria);
    
    if (categoria.id && categoria.id > 0) {
      return this.http.put(`${this.apiUrl}/${categoria.id}`, categoriaBackend);
    } else {
      return this.http.post(this.apiUrl, categoriaBackend);
    }
  }

  // Eliminar una categoría
  eliminarCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Obtener estados desde el backend
  obtenerEstados(): Observable<EstadoUsuario[]> {
    return this.http.get<EstadoUsuario[]>(`${this.apiUrl}/estados`);
  }

  // Métodos privados para mapeo entre modelos frontend y backend
  private mapearCategoria(categoriaBackend: any): Categoria {
    return {
      id: categoriaBackend.id,
      categoriaNombre: categoriaBackend.categoriaNombre,
      descripcion: categoriaBackend.descripcion,
      estadoUsuarioId: categoriaBackend.estadoUsuarioId,
      estadoUsuario: categoriaBackend.estadoUsuario,
      // Usando fecha actual como placeholder si no hay fecha de creación
      fechaCreacion: new Date().toISOString() 
    };
  }

  private mapearCategoriaParaBackend(categoriaFrontend: Categoria): any {
    return {
      id: categoriaFrontend.id || 0,
      categoriaNombre: categoriaFrontend.categoriaNombre,
      descripcion: categoriaFrontend.descripcion,
      estadoUsuarioId: categoriaFrontend.estadoUsuarioId
    };
  }
}