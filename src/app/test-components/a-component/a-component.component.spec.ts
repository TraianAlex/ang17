import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AComponent } from './a-component.component';

describe('AComponentComponent', () => {
  let component: AComponent;
  let fixture: ComponentFixture<AComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
