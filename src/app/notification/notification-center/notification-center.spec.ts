import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationCenter } from './notification-center';

describe('NotificationCenter', () => {
  let component: NotificationCenter;
  let fixture: ComponentFixture<NotificationCenter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationCenter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationCenter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
