import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CabinLayoutComponent } from './cabin-layout.component';

describe('CabinLayoutComponent', () => {
  let component: CabinLayoutComponent;
  let fixture: ComponentFixture<CabinLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CabinLayoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CabinLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
