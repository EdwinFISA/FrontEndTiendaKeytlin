import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, LoginModel } from '../../services/auth.service';
import { OlvidarContrasenaComponent } from '../olvidar-contrasena/olvidar-contrasena.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule, OlvidarContrasenaComponent] // Importa FormsModule y CommonModule
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  passwordType: string = 'password';
  emailInvalid: boolean = false;
  passwordInvalid: boolean = false;
  mostrarModal = false;

  constructor(private authService: AuthService, private router: Router) { }

  login() {
    this.emailInvalid = !this.email;
    this.passwordInvalid = !this.password;
  
    if (this.emailInvalid || this.passwordInvalid) {
      return;
    }
  
    const loginData: LoginModel = { email: this.email, password: this.password };

    // Mostrar pantalla de carga
    Swal.fire({
      title: 'Iniciando sesión...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    this.authService.login(loginData).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        
        // Verificar que el token se haya guardado correctamente
        setTimeout(() => {
          const token = localStorage.getItem('token');
          console.log('Token stored in localStorage:', token ? 'Yes' : 'No');
          
          if (token) {
            // Cerrar pantalla de carga
            Swal.close();
            
            // Redirige a la página de inicio (home)
            this.router.navigate(['/home']);
          } else {
            // Si no se guardó el token
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo almacenar el token de autenticación',
            });
          }
        }, 100); // Pequeño retraso para asegurar que el almacenamiento se complete
      },
      error: (err) => {
        console.error('Login error:', err);
        
        Swal.close();
        
        // Manejo mejorado de errores que captura diferentes formatos de respuesta
        let errorTitle = 'Error de autenticación';
        let errorMessage = '';
        
        // Si el error es un objeto Error (del servicio auth)
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        // Si el error viene del backend con estructura específica
        else if (err?.error?.message) {
          errorMessage = err.error.message;
        }
        // Si el error tiene status code para interpretar
        else if (err?.status === 0) {
          errorMessage = 'Error de conexión: No se puede conectar al servidor.';
        } 
        else if (err?.status === 401) {
          errorMessage = 'Credenciales inválidas. Verifique su correo y contraseña.';
        }
        else if (err?.status === 403) {
          errorMessage = 'Su cuenta no tiene permisos para acceder.';
        }
        else if (err?.status >= 500) {
          errorMessage = 'Error interno del servidor. Por favor, intente nuevamente más tarde.';
        }
        else {
          // Si ninguna de las condiciones anteriores coincide
          errorMessage = 'Ha ocurrido un error inesperado. Por favor, intente nuevamente.';
        }
        
        Swal.fire({
          icon: 'error',
          title: errorTitle,
          text: errorMessage,
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  // Método para alternar visibilidad de la contraseña
  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  abrirModal() {
    this.mostrarModal = true; // Abre el modal
  }

  // Método para cerrar el modal de Olvidar Contraseña
  cerrarModal() {
    this.mostrarModal = false;
  }
}