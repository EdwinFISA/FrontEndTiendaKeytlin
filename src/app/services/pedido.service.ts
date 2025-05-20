import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Proveedor } from './proveedor.service';
import { Producto } from './productos.service';
import { Pedido } from '../Menu/Inventario/pedidos/pedidos-modal/pedidos-modal.component';

@Injectable({
    providedIn: 'root'
})
export class PedidoService {
    private readonly apiUrl = `${environment.apiUrl}/api/pedidos`;

    constructor(private http: HttpClient) { }

    obtenerProductos(): Observable<Producto[]> {
        return this.http.get<Producto[]>(`${environment.apiUrl}/api/producto`);
    }

    obtenerProveedores(): Observable<Proveedor[]> {
        return this.http.get<Proveedor[]>(`${environment.apiUrl}/api/proveedores`);
    }

    obtenerEstados(): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/api/categorias/estados`);
    }

    obtenerPedidos(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl).pipe(
            catchError(this.handleError)
        );
    }

    obtenerPedidoPorId(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    crearPedido(pedido: Pedido): Observable<Pedido> {
        return this.http.post<Pedido>(this.apiUrl, pedido).pipe(
            catchError(this.handleError)
        );
    }

    actualizarPedido(id: number, pedido: Pedido): Observable<Pedido> {
        return this.http.put<Pedido>(`${this.apiUrl}/${id}`, pedido).pipe(
            catchError(this.handleError)
        );
    }

    guardarPedido(pedido: Pedido): Observable<Pedido> {
        if (pedido.id) {
            return this.actualizarPedido(pedido.id, pedido);
        } else {
            return this.crearPedido(pedido);
        }
    }

    eliminarPedidoLogico(id: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/eliminar-logico/${id}`, {}).pipe(
            catchError(this.handleError)
        );
    }

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
