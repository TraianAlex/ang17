import { Injectable } from '@angular/core';

import { Store } from '../shared/services/store/store';

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
  todos,
};

@Injectable({
  providedIn: 'root',
})
export class TodosService extends Store<TodosState> {
  constructor() {
    super(initialState);
  }
  lastId = this.state.todos.length;

  addTodo(title: string) {
    this.lastId = this.lastId + 1;
    this.setState(() => ({
      todos: [...this.state.todos, { id: this.lastId, title: title.trim(), completed: false }],
    }));
  }

  toggleComplete(todo: Todo): void {
    //const updatedTodos2 = this.state.todos.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t));
    const updatedTodo = { ...todo, completed: !todo.completed };
    this.setState(() => {
      const updatedTodos = this.state.todos.map((t) => (t.id === todo.id ? updatedTodo : t));
      return { todos: updatedTodos };
    });
  }

  editTodo(todo: Todo) {
    const updatedTodo = { ...todo, editing: true };
    this.setState(() => {
      const updatedTodos = this.state.todos.map((t) => (t.id === todo.id ? updatedTodo : t));
      return { todos: updatedTodos };
    });
  }

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
}
