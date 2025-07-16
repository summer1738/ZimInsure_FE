import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientManagement } from './client-management';

describe('ClientManagement', () => {
  let component: ClientManagement;
  let fixture: ComponentFixture<ClientManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
