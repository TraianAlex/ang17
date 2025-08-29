import { Route } from '@angular/router';

export const REACTIVE_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./components/hero-table/hero-table.component').then((m) => m.HeroTableComponent),
  },
  {
    path: ':heroId',
    loadComponent: () => import('./components/hero-details/hero-details.component').then((m) => m.HeroDetailsComponent),
  },
];
