import { Component } from '@angular/core';

@Component({
    standalone: false,
    selector: 'app-access-denied',
    template: `
    <div class="access-denied-container">
      <div class="access-denied-box">
        <h1>Acceso Denegado</h1>
        <p>No tienes permiso para acceder a esta página.</p>
        <p>Por favor contacta al administrador si crees que deberías tener acceso.</p>
        <button class="btn btn-primary" (click)="goBack()">Volver</button>
      </div>
    </div>
  `,
    styles: [`
    .access-denied-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f8f9fa;
    }
    .access-denied-box {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 0 15px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 500px;
    }
    h1 {
      color: #dc3545;
      margin-bottom: 20px;
    }
    p {
      margin-bottom: 15px;
    }
    button {
      margin-top: 15px;
    }
  `]
})
export class AccessDeniedComponent {
    constructor() { }

    goBack() {
        window.history.back();
    }
}