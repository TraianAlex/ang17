import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface Hero {
  id: number;
  name: string;
  description: string;
  thumbnail: HeroThumbnail;
  resourceURI: string;
  comics: HeroSubItems;
  events: HeroSubItems;
  series: HeroSubItems;
  stories: HeroSubItems;
}

export interface HeroThumbnail {
  path: string;
  extension: string;
}

export interface HeroSubItems {
  available: number;
  returned: number;
  collectionURI: string;
  items: HeroSubItem[];
}

export interface HeroSubItem {
  resourceURI: string;
  name: string;
}

// The URL to the Marvel API
const HERO_API = `${environment.MARVEL_API.URL}/v1/public/characters`;

// Our Limits for Search
const LIMIT_LOW = 10;
const LIMIT_MID = 25;
const LIMIT_HIGH = 100;
const LIMITS = [LIMIT_LOW, LIMIT_MID, LIMIT_HIGH];

const DEFAULT_LIMIT = LIMIT_HIGH;
const DEFAULT_SEARCH = ''; // hulk
export const DEFAULT_PAGE = 0;

const HERO_CACHE = new Map();

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private http = inject(HttpClient);
  limits = LIMITS;

  private searchBS = new BehaviorSubject<string>(DEFAULT_SEARCH);
  private limitBS = new BehaviorSubject<number>(DEFAULT_LIMIT);
  private pageBS = new BehaviorSubject<number>(DEFAULT_PAGE);
  private loadingBS = new BehaviorSubject(false);

  // new
  search$ = this.searchBS.asObservable();
  limit$ = this.limitBS.asObservable();
  // page$ = this.pageBS.asObservable();
  loading$ = this.loadingBS.asObservable();

  userPage$ = this.pageBS.pipe(map((page) => page + 1));

  //private heroesResponseCache = {} as any;

  params$ = combineLatest([
    this.searchBS.pipe(debounceTime(500)),
    this.limitBS,
    this.pageBS.pipe(debounceTime(500)),
  ]).pipe(
    distinctUntilChanged(
      (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
    ),
    map(([searchTerm, limit, page]) => {
      const params: any = {
        apikey: environment.MARVEL_API.PUBLIC_KEY,
        limit: `${limit}`,
        offset: `${page * limit}`, // page * limit
      };
      if (searchTerm.length) {
        params.nameStartsWith = searchTerm;
      }
      return params;
    })
  );

  private heroesResponse$ = this.params$.pipe(
    //debounceTime(500),
    tap(() => this.loadingBS.next(true)),
    switchMap((_params) => {
      // new cache
      const paramsStr = JSON.stringify(_params);
      // if (this.heroesResponseCache[paramsStr]) {
      //   return of(this.heroesResponseCache[paramsStr]);
      // }
      if (HERO_CACHE.has(paramsStr)) {
        return of(HERO_CACHE.get(paramsStr));
      }
      return (
        this.http
          .get(HERO_API, {
            params: _params,
          }) // new cache
          // .pipe(
          //   tap(
          //     (res: any) =>
          //       (this.heroesResponseCache[paramsStr] = res)
          //       //   {
          //       //   response: res,
          //       //   time: Date.now(),
          //       // }
          //   )
          // );
          .pipe(tap((res: any) => HERO_CACHE.set(paramsStr, res)))
      );
    }),
    tap(() => this.loadingBS.next(false)),
    shareReplay(1)
  );

  totalResults$ = this.heroesResponse$.pipe(map((res: any) => res.data.total));

  heroes$: Observable<Hero[]> = this.heroesResponse$.pipe(
    map((res: any) => res.data.results)
  );

  totalPages$ = combineLatest([this.totalResults$, this.limitBS]).pipe(
    map(([totalResults, limit]) => Math.ceil(totalResults / limit))
  );

  // new
  doSearch(term: string) {
    this.searchBS.next(term);
    this.pageBS.next(DEFAULT_PAGE);
  }

  movePageBy(moveBy: number) {
    const currentPage = this.pageBS.getValue();
    this.pageBS.next(currentPage + moveBy);
  }

  setLimit(newLimit: number) {
    this.limitBS.next(newLimit);
    this.pageBS.next(DEFAULT_PAGE);
  }

  // new cache
  // destroyCache() {
  //   this.heroesResponseCache = {};
  // }
  resetCache() {
    HERO_CACHE.clear();
  }
}
