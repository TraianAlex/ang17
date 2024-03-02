import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EComponentComponent } from './e-component.component';

describe('EComponentComponent', () => {
  let component: EComponentComponent;
  let fixture: ComponentFixture<EComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
