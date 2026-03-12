import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [authGuard],
  },
  {
    path: 'events',
    loadComponent: () =>
      import('./pages/events/events.page').then((m) => m.EventsPage),
    canActivate: [authGuard],
  },
  {
    path: 'events/:id/markets',
    loadComponent: () =>
      import('./pages/markets/markets.page').then((m) => m.MarketsPage),
    canActivate: [authGuard],
  },
  {
    path: 'markets',
    loadComponent: () =>
      import('./pages/markets/markets.page').then((m) => m.MarketsPage),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'predict',
    loadComponent: () => import('./pages/predict/predict.page').then(m => m.PredictPage),
    canActivate: [authGuard],
  },
  {
    path: 'markets/:id/predict',
    loadComponent: () =>
      import('./pages/predict/predict.page').then((m) => m.PredictPage),
    canActivate: [authGuard],
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./pages/history/history.page').then((m) => m.HistoryPage),
    canActivate: [authGuard],
  },
  {
    path: 'leaderboard',
    loadComponent: () =>
      import('./pages/leaderboard/leaderboard.page').then((m) => m.LeaderboardPage),
    canActivate: [authGuard],
  },
  {
    path: 'admin-login',
    loadComponent: () =>
      import('./pages/admin-login/admin-login.page').then((m) => m.AdminLoginPage),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin.page').then((m) => m.AdminPage),
    canActivate: [adminGuard],
  },
  {
    path: 'admin-markets',
    loadComponent: () =>
      import('./pages/admin-markets/admin-markets.page').then((m) => m.AdminMarketsPage),
    canActivate: [adminGuard],
  },
  {
    path: 'admin-create-event',
    loadComponent: () =>
      import('./pages/admin-create-event/admin-create-event.page').then((m) => m.AdminCreateEventPage),
    canActivate: [adminGuard],
  },
];