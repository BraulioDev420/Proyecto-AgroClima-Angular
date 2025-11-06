import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar {
  constructor(private authService: AuthService, private router: Router) {}

  salir() {
    // Cierra la sesión
    this.authService.cerrarSesion();
    // Redirige al login
    this.router.navigate(['/login']);
  }
}
