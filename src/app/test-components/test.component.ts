import { AfterViewInit, Component, ContentChild, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { NgComponentOutlet, CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

import { TestStoreService } from '../test-store/test-store.service';
import { TestService } from './test.service';
import { CComponent } from './c-component/c-component.component';
import { DComponent } from './d-component/d-component.component';
import { EComponent } from './e-component/e-component.component';
import { TodosComponent } from '../todos/todos.component';
import { NavigationComponent } from '../navigation/navigation.component';

@Component({
    selector: 'app-test',
    imports: [
        CommonModule,
        RouterOutlet,
        NgComponentOutlet,
        EComponent,
        NavigationComponent,
    ],
    standalone: true,
    templateUrl: './test.component.html',
    styleUrl: './test.component.scss'
})
export class TestComponent implements OnInit, AfterViewInit {
  testStoreService = inject(TestStoreService);
  // @ContentChild('itemTemplate', { static: false }) itemTemplateRef!: TemplateRef<any>;
  // @ViewChild('test1') test1Ref!: EComponent;
  // @ContentChild('item', { static: false }) template!: TemplateRef<any>;

  private adList = inject(TestService).getAds();
  private data = inject(TestService).getData();
  item = 'test-item';
  totalProducts$ = this.testStoreService.totalProducts$;

  ngOnInit(): void {
    //console.log(this.itemTemplateRef);
  }

  ngAfterViewInit(): void {
    //this.test1Ref.item = this.item;
    //console.log(this.itemTemplateRef);
  }

  get currentB() {
    return this.adList.compB;
  }

  get currentA() {
    return this.adList.compA;
  }

  get dataC() {
    return {
      component: CComponent,
      inputs: { propC1: this.data.a, propC2: this.data.b },
    };
  }

  get dataD() {
    return {
      component: DComponent,
      inputs: { propD1: this.data.c, propD2: this.data.d },
    };
  }
}
