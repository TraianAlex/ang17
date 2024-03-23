import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestStoreService } from './test-store.service';

@Component({
  selector: 'app-test-store',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-store.component.html',
  styleUrl: './test-store.component.scss',
})
export class TestStoreComponent implements OnInit {
  testStoreService = inject(TestStoreService);
  //products$ = this.testStoreService.select((state) => state.products);
  products$ = this.testStoreService.products$;
  totalPages$ = this.testStoreService.totalPages$;
  page$ = this.testStoreService.userPage$;
  totalResults$ = this.testStoreService.totalResults$;
  limit$ = this.testStoreService.limit$;

  ngOnInit(): void {
    //this.testStoreService.getProducts().subscribe();
  }

  movePageBy(moveBy: number) {
    this.testStoreService.movePageBy(moveBy);
  }

  setLimit(limit: number) {
    this.testStoreService.setLimit(limit);
  }
}
