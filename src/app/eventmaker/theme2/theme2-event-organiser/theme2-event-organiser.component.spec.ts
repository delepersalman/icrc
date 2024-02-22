import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Them2EventOrganiserComponent } from './them2-event-organiser.component';

describe('Them1EventOrganiserComponent', () => {
  let component: Them2EventOrganiserComponent;
  let fixture: ComponentFixture<Them2EventOrganiserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Them2EventOrganiserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Them2EventOrganiserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
