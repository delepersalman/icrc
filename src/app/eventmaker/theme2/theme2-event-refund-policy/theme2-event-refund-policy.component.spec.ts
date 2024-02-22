import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { theme2EventRefundPolicyComponent } from './theme2-event-refund-policy.component';

describe('theme2EventRefundPolicyComponent', () => {
  let component: theme2EventRefundPolicyComponent;
  let fixture: ComponentFixture<theme2EventRefundPolicyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ theme2EventRefundPolicyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(theme2EventRefundPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
