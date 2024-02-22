import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutAttendeeComponent } from './checkout-attendee.component';

describe('CheckoutAttendeeComponent', () => {
  let component: CheckoutAttendeeComponent;
  let fixture: ComponentFixture<CheckoutAttendeeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckoutAttendeeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutAttendeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
