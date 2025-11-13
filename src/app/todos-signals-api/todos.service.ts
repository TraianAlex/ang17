import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of, forkJoin } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

export interface Todo {
  id?: number;
  todo: string;
  completed: boolean;
  userId: number;
  editing?: boolean; // Optional property to track editing state
  isDeleted?: boolean;
  _localId?: string; // Temporary unique ID for todos without server IDs
}

interface TodosResponse {
  limit: number;
  skip: number;
  total: number;
  todos: Todo[];
}

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
  private localTodosSignal = signal<Todo[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private deletedIdsSignal = signal<Set<number>>(new Set());
  private localIdCounter = 0;

  // Public readonly signals
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  todos$ = () => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return this.http.get<TodosResponse>(`${this.apiUrl}/todos`, { params: { limit: '5', skip: '0' } }).pipe(
      map((response) => response.todos),
      tap((todos) => {
        console.log('todos', todos);
        this.loadingSignal.set(false);
      }),
      catchError((error) => {
        this.errorSignal.set('Failed to load todos');
        console.error('Error loading todos:', error);
        return of([]);
      })
    );
  };

  apiTodos = toSignal(this.todos$(), { initialValue: [] });
  todos = computed(() => {
    const api = this.apiTodos();
    const local = this.localTodosSignal();
    const deletedIds = this.deletedIdsSignal();
    // Merge: prefer local todos over API todos when IDs match, and filter out deleted IDs
    const resultMap = new Map<number | string, Todo>();

    // First, add API todos (filtered by deletedIds)
    api.forEach((t) => {
      if (t.id && !deletedIds.has(t.id)) {
        resultMap.set(t.id, t);
      }
    });

    // Then, add/overwrite with local todos
    local.forEach((t, index) => {
      if (t.id && !deletedIds.has(t.id)) {
        // Overwrite API todo if exists, or add new
        resultMap.set(t.id, t);
      } else if (!t.id) {
        // Local todos without IDs use their _localId or generate one based on index
        const uniqueKey = t._localId || `local-${index}`;
        resultMap.set(uniqueKey, t);
      }
    });

    return Array.from(resultMap.values());
  });
  todosCount = computed(() => this.todos().length);
  todosLeft = computed(() => this.todos().filter((todo) => !todo.completed && !todo.isDeleted).length);

  addTodo(title: string): void {
    const newTodo: Todo = {
      todo: title.trim(),
      completed: false,
      userId: 1,
      _localId: `local-${this.localIdCounter++}`, // Assign unique ID immediately for tracking
    };

    // Add to local immediately for optimistic UI update
    this.localTodosSignal.update((todos) => [...todos, newTodo]);

    this.loadingSignal.set(true);
    this.http
      .post<Todo>(`${this.apiUrl}/todos/add`, JSON.stringify(newTodo), this.httpOptions)
      .pipe(
        catchError((error) => {
          this.errorSignal.set('Failed to add todo');
          console.error('Error adding todo:', error);
          // Remove the todo from local on error
          this.localTodosSignal.update((todos) => todos.filter((t) => t._localId !== newTodo._localId));
          return of(null);
        })
      )
      .subscribe({
        next: (todo) => {
          if (todo) {
            // Replace the local todo (with _localId) with the server response (with id)
            this.localTodosSignal.update((todos) =>
              todos.map((t) => (t._localId === newTodo._localId ? { ...todo } : t))
            );
          }
          this.loadingSignal.set(false);
        },
        error: () => {
          this.loadingSignal.set(false);
        },
      });
  }

  toggleComplete(todo: Todo): void {
    const updatedTodo = { ...todo, completed: !todo.completed };
    if (!todo.id) {
      // If no ID, update locally only
      this.localTodosSignal.update((todos) => todos.map((t) => (t.id === todo.id ? updatedTodo : t)));
      return;
    }

    this.http
      .put<Todo>(`${this.apiUrl}/todos/${todo.id}`, JSON.stringify(updatedTodo), this.httpOptions)
      .pipe(
        catchError((error) => {
          this.errorSignal.set('Failed to update todo');
          console.error('Error updating todo:', error);
          // Revert the change on error
          this.localTodosSignal.update((todos) => todos.map((t) => (t.id === todo.id ? todo : t)));
          return of(todo);
        })
      )
      .subscribe({
        next: (updated) => {
          this.localTodosSignal.update((todos) => todos.map((t) => (t.id === updated.id ? updated : t)));
        },
      });
  }

  editTodo(todo: Todo): void {
    const localTodos = this.localTodosSignal();
    const existsInLocal = localTodos.some((t) => t.id === todo.id);

    if (existsInLocal) {
      // Update existing local todo
      this.localTodosSignal.update((todos) => todos.map((t) => (t.id === todo.id ? { ...t, editing: true } : t)));
    } else {
      // Add todo to local signal with editing flag
      this.localTodosSignal.update((todos) => [...todos, { ...todo, editing: true }]);
    }
  }

  stopEditing(todo: Todo): void {
    this.localTodosSignal.update((todos) => todos.map((t) => (t.id === todo.id ? { ...t, editing: false } : t)));
  }

  updateTodo(todo: Todo): void {
    const title = todo.todo.trim();
    if (!title) {
      this.removeTodo(todo);
      return;
    }

    if (!todo.id) {
      // If no ID, update locally only (todos without IDs are only in localTodosSignal)
      this.localTodosSignal.update((todos) =>
        todos.map((t) => (!t.id && t === todo ? { ...t, todo: title, editing: false } : t))
      );
      return;
    }

    const updatedTodo = { ...todo, todo: title, editing: false };
    const localTodos = this.localTodosSignal();
    const existsInLocal = localTodos.some((t) => t.id === todo.id);

    this.http
      .put<Todo>(`${this.apiUrl}/todos/${todo.id}`, JSON.stringify(updatedTodo), this.httpOptions)
      .pipe(
        catchError((error) => {
          this.errorSignal.set('Failed to update todo');
          console.error('Error updating todo:', error);
          // Revert the change on error if it was in local
          if (existsInLocal) {
            this.localTodosSignal.update((todos) => todos.map((t) => (t.id === todo.id ? todo : t)));
          }
          return of(todo);
        })
      )
      .subscribe({
        next: (updated) => {
          if (existsInLocal) {
            // Update existing local todo
            this.localTodosSignal.update((todos) =>
              todos.map((t) => (t.id === updated.id ? { ...updated, editing: false } : t))
            );
          } else {
            // Add updated todo to local signal
            this.localTodosSignal.update((todos) => [...todos, { ...updated, editing: false }]);
          }
        },
      });
  }

  removeTodo(todo: Todo): void {
    if (!todo.id) {
      // If no ID, remove locally only (use object reference comparison)
      // Use setTimeout to defer removal and allow event handlers to complete
      setTimeout(() => {
        this.localTodosSignal.update((todos) => todos.filter((t) => t !== todo));
      }, 0);
      return;
    }

    const localTodos = this.localTodosSignal();
    const existsInLocal = localTodos.some((t) => t.id === todo.id);

    // Mark as deleted immediately to remove from UI
    this.deletedIdsSignal.update((deletedIds) => {
      const newSet = new Set(deletedIds);
      newSet.add(todo.id!);
      return newSet;
    });

    // Remove from local after a brief delay to allow event handlers to complete
    if (existsInLocal) {
      setTimeout(() => {
        this.localTodosSignal.update((todos) => todos.filter((t) => t.id !== todo.id));
      }, 0);
    }

    this.http
      .delete<Todo>(`${this.apiUrl}/todos/${todo.id}`)
      .pipe(
        catchError((error) => {
          this.errorSignal.set('Failed to delete todo');
          console.error('Error deleting todo:', error);
          // Revert the deletion - remove from deletedIds and restore to local if it was there
          this.deletedIdsSignal.update((deletedIds) => {
            const newSet = new Set(deletedIds);
            newSet.delete(todo.id!);
            return newSet;
          });
          if (existsInLocal) {
            this.localTodosSignal.update((todos) => [...todos, todo]);
          }
          return of(null);
        })
      )
      .subscribe({
        next: () => {
          // Deletion successful - deletedIds already updated above
          // The todo will be removed from apiTodos on next refresh
        },
      });
  }

  clearCompleted(): void {
    const completedTodos = this.todos().filter((todo) => todo.completed);
    if (completedTodos.length === 0) {
      return;
    }

    // Delete all completed todos that have IDs
    const todosWithIds = completedTodos.filter((todo) => todo.id).map((t) => t.id!);

    // Store original local todos for potential rollback
    const originalLocalTodos = [...this.localTodosSignal()];
    const originalDeletedIds = new Set(this.deletedIdsSignal());

    // Mark as deleted immediately to remove from UI
    this.deletedIdsSignal.update((deletedIds) => {
      const newSet = new Set(deletedIds);
      todosWithIds.forEach((id) => newSet.add(id));
      return newSet;
    });

    // Update local state immediately for better UX
    this.localTodosSignal.update((todos) => todos.filter((todo) => !todo.completed));

    // Execute all delete requests in parallel
    if (todosWithIds.length > 0) {
      const deleteRequests = todosWithIds.map((id) =>
        this.http.delete<Todo>(`${this.apiUrl}/todos/${id}`).pipe(
          catchError((error) => {
            console.error(`Error deleting todo ${id}:`, error);
            return of(null);
          })
        )
      );

      forkJoin(deleteRequests).subscribe({
        next: (results) => {
          // Check if all deletions failed
          const allFailed = results.every((result) => result === null);
          if (allFailed && results.length > 0) {
            // Revert local changes if all deletions failed
            this.localTodosSignal.set(originalLocalTodos);
            this.deletedIdsSignal.set(originalDeletedIds);
            this.errorSignal.set('Failed to delete completed todos');
          }
        },
        error: (error) => {
          // Revert local changes on error
          this.localTodosSignal.set(originalLocalTodos);
          this.deletedIdsSignal.set(originalDeletedIds);
          this.errorSignal.set('Some todos could not be deleted');
          console.error('Error clearing completed todos:', error);
        },
      });
    }
  }
}
