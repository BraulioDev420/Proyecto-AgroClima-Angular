import { Routes } from '@angular/router';
import { Usuarios } from './components/usuarios/usuarios';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Cultivos } from './components/cultivos/cultivos';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { AuthGuard } from './guards/auth.guard';
import { Register } from './components/register/register';
import { PlantPrediction } from './components/plant-prediction/plant-prediction';

export const routes: Routes = [
  
  //{ path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: '', component: Home },
  { path: 'usuarios', component: Usuarios },
  { path: 'cultivos', component: Cultivos },
  { path: 'plant-prediction', component: PlantPrediction },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
