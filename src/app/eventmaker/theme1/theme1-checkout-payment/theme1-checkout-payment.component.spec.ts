import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme1CheckoutPaymentComponent } from './theme1-checkout-payment.component';

describe('Theme1CheckoutPaymentComponent', () => {
  let component: Theme1CheckoutPaymentComponent;
  let fixture: ComponentFixture<Theme1CheckoutPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme1CheckoutPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme1CheckoutPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
