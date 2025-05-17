
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class VentaService {
    private readonly apiUrl = `${environment.apiUrl}/api/venta`;

    constructor(private http: HttpClient) { }

    // Obtener todas las ventas
    obtenerVentas(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl).pipe(
            catchError(this.handleError)
        );
    }

    // Obtener una venta por ID
    obtenerVentaPorId(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    // Obtener recibo de venta
    obtenerReciboVenta(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/recibo/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    // Crear una nueva venta
    crearVenta(venta: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, venta).pipe(
            catchError(this.handleError)
        );
    }

    // Manejo de errores
    private handleError(error: any): Observable<never> {
        console.error('Error en servicio de ventas:', error);
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