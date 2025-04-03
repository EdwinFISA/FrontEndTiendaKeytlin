import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import { CommonModule } from '@angular/common'; // Importa CommonModule para usar ngClass
import { AuthService, LoginModel } from '../../services/auth.service'; // Importa AuthService y LoginModel
import Swal from 'sweetalert2'; // Importa SweetAlert2

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
   // Marca el componente como standalone
  imports: [FormsModule, CommonModule] // Importa FormsModule y CommonModule
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  passwordType: string = 'password'; // Contraseña oculta por defecto
  emailInvalid: boolean = false; // Para manejar la validación del correo
  passwordInvalid: boolean = false; // Para manejar la validación de la contraseña

  constructor(private authService: AuthService, private router: Router) { }

  login() {
    this.emailInvalid = !this.email;
    this.passwordInvalid = !this.password;

    if (this.emailInvalid || this.passwordInvalid) {
      return;
    }

    const loginData: LoginModel = { email: this.email, password: this.password }; // Asegúrate de que los nombres de los campos coincidan con los esperados por el backend

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
        // Cerrar pantalla de carga
        Swal.close();
        // Redirige a la página de inicio (home)
        this.router.navigate(['/home']);
      },
      error: (error) => {
        // Cerrar pantalla de carga
        Swal.close();
        let errorMessage = 'Error en el servidor. Inténtalo más tarde.';
        if (error.status >= 400 && error.status < 500) {
          errorMessage = 'Credenciales incorrectas';
        } else if (error.status >= 500) {
          errorMessage = 'Error en el servidor. Inténtalo más tarde.';
        }

        // Mostrar mensaje de error
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
        });
      }
    });
  }

  // Método para alternar visibilidad de la contraseña
  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }
}
