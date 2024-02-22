import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToCalendarModalComponent } from './add-to-calendar-modal.component';

describe('AddToCalendarModalComponent', () => {
  let component: AddToCalendarModalComponent;
  let fixture: ComponentFixture<AddToCalendarModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddToCalendarModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddToCalendarModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
