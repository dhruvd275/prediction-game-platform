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
];