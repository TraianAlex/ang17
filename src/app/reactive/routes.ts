import { Route } from '@angular/router';

import { HeroTableComponent } from './components/hero-table/hero-table.component';
import { HeroDetailsComponent } from './components/hero-details/hero-details.component';

export const REACTIVE_ROUTES: Route[] = [
  {
    path: '',
    component: HeroTableComponent,
  },
  {
    path: ':heroId',
    component: HeroDetailsComponent,
  },
];
