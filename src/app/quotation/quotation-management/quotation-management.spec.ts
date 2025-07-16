import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationManagement } from './quotation-management';

describe('QuotationManagement', () => {
  let component: QuotationManagement;
  let fixture: ComponentFixture<QuotationManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotationManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
