import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'test',
    loadComponent: () => import('./test-components/test.component').then((m) => m.TestComponent),
    children: [
      { path: 'todos', loadComponent: () => import('./todos/todos.component').then((m) => m.TodosComponent) },
      {
        path: 'todos-basic',
        loadComponent: () => import('./todos-basic/todos.component').then((m) => m.TodosBasicComponent),
      },
      {
        path: 'todos-signals',
        loadComponent: () => import('./todos-signals/todos.component').then((m) => m.TodosSignalsComponent),
      },
      {
        path: 'todos-signals-api',
        loadComponent: () => import('./todos-signals-api/todos.component').then((m) => m.TodosSignalsApiComponent),
      },
      {
        path: 'todos-reactive',
        loadComponent: () => import('./todos-reactive/todos.component').then((m) => m.TodosComponent2),
      },
      {
        path: 'selectors',
        loadComponent: () => import('./test-store/test-store.component').then((m) => m.TestStoreComponent),
      },
    ],
  },
  {
    path: 'reactive',
    loadComponent: () => import('./reactive/reactive.component').then((m) => m.ReactiveComponent),
    loadChildren: () => import('./reactive/routes').then((mod) => mod.REACTIVE_ROUTES),
  },
  {
    path: 'rxjs-basic',
    loadComponent: () => import('./rxjs-basic/rxjs-basic.component').then((m) => m.RxjsBasicComponent),
    loadChildren: () => import('./rxjs-basic/routes').then((mod) => mod.RXJS_BASIC),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
