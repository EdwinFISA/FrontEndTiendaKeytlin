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
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '', redirectTo: 'login', pathMatch: 'full'
  },
  { 
    path: 'login', component: LoginComponent,
  },
  {
    path: 'home', component: SidebarComponent, 
    children: [
      { path: '', component: DashboardComponent,  },
      { path: 'caja/apertura-caja', component:  AperturaCajaComponent, },
      { path: 'caja/cierre-caja', component: CierreCajaComponent, },
      { path: 'articulos/productos', component: ProductosComponent, },
      { path: 'articulos/productos-modal', component: ProductosModalComponent,  },
      { path: 'articulos/proveedores', component: ProveedoresComponent,  },
      { path: 'articulos/proveedores-modal', component: ProveedoresModalComponent,  },
      { path: 'articulos/categoria', component: CategoriaComponent,   },
      { path: 'inventario/pedidos', component: PedidosComponent,  },
      { path: 'inventario/pedidos-modal', component: PedidosModalComponent,  },
      { path: 'inventario/stock', component: StockComponent,  },
      { path: 'ventas/venta', component: VentasComponent,  },
      { path: 'ventas/detalle-venta', component: DetalleVentasComponent,  },
      { path: 'ventas/recibo-venta', component: ReciboVentasComponent,  },
      { path: 'ventas/historial', component: HistorialComponent,  },
      { path: 'administracion/usuarios', component: UsuariosComponent,  },
      { path: 'administracion/usuario-modal', component: UsuarioModalComponent,  },
      { path: 'administracion/contacto', component: ContactoComponent,  },
      { path: 'administracion/contacto-modal', component: ContactoModalComponent,  },
      { path: 'reportes/usuarios', component: ReporteUsuarioComponent, },
      { path: 'reportes/ventas', component: ReporteVentaComponent, },
      { path: 'reportes/pedidos', component: ReportePedidosComponent,  },
      { path: 'reportes/inventario', component: ReporteInventarioComponent, },
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

