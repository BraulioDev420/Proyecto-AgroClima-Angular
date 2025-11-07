import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service'; // <- ajusta ../.. según tu estructura

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  nombre = '';
  correo = '';
  contrasena = '';
  ubicacion = '';

  constructor(private api: ApiService, private router: Router) {}

  onRegister() {
    const nuevoUsuario = {
      nombre: this.nombre,
      correo: this.correo,
      contrasena: this.contrasena,
      ubicacion: this.ubicacion,
      EstLogico: 1,
    };

    this.api.post('usuarios', nuevoUsuario).subscribe({
      next: () => {
        alert('Registro correcto');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        alert('Error al registrar');
      },
    });
  }
}
