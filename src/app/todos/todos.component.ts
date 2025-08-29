import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';

import { Todo, TodosService } from './todos.service';

@Component({
    selector: 'app-todos',
    imports: [CommonModule, FormsModule],
    standalone: true,
    templateUrl: './todos.component.html',
    styleUrl: './todos.component.scss'
})
export class TodosComponent {
  readonly todoInputRef = viewChild.required<ElementRef<HTMLInputElement>>('todoInput');
  todoService = inject(TodosService);
  todos$ = this.todoService.select((state) => state.todos);
  todosCount$ = this.todos$.pipe(map((todos) => todos.length));
  todosLeft$ = this.todos$.pipe(map((todos) => todos.filter((todo) => !todo.completed).length));
  lastId = this.todoService.state.todos.length;

  addTodo(title: string) {
    if (!title) {
      return;
    }
    this.todoService.addTodo(title);
    this.todoInputRef().nativeElement.value = '';
  }

  toggleComplete(todo: Todo): void {
    this.todoService.toggleComplete(todo);
  }

  editTodo(todo: Todo) {
    this.todoService.editTodo(todo);
  }

  stopEditing(todo: Todo): void {
    this.todoService.stopEditing(todo);
  }

  updateTodo(event: Event, todo: Todo): void {
    if (!todo.editing) {
      return;
    }
    this.todoService.updateTodo(event, todo);
  }

  removeTodo(todo: Todo) {
    this.todoService.removeTodo(todo);
  }

  clearCompleted(): void {
    // this.todos$ = this.todos$.pipe(map((todos) => todos.filter((todo) => !todo.completed)));
    // this.todosCount$ = this.todos$.pipe(map((todos) => todos.length));
    this.todoService.clearCompleted();
  }
}
