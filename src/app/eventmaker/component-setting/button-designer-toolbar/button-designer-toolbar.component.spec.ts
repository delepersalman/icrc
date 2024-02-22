import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonDesignerToolbarComponent } from './button-designer-toolbar.component';

describe('ButtonDesignerToolbarComponent', () => {
  let component: ButtonDesignerToolbarComponent;
  let fixture: ComponentFixture<ButtonDesignerToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonDesignerToolbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonDesignerToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
