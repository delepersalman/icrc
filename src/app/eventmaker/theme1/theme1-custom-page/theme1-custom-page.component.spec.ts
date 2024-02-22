import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme1CustomPageComponent } from './theme1-custom-page.component';

describe('Theme1CustomPageComponent', () => {
  let component: Theme1CustomPageComponent;
  let fixture: ComponentFixture<Theme1CustomPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme1CustomPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme1CustomPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
