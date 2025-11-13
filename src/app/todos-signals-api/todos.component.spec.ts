import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodosSignalsApiComponent } from './todos.component';

describe('TodosSignalsApiComponent', () => {
  let component: TodosSignalsApiComponent;
  let fixture: ComponentFixture<TodosSignalsApiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodosSignalsApiComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TodosSignalsApiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

