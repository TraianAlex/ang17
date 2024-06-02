import { BehaviorSubject, Observable, distinctUntilChanged, map } from 'rxjs';
//import 'rxjs/add/operator/pluck';
//import 'rxjs/add/operator/distinctUntilChanged';

export interface State {
  playlist: any[];
}

const state: State = {
  playlist: [],
};

export class Store {
  private subject = new BehaviorSubject<State>(state);
  private store = this.subject.asObservable();

  get value() {
    return this.subject.value;
  }

  // select<T>(name: string): Observable<T> {
  //   return this.store.pluck(name);
  // }

  select<K>(selector: (state: State) => K[]): Observable<K[]> {
    return this.store.pipe(
      map((state) => state[selector as unknown as keyof State]),
      distinctUntilChanged()
    );
  }

  set(name: string, state: any) {
    this.subject.next({
      ...this.value,
      [name]: state,
    });
  }
}
