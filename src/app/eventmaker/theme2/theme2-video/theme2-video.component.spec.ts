import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { theme2VideoComponent } from './theme2-video.component';

describe('theme2VideoComponent', () => {
  let component: theme2VideoComponent;
  let fixture: ComponentFixture<theme2VideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ theme2VideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(theme2VideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
