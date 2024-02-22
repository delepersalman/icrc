import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme1ConfirmationSectionComponent } from './theme1-confirmation-section.component';

describe('Theme1ConfirmationSectionComponent', () => {
  let component: Theme1ConfirmationSectionComponent;
  let fixture: ComponentFixture<Theme1ConfirmationSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme1ConfirmationSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme1ConfirmationSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
