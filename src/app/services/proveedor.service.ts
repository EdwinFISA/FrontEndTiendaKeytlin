import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Proveedor {
  id?: number;
  nombre: string;
  nombreContacto: string;
  telefono: string;
  telefonoContacto?: string;
  correo?: string;
  direccion?: string;
  estado: string;
  descripcion?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProveedorService {
  private apiUrl = `${environment.apiUrl}/api/proveedores`;

  constructor(private http: HttpClient) { }

  getProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.apiUrl);
  }

  addProveedor(proveedor: Proveedor): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.apiUrl, proveedor);
  }

  updateProveedor(id: number, proveedor: Proveedor): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.apiUrl}/${id}`, proveedor);
  }

  deleteProveedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
