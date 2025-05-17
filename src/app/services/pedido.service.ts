import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Proveedor } from './proveedor.service';

@Injectable({
    providedIn: 'root'
})
export class PedidoService {
    private readonly apiUrl = `${environment.apiUrl}/api/pedidos`;

    constructor(private http: HttpClient) { }

    // Obtener todos los pedidos
    obtenerPedidos(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl).pipe(
            catchError(this.handleError)
        );
    }

    // Obtener un pedido por ID
    obtenerPedidoPorId(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    // Guardar o actualizar un pedido
    guardarPedido(pedido: any): Observable<any> {
        if (!pedido.id || pedido.id === 0) {
            // Crear nuevo pedido
            return this.http.post<any>(this.apiUrl, pedido).pipe(
                catchError(this.handleError)
            );
        } else {
            // Actualizar pedido existente
            return this.http.put<any>(`${this.apiUrl}/${pedido.id}`, pedido).pipe(
                catchError(this.handleError)
            );
        }
    }
    obtenerProveedores(): Observable<Proveedor[]> {
        return this.http.get<Proveedor[]>(`${environment.apiUrl}/api/proveedores`);
    }

    // Eliminación lógica de un pedido
    eliminarPedidoLogico(id: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/eliminar-logico/${id}`, {}).pipe(
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
