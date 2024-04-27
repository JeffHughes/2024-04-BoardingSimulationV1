import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengersAtAirportComponent } from './passengers-at-airport.component';

describe('PassengersAtAirportComponent', () => {
  let component: PassengersAtAirportComponent;
  let fixture: ComponentFixture<PassengersAtAirportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassengersAtAirportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PassengersAtAirportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
