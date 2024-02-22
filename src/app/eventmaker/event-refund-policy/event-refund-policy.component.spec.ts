import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventRefundPolicyComponent } from './event-refund-policy.component';

describe('EventRefundPolicyComponent', () => {
  let component: EventRefundPolicyComponent;
  let fixture: ComponentFixture<EventRefundPolicyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventRefundPolicyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventRefundPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
