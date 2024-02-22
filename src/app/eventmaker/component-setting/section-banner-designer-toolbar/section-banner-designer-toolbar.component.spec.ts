import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionDesignerToolbarComponent } from './section-banner-designer-toolbar.component';

describe('SectionDesignerToolbarComponent', () => {
  let component: SectionDesignerToolbarComponent;
  let fixture: ComponentFixture<SectionDesignerToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SectionDesignerToolbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionDesignerToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
