import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, map, tap } from 'rxjs';

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
  todos$ = this.todoService.todosWithAdd$;
  //todos$ = this.todoService.todosWithToggle$;
  //todos$ = this.todoService.todosWithRemove$;

  todosCount$ = this.todos$.pipe(map((todos) => todos.length));
  todosLeft$ = this.todos$.pipe(map((todos) => todos.filter((todo: { completed: any }) => !todo.completed).length));

  totalPages$ = this.todoService.totalPages$;
  page$ = this.todoService.userPage$;

  addTodo(title: string) {
    this.todos$ = this.todoService.todosWithAdd$;
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
    this.todos$ = this.todoService.todosWithToggle$;
    this.todoService.toggleComplete(todo);
  }

  editTodo(todo: Todo) {
    //this.todos$ = this.todoService.todosWithEdit$;
    this.todos$ = this.todoService.todosWithToggle$;
    this.todoService.editTodo$(todo);
  }

  stopEditing(todo: Todo): void {
    //this.todos$ = this.todoService.todosWithStopEditing$;
    this.todos$ = this.todoService.todosWithToggle$;
    this.todoService.stopEditing(todo);
  }

  updateTodo(event: Event, todo: Todo): void {
    // this.todos$ = this.todoService.todosWithUpdate$;
    this.todos$ = this.todoService.todosWithToggle$;
    if (!todo.editing) {
      return;
    }
    this.todoService.updateTodo(event, todo);
  }

  removeTodo(todo: Todo) {
    this.todos$ = this.todoService.todosWithRemove$;
    this.todoService.removeTodo(todo);
  }

  clearCompleted(todos: Observable<Todo>): void {
    //this.todos$ = this.todoService.todosWithClearComplete$;
    this.todos$ = this.todos$.pipe(map((todos) => todos.filter((todo: { completed: boolean }) => !todo.completed)));
    this.todosCount$ = this.todos$.pipe(map((todos) => todos.length));
    //this.todoService.clearCompleted(todos);
  }
}
