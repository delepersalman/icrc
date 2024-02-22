import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventMapsComponent } from './event-maps.component';

describe('EventMapsComponent', () => {
  let component: EventMapsComponent;
  let fixture: ComponentFixture<EventMapsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventMapsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventMapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
