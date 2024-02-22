import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme2IntroRendorComponent } from './theme2-intro-rendor.component';

describe('Theme2IntroRendorComponent', () => {
  let component: Theme2IntroRendorComponent;
  let fixture: ComponentFixture<Theme2IntroRendorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme2IntroRendorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme2IntroRendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
