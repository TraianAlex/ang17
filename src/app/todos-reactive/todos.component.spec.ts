import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodosComponent2 } from './todos.component';

describe('TodosComponent', () => {
  let component: TodosComponent2;
  let fixture: ComponentFixture<TodosComponent2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodosComponent2]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TodosComponent2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
