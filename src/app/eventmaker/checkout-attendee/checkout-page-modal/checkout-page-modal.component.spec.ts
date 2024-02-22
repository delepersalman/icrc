import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutPageModalComponent } from './checkout-page-modal.component';

describe('CheckoutPageModalComponent', () => {
  let component: CheckoutPageModalComponent;
  let fixture: ComponentFixture<CheckoutPageModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckoutPageModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutPageModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
