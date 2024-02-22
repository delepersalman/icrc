import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme2CustomPageComponent } from './theme2-custom-page.component';

describe('Theme2CustomPageComponent', () => {
  let component: Theme2CustomPageComponent;
  let fixture: ComponentFixture<Theme2CustomPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme2CustomPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme2CustomPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
