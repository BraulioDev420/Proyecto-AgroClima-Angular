import { Routes } from '@angular/router';
import { Usuarios } from './components/usuarios/usuarios';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Cultivos } from './components/cultivos/cultivos';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { AuthGuard } from './guards/auth.guard';
export const routes: Routes = [
  //ruta para logeo en prueba
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'home', component: Home, canActivate: [AuthGuard] },
  { path: 'usuarios', component: Usuarios, canActivate: [AuthGuard] },
  { path: 'cultivos', component: Cultivos, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
