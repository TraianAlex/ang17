import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { TestComponent } from './test-components/test.component';
import { ReactiveComponent } from './reactive/reactive.component';
import { TodosComponent } from './todos/todos.component';
import { TestStoreComponent } from './test-store/test-store.component';
import { TodosComponent2 } from './todos-reactive/todos.component';
import { RxjsBasicComponent } from './rxjs-basic/rxjs-basic.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'test',
    component: TestComponent,
    children: [
      { path: 'todos', component: TodosComponent },
      { path: 'todos-reactive', component: TodosComponent2 },
      { path: 'selectors', component: TestStoreComponent },
    ],
  },
  {
    path: 'reactive',
    component: ReactiveComponent,
    loadChildren: () => import('./reactive/routes').then((mod) => mod.REACTIVE_ROUTES),
  },
  {
    path: 'rxjs-basic',
    component: RxjsBasicComponent,
    loadChildren: () => import('./rxjs-basic/routes').then((mod) => mod.RXJS_BASIC),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
