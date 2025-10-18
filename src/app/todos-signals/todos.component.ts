import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Todo, TodosService } from './todos.service';

@Component({
  selector: 'app-todos-signals',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.scss',
})
export class TodosSignalsComponent {
  readonly todoInputRef = viewChild.required<ElementRef<HTMLInputElement>>('todoInput');
  todoService = inject(TodosService);

  // Use signals directly from the service
  todos = this.todoService.todos;
  todosCount = this.todoService.todosCount;
  todosLeft = this.todoService.todosLeft;

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
    this.todoService.clearCompleted();
  }
}
