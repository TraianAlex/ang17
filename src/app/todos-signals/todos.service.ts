import { Injectable, signal, computed } from '@angular/core';

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

@Injectable({
  providedIn: 'root',
})
export class TodosService {
  private todosSignal = signal<Todo[]>([...todos]);

  // Public readonly signals
  todos = this.todosSignal.asReadonly();
  todosCount = computed(() => this.todos().length);
  todosLeft = computed(() => this.todos().filter((todo) => !todo.completed).length);

  private lastId = todos.length;

  addTodo(title: string) {
    this.lastId = this.lastId + 1;
    const newTodo = { id: this.lastId, title: title.trim(), completed: false };
    this.todosSignal.update((todos) => [...todos, newTodo]);
  }

  toggleComplete(todo: Todo): void {
    this.todosSignal.update((todos) => todos.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t)));
  }

  editTodo(todo: Todo) {
    this.todosSignal.update((todos) => todos.map((t) => (t.id === todo.id ? { ...t, editing: true } : t)));
  }

  stopEditing(todo: Todo): void {
    this.todosSignal.update((todos) => todos.map((t) => (t.id === todo.id ? { ...t, editing: false } : t)));
  }

  updateTodo(event: Event, todo: Todo): void {
    // const input = event.target as HTMLInputElement;
    // const title = input.value.trim();
    const title = todo.title.trim();
    if (title) {
      this.todosSignal.update((todos) => todos.map((t) => (t.id === todo.id ? { ...t, title, editing: false } : t)));
    } else {
      this.removeTodo(todo);
    }
  }

  removeTodo(todo: Todo) {
    this.todosSignal.update((todos) => todos.filter((t) => t.id !== todo.id));
  }

  clearCompleted(): void {
    this.todosSignal.update((todos) => todos.filter((t) => !t.completed));
  }
}
