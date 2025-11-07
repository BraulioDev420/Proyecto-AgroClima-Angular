import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, signal } from '@angular/core';



const AGRO_COLORS = {
  green: '#38a169',
  lightGreen: '#edfcf4',
  earth: '#b88a4c',
  bg: '#f7fafc',
  blue: '#4299e1'
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Home {
// Simulación de datos con señales (Angular >=17)
  cultivosActivos = signal(42);
  riegosRecientes = signal(24);
  pronosticoHoy = signal('28°C');
  pronosticoDescripcion = signal('Mayormente soleado');

  AGRO_COLORS = AGRO_COLORS;

  navItems = [
    { label: 'Inicio', active: true },
    { label: 'Cultivos', active: false },
    { label: 'Riegos', active: false },
    { label: 'Pronósticos', active: false },
    { label: 'Productividad', active: false },
    { label: 'Comunidad', active: false },
    { label: 'Recomendaciones', active: false },
    { label: 'Usuarios', active: false }
  ];
}



