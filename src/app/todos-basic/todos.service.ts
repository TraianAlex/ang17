import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

const todos = [
  { id: 1, title: 'Task 1', completed: false },
  { id: 2, title: 'Task 2', completed: true },
  { id: 3, title: 'Task 3', completed: false },
];

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  editing?: boolean; // Optional property to track editing state
}

interface TodosState {
  todos: Todo[];
}

const initialState: TodosState = {
  todos: [...todos],
};

@Injectable({
  providedIn: 'root',
})
export class TodosService {
  private todosSubject = new BehaviorSubject<TodosState>(initialState);
  todos$ = this.todosSubject.asObservable();

  lastId = this.todosSubject.getValue().todos.length;

  addTodo(title: string) {
    this.lastId = this.lastId + 1;
    const newTodo = { id: this.lastId, title: title.trim(), completed: false };
    this.todosSubject.next({
      todos: [...this.todosSubject.getValue().todos, newTodo],
    });
  }

  toggleComplete(todo: Todo): void {
    const updatedTodo = { ...todo, completed: todo.completed };
    this.todosSubject.next({
      todos: this.todosSubject.getValue().todos.map((t) => (t.id === todo.id ? updatedTodo : t)),
    });
  }

  editTodo(todo: Todo) {
    const updatedTodo = { ...todo, editing: true };
    this.todosSubject.next({
      todos: this.todosSubject.getValue().todos.map((t) => (t.id === todo.id ? updatedTodo : t)),
    });
  }

  stopEditing(todo: Todo): void {
    const updatedTodo = { ...todo, editing: false };
    this.todosSubject.next({
      todos: this.todosSubject.getValue().todos.map((t) => (t.id === todo.id ? updatedTodo : t)),
    });
  }

  updateTodo(event: Event, todo: Todo): void {
    // const input = event.target as HTMLInputElement; // Cast to HTMLInputElement
    // const title = input.value.trim();
    const title = todo.title.trim();
    if (title) {
      const updatedTodo = { ...todo, title, editing: false };
      this.todosSubject.next({
        todos: this.todosSubject.getValue().todos.map((t) => (t.id === todo.id ? updatedTodo : t)),
      });
    } else {
      this.removeTodo(todo);
    }
  }

  removeTodo(todo: Todo) {
    this.todosSubject.next({
      todos: this.todosSubject.getValue().todos.filter((t) => t.id !== todo.id),
    });
  }

  clearCompleted(): void {
    this.todosSubject.next({
      todos: this.todosSubject.getValue().todos.filter((t) => t.completed === false),
    });
  }
}
