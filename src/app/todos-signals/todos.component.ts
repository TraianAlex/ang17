import { Component, computed, inject, signal } from '@angular/core';
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
  todoService = inject(TodosService);

  todos = this.todoService.todos;
  todosCount = this.todoService.todosCount;
  todosLeft = this.todoService.todosLeft;

  todoInput = signal<string>('');
  isFormValid = computed(() => this.todoInput().trim() !== '' && this.todoInput().trim().length > 1);

  addTodo() {
    if (!this.isFormValid()) {
      return;
    }
    this.todoService.addTodo(this.todoInput());
    this.todoInput.set('');
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

  updateTodo(todo: Todo): void {
    if (!todo.editing) {
      return;
    }
    this.todoService.updateTodo(todo);
  }

  removeTodo(todo: Todo) {
    this.todoService.removeTodo(todo);
  }

  clearCompleted(): void {
    this.todoService.clearCompleted();
  }
}
