import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.estaAutenticado()) {
      // Si está autenticado, permite el acceso
      return true;
    } else {
      // Si no está autenticado, redirige al login
      this.router.navigate(['/login']);
      return false;
    }
  }
}
