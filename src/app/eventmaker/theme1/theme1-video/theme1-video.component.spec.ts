import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme1VideoComponent } from './theme1-video.component';

describe('Theme1VideoComponent', () => {
  let component: Theme1VideoComponent;
  let fixture: ComponentFixture<Theme1VideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme1VideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme1VideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
