import { Routes } from '@angular/router';
import { AuthComponent } from '../../src/app/components/usuario/auth/auth';
import { AuthenticationGuard } from './security/guards/authentication-guard';
import { EventosComponent } from '../../src/app/components/evento/lista-eventos/lista-eventos';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' }, /* http://localhost:4200/ */
    { path: 'login', component: AuthComponent },
    { path: "registro", component: AuthComponent },
    { path: 'password', component: AuthComponent },
    { path: "inicio", component: EventosComponent, canActivate:[AuthenticationGuard] }
];