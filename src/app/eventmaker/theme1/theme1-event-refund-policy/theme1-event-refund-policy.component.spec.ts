import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme1EventRefundPolicyComponent } from './theme1-event-refund-policy.component';

describe('Theme1EventRefundPolicyComponent', () => {
  let component: Theme1EventRefundPolicyComponent;
  let fixture: ComponentFixture<Theme1EventRefundPolicyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme1EventRefundPolicyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme1EventRefundPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
