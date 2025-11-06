import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private apiService: ApiService) {}

  login(correo: string, contrasena: string) {
    // devuelve Observable de la petición al backend
    return this.apiService.post('login', { correo, contrasena });
  }

  guardarUsuario(user: any) {
    localStorage.setItem('usuario', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');   // flag sencillo usado por el guard
  }

  obtenerUsuario() {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('isLoggedIn');
  }

  estaAutenticado(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }
}
