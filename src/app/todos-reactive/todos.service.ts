import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
  combineLatest,
  debounceTime,
  map,
  merge,
  mergeMap,
  scan,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Store } from '../shared/services/store/store';

const LIMIT_LOW = 10;
const LIMIT_MID = 25;
const LIMIT_HIGH = 100;
const LIMITS = [LIMIT_LOW, LIMIT_MID, LIMIT_HIGH];
const DEFAULT_LIMIT = LIMIT_LOW;
const DEFAULT_PAGE = 0;

export interface Todo {
  id?: number;
  todo: string;
  completed: boolean;
  userId: number;
  editing?: boolean; // Optional property to track editing state
}

interface Todos {
  limit: number;
  skip: number;
  total: number;
  todos: Todo[];
}

const initialState: Todos = {
  limit: 30,
  skip: 0,
  total: 0,
  todos: [],
};

@Injectable({
  providedIn: 'root',
})
export class TodosService extends Store<Todos> {
  http = inject(HttpClient);
  private apiUrl = 'https://dummyjson.com';
  httpOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  };
  constructor() {
    super(initialState);
  }

  private todoInsertedSubject = new BehaviorSubject<Todo[] | null>(initialState.todos);
  private todoToggleSubject = new Subject<Todo>();
  private limitBS = new BehaviorSubject<number>(DEFAULT_LIMIT);
  private pageBS = new BehaviorSubject<number>(DEFAULT_PAGE);

  todoInsertedAction$ = this.todoInsertedSubject.asObservable();
  todoToggleAction$ = this.todoToggleSubject.asObservable();
  limit$ = this.limitBS.asObservable();
  userPage$ = this.pageBS.pipe(map((page) => page + 1));

  // initTodos$ = this.http.get<Todos>(`${this.apiUrl}/todos`).pipe(
  //   tap((todos) => console.log('initTodos', todos)),
  //   shareReplay(1)
  // );

  params$ = combineLatest([this.limitBS, this.pageBS.pipe(debounceTime(500))]).pipe(
    map(([limit, page]) => {
      const params: any = {
        limit: `${limit}`,
        skip: `${page * limit}`, // page * limit
      };
      console.log('params', params);
      return params;
    })
  );

  todosResponse$ = this.params$.pipe(
    switchMap((params) =>
      this.http
        .get<Todos>(`${this.apiUrl}/todos`, { params })
        .pipe(tap((todos) => console.log('todosResponses', todos)))
    ),
    shareReplay(1),
    catchError(this.handleError)
  );

  todos$ = this.todosResponse$.pipe(map((res) => res.todos));

  // addTodo(todo: Todo): Observable<Todo> {
  //   return this.http.post<Todo>(`${this.apiUrl}/todos/add`, JSON.stringify(todo), this.httpOptions).pipe(
  //     tap((todo) => console.log('add', todo)),
  //     shareReplay(1)
  //   );
  // }

  movePageBy(moveBy: number) {
    const currentPage = this.pageBS.getValue();
    this.pageBS.next(currentPage + moveBy);
  }

  totalResults$ = this.todosResponse$.pipe(map((res: any) => res.total));

  totalPages$ = combineLatest([this.totalResults$, this.limitBS]).pipe(
    map(([totalResults, limit]) => Math.ceil(totalResults / limit)),
    tap((totalPages) => console.log('totalPages', totalPages))
  );

  // adding teh values at the bottom of the page but pagination is broken
  todosWithAdd$ = merge(this.todos$, this.todoInsertedAction$).pipe(
    // scan((acc: Todo[], value: Todo[] | null) => {
    //   if (value instanceof Array) {
    //     return [...acc, ...value];
    //   } else if (value) {
    //     return [...acc, value];
    //   } else {
    //     return acc;
    //   }
    // }, [] as Todo[]),
    scan((acc: Todo[], value: any) => (value instanceof Array ? [...acc, ...value] : [...acc, value]), [] as Todo[]),
    tap((todos) => console.log('todosWithAdd', todos))
  );

  // just adding the new values
  todosWithAdd2$ = this.todoInsertedAction$.pipe(
    //switchMap((todo) => this.http.post<Todo>(`${this.apiUrl}/todos/add`, JSON.stringify(todo), this.httpOptions)),
    scan((acc: Todo[], value: Todo[] | null) => {
      if (value instanceof Array) {
        return [...acc, ...value];
      } else if (value) {
        return [...acc, value];
      } else {
        return acc;
      }
    }, [] as Todo[]),
    // scan((acc: Todo[], value: any) =>
    //   (value instanceof Array) ? [...acc, ...value] : [...acc, value], [] as Todo[]),
    tap((todos) => console.log('todosWithAdd2', todos))
  );

  // adding the new value at the bottom of the every page
  todosWithAdd3$ = combineLatest([this.todosResponse$, this.todoInsertedAction$]).pipe(
    map(([todos, todo]) => {
      if (todo instanceof Array) {
        return [...todos.todos, ...todo];
      } else if (todo) {
        return [...todos.todos, todo];
      } else {
        return todos.todos;
      }
    }, [] as Todo[]),
    tap((todos) => console.log('todosWithAdd3', todos))
  );

  // add the new value at the bottom of the page, pagination works
  todosWithAdd4$ = combineLatest([this.todosResponse$, this.todoInsertedAction$]).pipe(
    //switchMap((todo) => this.http.post<Todo>(`${this.apiUrl}/todos/add`, JSON.stringify(todo), this.httpOptions)),
    // scan((acc: Todo[], value: any) =>
    //   (value instanceof Array) ? [...acc, ...value] : [...acc, value], [] as Todo[]),
    map(([todos, todo]) => {
      if (todo instanceof Array) {
        return [...todos.todos, ...todo];
      } else if (todo) {
        return [...todos.todos, todo];
      } else {
        return todos.todos;
      }
    }, [] as Todo[]),
    tap((todos) => console.log('todosWithAdd4', todos))
  );

  addTodo(title: string) {
    this.todoInsertedSubject.next([{ todo: title.trim(), completed: false, userId: 1 }]);
  }

  // todo
  todosWithToggle$ = merge(this.todosResponse$, this.todoToggleAction$).pipe(
    // map(([todos, todo]: any) => {
    //   if (todo instanceof Array) {
    //     return [...todos.todos, ...todo];
    //   } else if (todo) {
    //     return [...todos.todos, todo];
    //   } else {
    //     return todos.todos;
    //   }
    // }, [] as Todo[]),
    scan((acc: Todo[], value: any) => (value instanceof Array ? [...acc, ...value] : [...acc, value]), [] as Todo[]),
    tap((todos) => console.log('toggle', todos))
  );

  toggleComplete(todo: Todo): void {
    const updatedTodo = { ...todo, completed: !todo.completed };
    // this.setState(() => {
    //   const updatedTodos = this.state.todos.map((t) => (t.id === todo.id ? updatedTodo : t));
    //   return { todos: updatedTodos };
    // });
    this.todoToggleSubject.next(updatedTodo);
  }

  editTodo$ = (todo: Todo) => {
    const updatedTodo = { ...todo, editing: true };
    // this.setState(() => {
    //   const updatedTodos = this.state.todos.map((t) => (t.id === todo.id ? updatedTodo : t));
    //   return { todos: updatedTodos };
    // });
    this.todoToggleSubject.next(updatedTodo);
  };

  stopEditing(todo: Todo): void {
    const updatedTodo = { ...todo, editing: false };
    this.setState(() => {
      const updatedTodos = this.state.todos.map((t) => (t.id === todo.id ? updatedTodo : t));
      return { todos: updatedTodos };
    });
  }

  updateTodo(event: Event, todo: Todo): void {
    const input = event.target as HTMLInputElement; // Cast to HTMLInputElement
    const title = input.value.trim();
    if (title) {
      const updatedTodo = { ...todo, title, editing: false };
      this.setState(() => {
        const updatedTodos = this.state.todos.map((t) => (t.id === todo.id ? updatedTodo : t));
        return { todos: updatedTodos };
      });
    } else {
      this.removeTodo(todo);
    }
  }

  removeTodo(todo: Todo) {
    this.setState(() => ({
      todos: this.state.todos.filter((t) => t.id !== todo.id),
    }));
  }

  clearCompleted(): void {
    // this.todos$ = this.todos$.pipe(map((todos) => todos.filter((todo) => !todo.completed)));
    // this.todosCount$ = this.todos$.pipe(map((todos) => todos.length));
    this.setState(() => ({
      todos: this.state.todos.filter((t) => t.completed === false),
    }));
  }

  private handleError(error: any): Observable<never> {
    // Handle the error here
    // You might want to throw the error, or log it, or even return a default value
    console.error('Error occurred', error);
    throw error;
  }
}
