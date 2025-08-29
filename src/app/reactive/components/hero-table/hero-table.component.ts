import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest, map } from 'rxjs';

import { DEFAULT_PAGE, Hero, HeroService } from '../../services/hero.service';
import { HeroBadgeComponent } from '../hero-badge/hero-badge.component';

@Component({
    selector: 'rx-hero-table',
    imports: [CommonModule, HeroBadgeComponent],
    standalone: true,
    templateUrl: './hero-table.component.html',
    styleUrls: ['./hero-table.component.scss']
})
export class HeroTableComponent implements OnDestroy {
  hero = inject(HeroService);
  // heroes$: Observable<Hero[]> = this.hero.heroes$;
  // search$ = this.hero.searchBS;
  // page$ = this.hero.userPage$;
  // limit$ = this.hero.limitBS;
  // totalResults$ = this.hero.totalResults$;
  // totalPages$ = this.hero.totalPages$;

  showSpinner = false;


  vm$ = combineLatest([
    this.hero.heroes$,
    this.hero.search$,
    this.hero.userPage$,
    this.hero.limit$,
    this.hero.totalResults$,
    this.hero.totalPages$,
    this.hero.loading$, // new
  ]).pipe(
    map(([heroes, search, page, limit, totalResults, totalPages, loading]) => {
      return {
        heroes,
        search,
        page,
        limit,
        totalResults,
        totalPages,
        loading,
        disableNext: totalPages === page,
        disablePrev: page === 1,
      };
    })
  );

  // new
  doSearch(event: any) {
    this.hero.doSearch(event.target.value);
  }

  movePageBy(moveBy: number) {
    this.hero.movePageBy(moveBy);
  }

  setLimit(limit: number) {
    this.hero.setLimit(limit);
  }

  // old
  // doSearch(event: any) {
  //   this.hero.searchBS.next(event.target.value);
  //   this.hero.pageBS.next(DEFAULT_PAGE);
  // }

  // movePageBy(moveBy: number) {
  //   const currentPage = this.hero.pageBS.getValue();
  //   this.hero.pageBS.next(currentPage + moveBy);
  // }

  // setLimit(limit: number) {
  //   this.hero.limitBS.next(limit);
  //   this.hero.pageBS.next(DEFAULT_PAGE);
  // }

  ngOnDestroy() {
    // this.hero.destroyCache();
    this.hero.resetCache();
  }
}
