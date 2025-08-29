import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TestStoreService } from './test-store.service';

@Component({
    selector: 'app-test-store',
    imports: [CommonModule],
    standalone: true,
    templateUrl: './test-store.component.html',
    styleUrl: './test-store.component.scss'
})
export class TestStoreComponent {
  testStoreService = inject(TestStoreService);
  products$ = this.testStoreService.products$;
  totalPages$ = this.testStoreService.totalPages$;
  page$ = this.testStoreService.userPage$;
  totalResults$ = this.testStoreService.totalResults$;
  limit$ = this.testStoreService.limit$;

  movePageBy(moveBy: number) {
    this.testStoreService.movePageBy(moveBy);
  }

  setLimit(limit: number) {
    this.testStoreService.setLimit(limit);
  }
}
