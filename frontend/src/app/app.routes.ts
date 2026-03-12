import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'events',
    loadComponent: () =>
      import('./pages/events/events.page').then((m) => m.EventsPage),
  },

  // ✅ THIS IS THE MISSING ROUTE
  {
    path: 'events/:id/markets',
    loadComponent: () =>
      import('./pages/markets/markets.page').then((m) => m.MarketsPage),
  },

  // (optional) keep this if you still want /markets to open the markets page directly
  {
    path: 'markets',
    loadComponent: () =>
      import('./pages/markets/markets.page').then((m) => m.MarketsPage),
  },

  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'predict',
    loadComponent: () => import('./pages/predict/predict.page').then( m => m.PredictPage)
  },

  {
  path: 'markets/:id/predict',
  loadComponent: () =>
    import('./pages/predict/predict.page').then((m) => m.PredictPage),
},
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/history/history.page').then( m => m.HistoryPage)
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./pages/leaderboard/leaderboard.page').then( m => m.LeaderboardPage)
  },
  {
    path: 'admin-login',
    loadComponent: () => import('./pages/admin-login/admin-login.page').then( m => m.AdminLoginPage)
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.page').then( m => m.AdminPage)
  },
  {
    path: 'admin-markets',
    loadComponent: () => import('./pages/admin-markets/admin-markets.page').then( m => m.AdminMarketsPage)
  },
  {
    path: 'admin-create-event',
    loadComponent: () => import('./pages/admin-create-event/admin-create-event.page').then( m => m.AdminCreateEventPage)
  },
];