import { Routes } from '@angular/router';
import { DirectorioComponent } from './pages/directorio/directorio.component';
import { LoginComponent } from './pages/login/login.component';
// importa tu guard:
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'directorio',
    component: DirectorioComponent,
    canActivate: [AuthGuard] // ✅ protegida
  },
  {
    path: 'vacantes',
    loadComponent: () => import('./pages/vacantes/vacantes.component').then(m => m.VacantesComponent),
    canActivate: [AuthGuard] // ✅ protegida también
  },
  // puedes seguir agregando más rutas protegidas
];

