import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProductoConStock {
    productoId: number;
    nombre: string;
    codigoProducto: string;
    precioVenta: number; 
    precioCompra: number;
    stockDisponible: number;
    proveedorId: number;
    nombreProveedor: string;
    categoriaId: number;
    nombreCategoria: string;
    estadoId: number;
    nombreEstado: string;
    imagen: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProductosService {
    private readonly apiUrl = `${environment.apiUrl}/api/Stock`;

    constructor(private http: HttpClient) { }

    obtenerStockProductos(): Observable<ProductoConStock[]> {
        return this.http.get<ProductoConStock[]>(`${this.apiUrl}/stock`);
    }
}
