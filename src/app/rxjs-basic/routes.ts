import { Route } from '@angular/router';

export const RXJS_BASIC: Route[] = [
  {
    path: '',
    loadComponent: () => import('./rxjs-basic.component').then((m) => m.RxjsBasicComponent),
  },
];
