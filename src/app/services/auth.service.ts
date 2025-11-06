import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  constructor(private apiService: ApiService) {}

  login(correo: string, contrasena: string): Observable<any> {
    const credentials = {
      correo: correo,
      contrasena: contrasena
    };
    return this.apiService.post('login', credentials);
  }

  guardarUsuario(user: any) {
    localStorage.setItem('usuario', JSON.stringify(user));
  }

  obtenerUsuario() {
    const user = localStorage.getItem('usuario');
    return user ? JSON.parse(user) : null;
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
  }

  estaAutenticado(): boolean {
    return this.obtenerUsuario() !== null;
  }
}