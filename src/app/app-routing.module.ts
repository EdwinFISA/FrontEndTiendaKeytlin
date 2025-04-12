import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UsuariosComponent } from '../app/Menu/Administracion/Usuarios/usuarios/usuarios.component';
import { UsuarioModalComponent } from '../app/Menu/Administracion/Usuarios/usuarios-modal/usuarios-modal.component';
import { ContactoComponent } from '../app/Menu/Administracion/Contacto/contacto/contacto.component';
import { ContactoModalComponent } from '../app/Menu/Administracion/Contacto/contacto-modal/contacto-modal.component';
import { ProveedoresComponent } from './Menu/Articulos/proveedores/proveedores/proveedores.component';
import { ProveedoresModalComponent } from './Menu/Articulos/proveedores/proveedores-modal/proveedores-modal.component';
import { CategoriaComponent } from './Menu/Articulos/categoria/categoria/categoria.component';
import { AperturaCajaComponent } from './Menu/Caja/apertura-caja/apertura-caja.component';
import { CierreCajaComponent } from './Menu/Caja/cierre-caja/cierre-caja.component';  
import { ProductosComponent } from './Menu/Articulos/productos/productos/productos.component';  
import { ProductosModalComponent } from './Menu/Articulos/productos/productos-modal/productos-modal.component';
import { PedidosComponent } from './Menu/Inventario/pedidos/pedidos/pedidos.component';
import { PedidosModalComponent } from './Menu/Inventario/pedidos/pedidos-modal/pedidos-modal.component';
import { StockComponent } from './Menu/Inventario/stock/stock.component';
import { VentasComponent } from './Menu/Ventas/ventas/ventas/ventas.component';
import { DetalleVentasComponent } from './Menu/Ventas/ventas/detalle-ventas/detalle-ventas.component';
import { ReciboVentasComponent } from './Menu/Ventas/ventas//recibo-ventas/recibo-ventas.component';
import { HistorialComponent } from './Menu/Ventas/historial/historial.component';
import { ReporteInventarioComponent } from './Menu/Reportes/reporte-inventario/reporte-inventario.component';
import { ReportePedidosComponent } from './Menu/Reportes/reporte-pedidos/reporte-pedidos.component';
import { ReporteUsuarioComponent } from './Menu/Reportes/reporte-usuario/reporte-usuario.component';
import { ReporteVentaComponent } from './Menu/Reportes/reporte-venta/reporte-venta.component';
import { RolesComponent } from './Menu/Administracion/Roles/roles/roles.component';
import { RolesModalComponent } from './Menu/Administracion/Roles/roles-modal/roles-modal.component';
import { OlvidarContrasenaComponent } from './components/olvidar-contrasena/olvidar-contrasena.component';
import { AuthGuard } from './guards/auth.guard';
import { AccessDeniedComponent } from './components/login/access-denied.component';

const routes: Routes = [
  {
    path: '', redirectTo: 'login', pathMatch: 'full'
  },
  { 
    path: 'login', component: LoginComponent,
  
  },
  {
    path: 'access-denied', component: AccessDeniedComponent,
  },
  {
    
    path: 'home', component: SidebarComponent, 
    
    children: [
      { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'caja/apertura-caja', component:  AperturaCajaComponent, canActivate: [AuthGuard]},
      { path: 'caja/cierre-caja', component: CierreCajaComponent, canActivate: [AuthGuard]},
      { path: 'articulos/productos', component: ProductosComponent, canActivate: [AuthGuard]},
      { path: 'articulos/productos-modal', component: ProductosModalComponent, canActivate: [AuthGuard] },
      { path: 'articulos/proveedores', component: ProveedoresComponent, canActivate: [AuthGuard] },
      { path: 'articulos/proveedores-modal', component: ProveedoresModalComponent, canActivate: [AuthGuard] },
      { path: 'articulos/categoria', component: CategoriaComponent, canActivate: [AuthGuard]  },
      { path: 'inventario/pedidos', component: PedidosComponent,canActivate: [AuthGuard]  },
      { path: 'inventario/pedidos-modal', component: PedidosModalComponent, canActivate: [AuthGuard] },
      { path: 'inventario/stock', component: StockComponent, canActivate: [AuthGuard] },
      { path: 'ventas/venta', component: VentasComponent, canActivate: [AuthGuard] },
      { path: 'ventas/detalle-venta', component: DetalleVentasComponent, canActivate: [AuthGuard] },
      { path: 'ventas/recibo-venta', component: ReciboVentasComponent, canActivate: [AuthGuard] },
      { path: 'ventas/historial', component: HistorialComponent, canActivate: [AuthGuard] },
      { path: 'administracion/usuarios', component: UsuariosComponent, canActivate: [AuthGuard] },
      { path: 'administracion/usuario-modal', component: UsuarioModalComponent, canActivate: [AuthGuard] },
      { path: 'administracion/contacto', component: ContactoComponent, canActivate: [AuthGuard]  },
      { path: 'administracion/contacto-modal', component: ContactoModalComponent, canActivate: [AuthGuard] },
      { path: 'administracion/roles', component: RolesComponent, canActivate: [AuthGuard] },
      { path: 'administracion/roles-modal', component: RolesModalComponent, canActivate: [AuthGuard] },
      { path: 'reportes/usuarios', component: ReporteUsuarioComponent, canActivate: [AuthGuard]},
      { path: 'reportes/ventas', component: ReporteVentaComponent, canActivate: [AuthGuard]},
      { path: 'reportes/pedidos', component: ReportePedidosComponent, canActivate: [AuthGuard] },
      { path: 'reportes/inventario', component: ReporteInventarioComponent, canActivate: [AuthGuard] },
      // Otras rutas aquí
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

