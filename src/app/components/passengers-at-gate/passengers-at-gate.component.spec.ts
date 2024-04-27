import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengersAtGateComponent } from './passengers-at-gate.component';

describe('PassengersAtGateComponent', () => {
  let component: PassengersAtGateComponent;
  let fixture: ComponentFixture<PassengersAtGateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassengersAtGateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PassengersAtGateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
