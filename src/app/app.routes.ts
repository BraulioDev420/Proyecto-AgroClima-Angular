import { Routes } from '@angular/router';
import { Usuarios } from './components/usuarios/usuarios';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Cultivos } from './components/cultivos/cultivos';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { AuthGuard } from './guards/auth.guard';
import { Register } from './components/register/register';

export const routes: Routes = [
  
  //{ path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: '', component: Home },
  { path: 'usuarios', component: Usuarios, canActivate: [AuthGuard] },
  { path: 'cultivos', component: Cultivos, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
