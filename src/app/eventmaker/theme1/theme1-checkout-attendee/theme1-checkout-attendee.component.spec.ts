import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme1CheckoutAttendeeComponent } from './theme1-checkout-attendee.component';

describe('Theme1CheckoutAttendeeComponent', () => {
  let component: Theme1CheckoutAttendeeComponent;
  let fixture: ComponentFixture<Theme1CheckoutAttendeeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme1CheckoutAttendeeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme1CheckoutAttendeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
