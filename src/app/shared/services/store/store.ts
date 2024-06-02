import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

/**
 * Options for the Store class.
 */
type StoreOptions = {
  freeze?: boolean;
};

type Selector<T, V> = (state: T) => V;

/**
 * Abstract class for managing state in Angular services.
 * @template T - The type of the state.
 */
@Injectable({
  providedIn: 'root',
})
export abstract class Store<T> {
  private _freeze = true;
  private _state: BehaviorSubject<T>;

  /**
   * Creates an instance of the Store class.
   * @param initialState - The initial state of the store.
   * @param options - The options for the store. Default state is frozen
   */
  constructor(@Inject('') initialState: T, @Inject('') options?: StoreOptions) {
    if (options?.freeze === false) {
      this._freeze = false;
    }
    this._state = new BehaviorSubject<T>(this.setFrozen(initialState));
  }

  /**
   * Gets an observable of the state.
   */
  get state$(): Observable<T> {
    return this._state.asObservable();
  }

  /**
   * Gets the current state snapshot.
   */
  get state(): T {
    return this._state.getValue();
  }

  /**
   * Sets the state by applying a function to the current state.
   * @param fn - The function to apply to the current state.
   * @returns The new state.
   */
  setState<K extends keyof T, E extends Partial<Pick<T, K>>>(fn: (state: T) => E): T {
    const reducedState = fn(this.state) as E;
    const newState = { ...this.state, ...reducedState };
    this._state.next(this.setFrozen(newState));
    return this.state;
  }

  /**
   * Selects a specific property from the state.
   * The method is overloaded, meaning it has multiple signatures with different parameter types:
   * - If the parameter is a string, it selects the property with the specified name.
   * - If the parameter is a function, it selects the property using the function.
   * @param selector - The property name or a function to select the property.
   * @returns An observable of the selected property.
   */
  select<K extends keyof T>(selector: K): Observable<T[K]>;
  select<K>(selector: (state: T) => K): Observable<K>;
  select<K>(selector: K | ((state: T) => K)) {
    switch (typeof selector) {
      case 'string':
        return this.state$.pipe(
          map((state) => state[selector as unknown as keyof T]),
          distinctUntilChanged()
        );
      case 'function':
        return this.state$.pipe(map(selector as (state: T) => K), distinctUntilChanged());
      default:
        throw new TypeError(`Argument must be 'string' or 'function', got '${typeof selector}'`);
    }
  }

  createSelector<State, S1, Result>(
    s1: Selector<State, S1>,
    projector: (s1: S1) => Result
  ): Selector<State, Result>;

  createSelector<State, S1, S2, Result>(
    s1: Selector<State, S1>,
    s2: Selector<State, S2>,
    projector: (s1: S1, s2: S2) => Result
  ): Selector<State, Result>;

  createSelector<State, S1, S2, S3, Result>(
    s1: Selector<State, S1>,
    s2: Selector<State, S2>,
    s3: Selector<State, S3>,
    projector: (s1: S1, s2: S2, s3: S3) => Result
  ): Selector<State, Result>;

  createSelector<State, S1, S2, S3, S4, Result>(
    s1: Selector<State, S1>,
    s2: Selector<State, S2>,
    s3: Selector<State, S3>,
    s4: Selector<State, S4>,
    projector: (s1: S1, s2: S2, s3: S3, s4: S4) => Result
  ): Selector<State, Result>;

  createSelector<State, S1, S2, S3, S4, S5, Result>(
    s1: Selector<State, S1>,
    s2: Selector<State, S2>,
    s3: Selector<State, S3>,
    s4: Selector<State, S4>,
    s5: Selector<State, S5>,
    projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5) => Result
  ): Selector<State, Result>;

  createSelector<State, S1, S2, S3, S4, S5, S6, Result>(
    s1: Selector<State, S1>,
    s2: Selector<State, S2>,
    s3: Selector<State, S3>,
    s4: Selector<State, S4>,
    s5: Selector<State, S5>,
    s6: Selector<State, S6>,
    projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6) => Result
  ): Selector<State, Result>;

  createSelector<State, S1, S2, S3, S4, S5, S6, S7, Result>(
    s1: Selector<State, S1>,
    s2: Selector<State, S2>,
    s3: Selector<State, S3>,
    s4: Selector<State, S4>,
    s5: Selector<State, S5>,
    s6: Selector<State, S6>,
    s7: Selector<State, S7>,
    projector: (
      s1: S1,
      s2: S2,
      s3: S3,
      s4: S4,
      s5: S5,
      s6: S6,
      s7: S7
    ) => Result
  ): Selector<State, Result>;

  createSelector<State, S1, S2, S3, S4, S5, S6, S7, S8, Result>(
    s1: Selector<State, S1>,
    s2: Selector<State, S2>,
    s3: Selector<State, S3>,
    s4: Selector<State, S4>,
    s5: Selector<State, S5>,
    s6: Selector<State, S6>,
    s7: Selector<State, S7>,
    s8: Selector<State, S8>,
    projector: (
      s1: S1,
      s2: S2,
      s3: S3,
      s4: S4,
      s5: S5,
      s6: S6,
      s7: S7,
      s8: S8
    ) => Result
  ): Selector<State, Result>;

  createSelector(...args: any[]): Selector<any, any> {
    return (state) => {
      const selectors = args.slice(0, args.length - 1);
      const projector = args[args.length - 1];

      return projector.apply(
        null,
        selectors.map((selector) => selector(state))
      );
    };
  }

  /**
   * Clears the state.
   */
  clearState(): void {
    this._state.next(null as T);
  }

  /**
   * Frozen the state of an object and its nested objects,
   * making it immutable to prevent accidental modifications to the state.
   * @param state - The new state.
   */
  private setFrozen(state: T): T {
    if (this._freeze) {
      Object.getOwnPropertyNames(state).forEach((prop: string) => {
        const value = state[prop as keyof T] as unknown as T;
        if (value && typeof value === 'object') {
          this.setFrozen(value);
        }
      });

      return Object.freeze(state);
    }
    return state;
  }
}

