import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodosBasicComponent } from './todos.component';

describe('TodosComponent', () => {
  let component: TodosBasicComponent;
  let fixture: ComponentFixture<TodosBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodosBasicComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TodosBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
