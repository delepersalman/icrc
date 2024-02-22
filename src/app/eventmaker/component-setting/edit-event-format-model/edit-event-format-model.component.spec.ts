import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEventFormatModelComponent } from './edit-event-format-model.component';

describe('EditEventFormatModelComponent', () => {
  let component: EditEventFormatModelComponent;
  let fixture: ComponentFixture<EditEventFormatModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditEventFormatModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditEventFormatModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