/*
  The goal of this class is to make a Service more powerful. Simply extend the Store and inherit the functionality.

  Whilst many developers use NGRX Store, many prefer a 'simpler' pattern using just Services, but this comes with
  the overhead of Observable management, state selection, entities, generic types, immutable operations and
  frozen state - which can get a bit messy quickly.

  This class makes reactive services simple by hiding underlying Observable implementation, state access - so you 
  can manage state easier, leaving state services super lean. It is fully typed to support your data structures.

  You get automatic "frozen state" out-of-the-box via Object.freeze (turn it off if you want), simple state selectors via select().


  **** Store Instance ****

  Import the Store abstract class and extend your service with it, calling super to pass in initialState and any options:

  import { Store } from 'store';

  export class TodoService extends Store<TodoState> {
    constructor() {
      super(<state>, <options>);
    }
  }


  **** Frozen State ****

  State is frozen automatically using a recursive deep freeze function internally. 
  This method makes the state object immutable by preventing new properties from being added to it, existing properties from being removed,
  and existing properties, or their enumerability, configurability, or writability, from being changed.
  The method also prevents the prototype from being changed. The frozen object is then returned.

  You don't need to enable it, but you can disable it per store like this:

  const initialState = { todos: [] };

  @Injectable()
  export class TodoService extends Store<TodoState> {
    constructor() {
      super(initialState, { freeze: false }); // disable Object.freeze recursion
    }
  }


  **** Select State ****

  Use the select() method to get state from your store.

  It returns an Observable which internally uses distinctUntilChanged()
  operator to ensure that the Observable only emits when the returned part of the state changes:

  const initialState = { todos: [] };

  @Injectable()
  export class TodoService extends Store<TodoState> {
    get todos$(): Observable<Todo> {
      return this.select(state => state.todos);
    }
    //...
  }

  you can also use a string but a map function (as above) is recommended:

  const initialState = { todos: [] };

  @Injectable()
  export class TodoService extends Store<TodoState> {
    get todos$(): Observable<Todo> {
      return this.select('todos');
    }
    //...
  }


  **** Set State ****

  Easily set state and merge existing state by calling setState():

  const initialState = { todos: [] };

  @Injectable()
  export class TodoService extends Store<TodoState> {
    addTodo(todo) {
      // update as many properties as you like
      this.setState((state) => ({
        todos: [...state.todos, todos]
      });
    }
  }

  All other state that exists is automatically merged, consider setState a partial state updater for just changes.

  That means you don't need to do this:

  const initialState = { todos: [] };

  @Injectable()
  export class TodoService extends Store<TodoState> {
    addTodo(todo) {
      this.setState((state) => ({
        ...state, // ❌ not needed, handled for you
        todos: [...state.todos, todos]
      });
    }
  }

  The addTodo method acts as your Action, and the object returned via setState acts as your pure function Reducer.

  Each setState() call internally recomposes state and sets it as frozen each time via Object.freeze().

  The setState call also returns the new composed state, useful for debugging and logging:

  const initialState = { todos: [] };

  @Injectable()
  export class TodoService extends Store<TodoState> {
    addTodo(todo) {
      // setState returns the new state, useful for debugging
      const newState = this.setState((state) => ({
        todos: [...state.todos, todos]
      });

      console.log(newState); // { todos: [...] }
    }
  }

  You can also access the static state snapshot any time:

  const initialState = { todos: [] };

  @Injectable()
  export class TodoService extends Store<TodoState> {
    constructor() {
      super(initialState);
    }

    getCurrentState() {
      // static access of store state
      console.log(this.state); // { todos: [] }
    }
  }

  **** Others ****

  State is only changed in a controllable way

  Component state is driven from the Store

  Immutable Objects are predictable

  Immutability is fast with Angular, no Change Detection

  Avoids data synchronization problems

  Avoiding to access the stat directly from components, instead is exposed through observable

  Avoiding to mutate the state directly from the component an establish a unidirectional data flow and
  to manage state changes in a more controlled and predictable way.
*/
