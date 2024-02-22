import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventOrganiserComponent } from './event-organiser.component';

describe('EventOrganiserComponent', () => {
  let component: EventOrganiserComponent;
  let fixture: ComponentFixture<EventOrganiserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventOrganiserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventOrganiserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
