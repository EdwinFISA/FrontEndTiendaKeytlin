import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { JwtInterceptor } from './interceptors/jwt.interceptors';
import { JwtModule } from '@auth0/angular-jwt';
import { ContactoComponent } from './Menu/Administracion/Contacto/contacto/contacto.component';
import { ContactoModalComponent } from './Menu/Administracion/Contacto/contacto-modal/contacto-modal.component';
import { UsuariosComponent } from './Menu/Administracion/Usuarios/usuarios/usuarios.component';
import { UsuarioModalComponent } from './Menu/Administracion/Usuarios/usuarios-modal/usuarios-modal.component';
import { ProveedoresComponent } from './Menu/Articulos/proveedores/proveedores/proveedores.component';
import { ProductosComponent } from './Menu/Articulos/productos/productos/productos.component';
import { AperturaCajaComponent } from './Menu/Caja/apertura-caja/apertura-caja.component';
import { CierreCajaComponent } from './Menu/Caja/cierre-caja/cierre-caja.component';
import { StockComponent } from './Menu/Inventario/stock/stock.component';
import { PedidosComponent } from './Menu/Inventario/pedidos/pedidos/pedidos.component';
import { VentasComponent } from './Menu/Ventas/ventas/ventas/ventas.component';
import { HistorialComponent } from './Menu/Ventas/historial/historial.component';
import { ReporteUsuarioComponent } from './Menu/Reportes/reporte-usuario/reporte-usuario.component';
import { ReporteVentaComponent } from './Menu/Reportes/reporte-venta/reporte-venta.component';
import { ReportePedidosComponent } from './Menu/Reportes/reporte-pedidos/reporte-pedidos.component';
import { ReporteInventarioComponent } from './Menu/Reportes/reporte-inventario/reporte-inventario.component';
import { ProveedoresModalComponent } from './Menu/Articulos/proveedores/proveedores-modal/proveedores-modal.component';
import { CategoriaComponent } from './Menu/Articulos/categoria/categoria/categoria.component';
import { CategoriaModalComponent } from './Menu/Articulos/categoria/categoria-modal/categoria-modal.component';
import { ProductosModalComponent } from './Menu/Articulos/productos/productos-modal/productos-modal.component';
import { PedidosModalComponent } from './Menu/Inventario/pedidos/pedidos-modal/pedidos-modal.component';
import { DetalleVentasComponent } from './Menu/Ventas/ventas/detalle-ventas/detalle-ventas.component';
import { ReciboVentasComponent } from './Menu/Ventas/ventas/recibo-ventas/recibo-ventas.component';
import { CommonModule } from '@angular/common';
import { OlvidarContrasenaComponent } from './components/olvidar-contrasena/olvidar-contrasena.component';
import { RolesComponent } from './Menu/Administracion/Roles/roles/roles.component';
import { RolesModalComponent } from './Menu/Administracion/Roles/roles-modal/roles-modal.component';
import { PermisosModalComponent } from './Menu/Administracion/Roles/permisos-modal/permisos-modal.component';

export function tokenGetter() {
  return localStorage.getItem('token');
}

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    ContactoComponent,
    ContactoModalComponent,
    ProductosComponent,
    AperturaCajaComponent,
    CierreCajaComponent,
    StockComponent,
    PedidosComponent,
    VentasComponent,
    HistorialComponent,
    ReporteUsuarioComponent,
    ReporteVentaComponent,
    ReportePedidosComponent,
    ReporteInventarioComponent,
    CategoriaComponent,
    CategoriaModalComponent,
    ProductosModalComponent,
    PedidosModalComponent,
    DetalleVentasComponent,
    ReciboVentasComponent,
    RolesComponent,
    RolesModalComponent,
    PermisosModalComponent,

  ],
  imports: [
    BrowserModule,
    UsuariosComponent,
    UsuarioModalComponent,
    CommonModule,
    ProveedoresComponent,
    ProveedoresModalComponent,
    AppRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    OlvidarContrasenaComponent,
    HttpClientModule,
    LoginComponent, // Importa LoginComponent como standalone
    DashboardComponent, // Importa DashboardComponent como standalone
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ['localhost:5010'],
        disallowedRoutes: ['http://localhost:5010/api/auth/login']
      }
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
