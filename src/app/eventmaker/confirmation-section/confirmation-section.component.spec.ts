import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationSectionComponent } from './confirmation-section.component';

describe('ConfirmationSectionComponent', () => {
  let component: ConfirmationSectionComponent;
  let fixture: ComponentFixture<ConfirmationSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmationSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
