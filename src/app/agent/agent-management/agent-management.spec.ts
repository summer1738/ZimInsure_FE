import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentManagement } from './agent-management';

describe('AgentManagement', () => {
  let component: AgentManagement;
  let fixture: ComponentFixture<AgentManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
