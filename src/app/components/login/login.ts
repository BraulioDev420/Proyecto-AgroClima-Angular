import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 
import { Router, RouterLink } from '@angular/router'; //
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true, 
   imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  correo: string = '';
  contrasena: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    // Validar que los campos no estén vacíos
    if (!this.correo || !this.contrasena) {
      alert('Por favor completa todos los campos');
      return;
    }

    this.authService.login(this.correo, this.contrasena).subscribe({
      next: (res: any) => {
        // Tu API devuelve: { success: true, message: "...", user: {...} }
        if (res.success) {
          // Guardar el usuario en localStorage
          this.authService.guardarUsuario(res.user);
          alert(res.message); // Muestra: "Inicio de sesión exitoso"
          // Navegar al home
          this.router.navigate(['/home']);
        } else {
          alert('Correo o contraseña incorrectos');
        }
      },
      error: (err) => {
        console.error('Error en el login:', err);
        
        // Manejar errores según el código de estado
        if (err.status === 401 || err.status === 400) {
          alert(err.error?.message || 'Correo o contraseña incorrectos');
        } else if (err.status === 0) {
          alert('No se pudo conectar con el servidor. Verifica tu conexión.');
        } else {
          alert('Error al intentar iniciar sesión');
        }
      }
    });
  }
}