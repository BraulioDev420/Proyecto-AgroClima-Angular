import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css'],
})
export class Usuarios {
  publicaciones: any[] = [];
  misPublicaciones: any[] = [];
  comentarios: { [idPublicacion: number]: any[] } = {};
  nuevoComentario: { [idPublicacion: number]: string } = {};
  mostrarComentarios: { [idPublicacion: number]: boolean } = {};
  cargando: boolean = true;
  usuarios: { [id: number]: string } = {}; // Cache de nombres de usuarios

  // Para crear nueva publicación solo contenido
  nuevaPublicacion: { contenido: string } = { contenido: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.cargarTodosLosUsuarios();
    this.cargarPublicaciones();
    this.cargarMisPublicaciones();
  }

  cargarTodosLosUsuarios() {
    this.api.get('usuarios/activos').subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          data.forEach((usuario: any) => {
            this.usuarios[usuario.id_usuario] = usuario.nombre;
          });
        }
      },
      error: (err) => {},
    });
  }

  cargarPublicaciones() {
    this.api.get('publicaciones').subscribe({
      next: (data: any) => {
        this.publicaciones = data;
        const idsValidos = data
          .map((p: any) => p.id_usuario)
          .filter((id: any) => id != null && id !== undefined);
        this.cargarNombresUsuarios(idsValidos);
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
      },
    });
  }

  cargarMisPublicaciones() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (!usuario.id_usuario) return;

    this.api.get(`publicaciones/usuario/${usuario.id_usuario}`).subscribe({
      next: (data: any) => {
        this.misPublicaciones = data;
      },
      error: (err) => {},
    });
  }

  cargarNombresUsuarios(ids: number[]) {
    const idsUnicos = [...new Set(ids)].filter(
      (id) => id != null && id !== undefined && id > 0 && !this.usuarios[id]
    );

    if (idsUnicos.length === 0) return;

    idsUnicos.forEach((id) => {
      this.api.get(`usuarios/activos/${id}`).subscribe({
        next: (response: any) => {
          if (Array.isArray(response) && response.length > 0) {
            const usuario = response[0];
            this.usuarios[id] = usuario?.nombre || 'Sin nombre';
          } else {
            this.usuarios[id] = 'Usuario inactivo';
          }
        },
        error: (err) => {
          this.usuarios[id] = 'Error al cargar';
        },
      });
    });
  }

  getNombreUsuario(idUsuario: number): string {
    return this.usuarios[idUsuario] || 'Cargando...';
  }

  cargarComentarios(idPublicacion: number) {
    this.api.get(`respuestas/publicacion/${idPublicacion}`).subscribe({
      next: (data: any) => {
        this.comentarios[idPublicacion] = data;
        const idsValidos = data
          .map((c: any) => c.id_usuario)
          .filter((id: any) => id != null && id !== undefined);
        this.cargarNombresUsuarios(idsValidos);
      },
      error: (err) => {},
    });
  }

  toggleComentarios(idPublicacion: number) {
    this.mostrarComentarios[idPublicacion] = !this.mostrarComentarios[idPublicacion];
    if (this.mostrarComentarios[idPublicacion] && !this.comentarios[idPublicacion]) {
      this.cargarComentarios(idPublicacion);
    }
  }

  agregarComentario(idPublicacion: number) {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const contenido = this.nuevoComentario[idPublicacion]?.trim();
    if (!contenido) return;

    const nuevo = {
      id_usuario: usuario.id_usuario,
      id_publicacion: idPublicacion,
      contenido,
    };

    this.api.post('respuestas', nuevo).subscribe({
      next: () => {
        this.nuevoComentario[idPublicacion] = '';
        this.cargarComentarios(idPublicacion);
      },
      error: (err) => {},
    });
  }

  // ➕ Crear nueva publicación solo contenido
  crearPublicacion() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (!usuario.id_usuario) return;

    const nueva = {
      id_usuario: usuario.id_usuario,
      contenido: this.nuevaPublicacion.contenido.trim(),
      fecha_publicacion: new Date().toISOString(),
      EstLogico: 1,
    };

    if (!nueva.contenido) return;

    this.api.post('publicaciones', nueva).subscribe({
      next: () => {
        this.nuevaPublicacion = { contenido: '' };
        this.cargarPublicaciones();
        this.cargarMisPublicaciones();
      },
      error: (err) => {},
    });
  }
}
