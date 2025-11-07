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
    console.log('💾 Usuario guardado:', user);
  }

  obtenerUsuario() {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  }

  // 🆔 OBTENER ID DEL USUARIO ACTUAL
  obtenerIdUsuario(): number {
    const usuario = this.obtenerUsuario();
    if (usuario) {
      // Intentar diferentes nombres de campo que puede usar tu API
      return usuario.IdUsuario || usuario.id_usuario || usuario.id || 0;
    }
    return 0;
  }

  // 📧 OBTENER CORREO DEL USUARIO
  obtenerCorreoUsuario(): string {
    const usuario = this.obtenerUsuario();
    return usuario?.Correo || usuario?.correo || usuario?.email || '';
  }

  // 👤 OBTENER NOMBRE DEL USUARIO
  obtenerNombreUsuario(): string {
    const usuario = this.obtenerUsuario();
    return usuario?.Nombre || usuario?.nombre || usuario?.name || 'Usuario';
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('isLoggedIn');
  }

  estaAutenticado(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }
}