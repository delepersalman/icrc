import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditButtonLabelComponent } from './edit-button-label.component';

describe('EditButtonLabelComponent', () => {
  let component: EditButtonLabelComponent;
  let fixture: ComponentFixture<EditButtonLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditButtonLabelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditButtonLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
