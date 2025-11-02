import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./components/navbar/navbar";
import { Usuarios } from "./components/usuarios/usuarios";
import { Cultivos } from './components/cultivos/cultivos';
import { Home } from './components/home/home';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Usuarios, Cultivos, Home, ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('proyecto_angular');
}
