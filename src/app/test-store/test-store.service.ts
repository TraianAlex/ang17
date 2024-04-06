import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, combineLatest, map, shareReplay, switchMap, tap } from 'rxjs';
import { Store } from '../shared/services/store/store';

const LIMIT_LOW = 10;
const LIMIT_MID = 25;
const LIMIT_HIGH = 100;
const LIMITS = [LIMIT_LOW, LIMIT_MID, LIMIT_HIGH];

interface TestStore {
  results: {
    limit: number;
    skip: number;
    total: number;
    products: any[];
  };
}

const initialState: TestStore = {
  results: {
    limit: 30,
    skip: 0,
    total: 0,
    products: [],
  },
};

@Injectable({
  providedIn: 'root',
})
export class TestStoreService extends Store<TestStore> {
  private http = inject(HttpClient);
  constructor() {
    super(initialState);
  }
  private apiUrl = 'https://dummyjson.com/products';
  limits = LIMITS;

  page$ = this.select((data: any) => data.results.skip);
  userPage$ = this.page$.pipe(map((skip) => skip + 1));
  limit$ = this.select((data: any) => data.results.limit);

  params$ = combineLatest([this.page$, this.limit$]).pipe(
    map(([page, limit]) => {
      const params: any = {
        limit: `${limit}`,
        skip: `${page * limit}`, // page * limit
      };
      return params;
    })
  );

  productResponse$ = this.params$.pipe(
    switchMap((params) => {
      return this.http.get<any>(this.apiUrl, { params }).pipe(
        tap((results) => {
          //console.log('results', results);
        })
      );
    }),
    shareReplay(1),
    catchError((error) => this.handleError(error))
  );

  products$ = this.productResponse$.pipe(map((data) => data.products));

  totalProducts$ = this.productResponse$.pipe(map((data) => data.total));

  totalPages$ = combineLatest([this.totalProducts$, this.limit$]).pipe(
    map(([totalProducts, limit]) => Math.ceil(totalProducts / limit))
  );

  totalResults$ = this.productResponse$.pipe(map((data) => data.products.length));

  movePageBy(moveBy: number) {
    const currentPage = this.state.results.skip;
    this.setState((state) => ({ results: { ...state.results, skip: currentPage + moveBy } }));
  }

  setLimit(limit: number) {
    this.setState((state) => ({ results: { ...state.results, limit: limit, skip: 0 } }));
  }

  private handleError(error: any): Observable<never> {
    // Handle the error here
    // You might want to throw the error, or log it, or even return a default value
    console.error('Error occurred', error);
    throw error;
  }
}
