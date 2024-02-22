import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme2ConfirmationSectionComponent } from './theme2-confirmation-section.component';

describe('Theme1ConfirmationSectionComponent', () => {
  let component: Theme2ConfirmationSectionComponent;
  let fixture: ComponentFixture<Theme2ConfirmationSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme2ConfirmationSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme2ConfirmationSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
