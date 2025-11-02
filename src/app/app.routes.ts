import { Routes } from '@angular/router';
import { Usuarios } from './components/usuarios/usuarios';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Cultivos } from './components/cultivos/cultivos';
import { Home } from './components/home/home';


export const routes: Routes = [

    { path: '', component: Home },
    { path: 'usuarios', component: Usuarios },
    { path: 'cultivos', component: Cultivos },
    



];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
