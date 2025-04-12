import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CategoriaService {
    private readonly apiUrl = `${environment.apiUrl}/api/categorias`;

    constructor(private http: HttpClient) { }

    // Obtener todas las categorías
    obtenerCategorias(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl).pipe(
            map(categorias => categorias.map(cat => ({
                ...cat,
                Id: cat.id || cat.Id,
                Nombre: cat.nombre || cat.Nombre,
                Descripcion: cat.descripcion || cat.Descripcion,
                EstadoId: cat.estadoId || cat.EstadoId,
                estadoNombre: cat.estado?.nombre || cat.Estado?.Nombre
            }))),
            catchError(this.handleError)
        );
    }

    // Obtener una categoría por ID
    obtenerCategoriaPorId(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    // Guardar o actualizar una categoría
    guardarCategoria(categoria: any): Observable<any> {
        const categoriaParaEnviar = {
            Id: categoria.Id || 0,
            Nombre: categoria.Nombre,
            Descripcion: categoria.Descripcion,
            EstadoId: categoria.EstadoId
        };

        if (!categoriaParaEnviar.Id) {
            return this.http.post<any>(this.apiUrl, categoriaParaEnviar).pipe(
                catchError(this.handleError)
            );
        } else {
            return this.http.put<any>(`${this.apiUrl}/${categoriaParaEnviar.Id}`, categoriaParaEnviar).pipe(
                catchError(this.handleError)
            );
        }
    }

    // Eliminar categoría
    eliminarCategoria(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
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