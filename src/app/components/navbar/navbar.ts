import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: true,
  imports: [CommonModule],
})
export class Navbar {
  usuarioLogueado: { nombre: string } | null = null;

  constructor(private router: Router) {
    // Mismo método que en tus publicaciones
    const usuario = localStorage.getItem('usuario');
    this.usuarioLogueado = usuario ? JSON.parse(usuario) : null;
  }
  
  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.usuarioLogueado = null;
    this.router.navigate(['/login']);
  }
}
