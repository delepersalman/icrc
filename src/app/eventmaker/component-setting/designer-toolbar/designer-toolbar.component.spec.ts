import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignerToolbarComponent } from './designer-toolbar.component';

describe('DesignerToolbarComponent', () => {
  let component: DesignerToolbarComponent;
  let fixture: ComponentFixture<DesignerToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesignerToolbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignerToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
