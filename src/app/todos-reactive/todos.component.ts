import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { map, tap } from 'rxjs';

import { Todo, TodosService } from './todos.service';

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.scss',
})
export class TodosComponent2 {
  @ViewChild('todoInput') todoInputRef!: ElementRef<HTMLInputElement>;
  todoService = inject(TodosService);
  //todos$ = this.todoService.todosWithAdd4$;
  //todos$ = this.todoService.todosWithToggle$;
  todos$ = this.todoService.todosWithRemove$;

  todosCount$ = this.todos$.pipe(map((todos) => todos.length));
  todosLeft$ = this.todos$.pipe(map((todos) => todos.filter((todo) => !todo.completed).length));

  totalPages$ = this.todoService.totalPages$;
  page$ = this.todoService.userPage$;

  addTodo(title: string) {
    if (!title) {
      return;
    }
    this.todoService.addTodo(title);
    this.todoInputRef.nativeElement.value = '';
  }

  movePageBy(moveBy: number) {
    this.todoService.movePageBy(moveBy);
  }

  toggleComplete(todo: Todo): void {
    this.todoService.toggleComplete(todo);
  }

  editTodo(todo: Todo) {
    this.todoService.editTodo$(todo);
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
