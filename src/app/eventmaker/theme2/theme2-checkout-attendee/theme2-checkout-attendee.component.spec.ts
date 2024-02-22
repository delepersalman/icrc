import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme2CheckoutAttendeeComponent } from './theme2-checkout-attendee.component';

describe('Theme1CheckoutAttendeeComponent', () => {
  let component: Theme2CheckoutAttendeeComponent;
  let fixture: ComponentFixture<Theme2CheckoutAttendeeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme2CheckoutAttendeeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme2CheckoutAttendeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
