import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
  combineLatest,
  concatMap,
  debounceTime,
  map,
  merge,
  mergeScan,
  scan,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';

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
  isDeleted?: boolean;
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
export class TodosService {
  http = inject(HttpClient);
  private apiUrl = 'https://dummyjson.com';
  httpOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  };

  //private todoInsertedSubject = new BehaviorSubject<Todo[] | null>(initialState.todos);
  private todoInsertedSubject = new Subject<Todo>();
  private todoUpdateSubject = new Subject<Todo>();
  // private todoEditSubject = new Subject<Todo>();
  // private todoStopEditSubject = new Subject<Todo>();
  // private todoUpdateSubject = new Subject<Todo>();
  // private todoClearCompleteSubject = new Subject<Todo>();
  private limitBS = new BehaviorSubject<number>(DEFAULT_LIMIT);
  private pageBS = new BehaviorSubject<number>(DEFAULT_PAGE);

  todoInsertedAction$ = this.todoInsertedSubject.asObservable();
  todoUpdateAction$ = this.todoUpdateSubject.asObservable();
  //todoEditAction$ = this.todoEditSubject.asObservable();
  //todoStopEditAction$ = this.todoStopEditSubject.asObservable();
  //todoUpdateAction$ = this.todoUpdateSubject.asObservable();
  // todoClearCompleteAction$ = this.todoClearCompleteSubject.asObservable();
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

  movePageBy(moveBy: number) {
    const currentPage = this.pageBS.getValue();
    this.pageBS.next(currentPage + moveBy);
  }

  totalResults$ = this.todosResponse$.pipe(map((res: any) => res.total));

  totalPages$ = combineLatest([this.totalResults$, this.limitBS]).pipe(
    map(([totalResults, limit]) => Math.ceil(totalResults / limit)),
    tap((totalPages) => console.log('totalPages', totalPages))
  );

  // just adding the new values
  // todosWithAdd2$ = this.todoInsertedAction$.pipe(
  //   //switchMap((todo) => this.http.post<Todo>(`${this.apiUrl}/todos/add`, JSON.stringify(todo), this.httpOptions)),
  //   scan((acc: Todo[], value: Todo[] | null) => {
  //     if (value instanceof Array) {
  //       return [...acc, ...value];
  //     } else if (value) {
  //       return [...acc, value];
  //     } else {
  //       return acc;
  //     }
  //   }, [] as Todo[]),
  //   // scan((acc: Todo[], value: any) =>
  //   //   (value instanceof Array) ? [...acc, ...value] : [...acc, value], [] as Todo[]),
  //   tap((todos) => console.log('todosWithAdd2', todos))
  // );

  // add the new value at the bottom of the page, pagination works
  // todosWithAdd4$ = combineLatest([this.todosResponse$, this.todoInsertedAction$]).pipe(
  //   // scan((acc: Todo[], value: any) =>
  //   //   (value instanceof Array) ? [...acc, ...value] : [...acc, value], [] as Todo[]),
  //   map(([todos, todo]) => {
  //     if (todo instanceof Array) {
  //       return [...todos.todos, ...todo];
  //     } else if (todo) {
  //       return [...todos.todos, todo];
  //     } else {
  //       return todos.todos;
  //     }
  //   }, [] as Todo[]),
  //   tap((todos) => console.log('todosWithAdd4', todos))
  // );

  // addTodo(title: string) {
  //   const todo = { todo: title.trim(), completed: false, userId: 1 };
  //   this.http
  //     .post<Todo>(`${this.apiUrl}/todos/add`, JSON.stringify(todo), this.httpOptions)
  //     .pipe(
  //       tap((todo) => console.log('add', todo)),
  //       shareReplay(1)
  //     )
  //     .subscribe((todo) => {
  //       this.todoInsertedSubject.next([todo]);
  //       console.log('add', todo);
  //     });
  // }

  // todosWithAdd2$ = this.todosResponse$.pipe(map((res) => res.todos)).pipe(
  //   mergeScan((acc: Todo[], value: any) => (value instanceof Array ? [...value] : [...acc, value]), [] as Todo[]),
  //   tap((todos) => console.log('todosWithAdd2', todos))
  // );

  // add the new value at the bottom of the page, pagination works
  todosWithAdd$ = merge(
    this.todosResponse$.pipe(map((res) => res.todos)),
    this.todoInsertedAction$.pipe(
      concatMap((todo) => {
        return this.http.post<Todo>(`${this.apiUrl}/todos/add`, JSON.stringify(todo), this.httpOptions).pipe(
          map((todo) => todo),
          catchError(this.handleError)
        );
      })
    )
  ).pipe(scan((acc: any, value: any) => (value instanceof Array ? [...value] : [...acc, value]), [] as Todo[]));

  addTodo(title: string): void {
    const todo = { todo: title.trim(), completed: false, userId: 1 };
    this.todoInsertedSubject.next(todo);
  }

  todosWithUpdate$ = merge(this.todosResponse$.pipe(map((res) => res.todos)), this.todoUpdateAction$).pipe(
    tap((todos) => console.log('toggle', todos)),
    scan(
      (acc: Todo[], value: any) =>
        value instanceof Array
          ? [...value]
          : acc.map((todo) => (todo.id === value.id ? { ...value, completed: !value.completed } : todo)),
      [] as Todo[]
    )
  );

  toggleComplete(todo: Todo) {
    const updatedTodo = { ...todo, completed: !todo.completed };
    // return this.http.put<Todo>(`${this.apiUrl}/todos/${todo.id}`, JSON.stringify(updatedTodo), this.httpOptions).pipe(
    //   tap((todo) => console.log('updatedTodo2', todo)),
    //   map((todo) => {
    this.todoUpdateSubject.next(updatedTodo);
    //   })
    // );
  }

  // todosWithEdit$ = merge(this.todosResponse$.pipe(map((res) => res.todos)), this.todoEditAction$).pipe(
  //   tap((todos) => console.log('editing', todos)),
  //   scan(
  //     (acc: Todo[], value: any) =>
  //       value instanceof Array
  //         ? [...value]
  //         : acc.map((todo) => (todo.id === value.id ? value : todo)),
  //     [] as Todo[]
  //   )
  // );

  editTodo$ = (todo: Todo) => {
    const updatedTodo = { ...todo, editing: true };
    //this.todoEditSubject.next(updatedTodo);
    this.todoUpdateSubject.next(updatedTodo);
  };

  // todosWithStopEditing$ = merge(this.todosResponse$.pipe(map((res) => res.todos)), this.todoStopEditAction$).pipe(
  //   tap((todos) => console.log('stop editing', todos)),
  //   scan(
  //     (acc: Todo[], value: any) =>
  //       value instanceof Array
  //         ? [...value]
  //         : acc.map((todo) => (todo.id === value.id ? value : todo)),
  //     [] as Todo[]
  //   )
  // );

  stopEditing(todo: Todo): void {
    const updatedTodo = { ...todo, editing: false };
    //this.todoStopEditSubject.next(updatedTodo);
    this.todoUpdateSubject.next(updatedTodo);
  }

  // todosWithUpdate$ = merge(
  //   this.todosResponse$.pipe(map((res) => res.todos)),
  //   this.todoUpdateAction$.pipe(tap((todo) => console.log('update action', todo)))
  // ).pipe(
  //   tap((todos) => console.log('update', todos)),
  //   scan((acc: Todo[], value: any) => {
  //     console.log('value updated', value);
  //     return (
  //       value instanceof Array ? [...value] : acc.map((todo) => (todo.id === value.id ? value : todo)), [] as Todo[]
  //     );
  //   })
  // );

  updateTodo(event: Event, todo: Todo): void {
    const input = event.target as HTMLInputElement; // Cast to HTMLInputElement
    const title = input.value.trim();
    if (title) {
      const updatedTodo = { ...todo, title, editing: false };
      console.log('update event', updatedTodo);
      // this.http
      //   .put<Todo>(`${this.apiUrl}/todos/${todo.id}`, JSON.stringify(updatedTodo), this.httpOptions)
      //   .subscribe((todo) => {
      //this.todoUpdateSubject.next(updatedTodo);
      this.todoUpdateSubject.next(updatedTodo);
      //     });
      // } else {
      //   this.removeTodo(todo);
    }
  }

  todosWithRemove$ = merge(this.todosResponse$.pipe(map((res) => res.todos)), this.todoUpdateAction$).pipe(
    tap((todos) => console.log('remove', todos)),
    scan(
      (acc: Todo[], value: any) => (value instanceof Array ? [...value] : acc.filter((todo) => todo.id !== value.id)),
      [] as Todo[]
    )
  );

  removeTodo(todoDel: Todo) {
    // this.http.delete<Todo>(`${this.apiUrl}/todos/${todoDel.id}`).subscribe((todo) => {
    this.todoUpdateSubject.next(todoDel);
    //  console.log('remove', todo);
    // });
  }

  // todosWithClearComplete$ = merge(
  //   this.todosResponse$.pipe(map((res) => res.todos)),
  //   this.todoClearCompleteAction$
  // ).pipe(
  //   tap((todos) => console.log('clear complete', todos)),
  //   scan(
  //     (acc: Todo[], value: any) => (value instanceof Array ? [...value] : acc.filter((todo) => !todo.completed)),
  //     [] as Todo[]
  //   )
  // );

  // clearCompleted(todos: any): void {
  //   // this.todos$ = this.todos$.pipe(map((todos) => todos.filter((todo) => !todo.completed)));
  //   // this.todosCount$ = this.todos$.pipe(map((todos) => todos.length));
  //   // this.setState(() => ({
  //   //   todos: this.state.todos.filter((t) => t.completed === false),
  //   // }));
  //   this.todoClearCompleteSubject.next(todos);
  // }

  private handleError(error: any): Observable<never> {
    // Handle the error here
    // You might want to throw the error, or log it, or even return a default value
    console.error('Error occurred', error);
    throw error;
  }
}
