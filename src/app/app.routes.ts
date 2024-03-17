import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { TestComponent } from './test/test.component';
import { ReactiveComponent } from './reactive/reactive.component';
import { TodosComponent } from './todos/todos.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'test',
    component: TestComponent,
    children: [{ path: 'todos', component: TodosComponent }],
  },
  {
    path: 'reactive',
    component: ReactiveComponent,
    loadChildren: () => import('./reactive/routes').then((mod) => mod.REACTIVE_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
