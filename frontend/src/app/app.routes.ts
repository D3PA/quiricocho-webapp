import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login').then(c => c.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/register/register').then(c => c.RegisterComponent)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard').then(c => c.DashboardComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'players', 
    loadComponent: () => import('./components/players/players').then(c => c.PlayersComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'player/:id', 
    loadComponent: () => import('./components/player-profile/player-profile').then(c => c.PlayerProfileComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'player-edit/:id', 
    loadComponent: () => import('./components/player-edit/player-edit').then(c => c.PlayerEditComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];