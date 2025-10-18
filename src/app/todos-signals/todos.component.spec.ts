import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodosSignalsComponent } from './todos.component';

describe('TodosSignalsComponent', () => {
  let component: TodosSignalsComponent;
  let fixture: ComponentFixture<TodosSignalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodosSignalsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TodosSignalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
