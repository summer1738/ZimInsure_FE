import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarManagement } from './car-management';

describe('CarManagement', () => {
  let component: CarManagement;
  let fixture: ComponentFixture<CarManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
