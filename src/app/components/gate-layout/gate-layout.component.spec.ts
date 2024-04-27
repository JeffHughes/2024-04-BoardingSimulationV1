import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GateLayoutComponent } from './gate-layout.component';

describe('GateLayoutComponent', () => {
  let component: GateLayoutComponent;
  let fixture: ComponentFixture<GateLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GateLayoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GateLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
