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


const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'home', component: SidebarComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'administracion/usuarios', component: UsuariosComponent },
      { path: 'administracion/usuario-modal', component: UsuarioModalComponent },
      { path: 'administracion/contacto', component: ContactoComponent },
      { path: 'administracion/contacto-modal', component: ContactoModalComponent },
      { path: 'articulos/proveedores', component: ProveedoresComponent },
      { path: 'articulos/proveedores-modal', component: ProveedoresModalComponent },
      { path: 'Articulos/categoria', component: CategoriaComponent },
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

