import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Them1EventOrganiserComponent } from './them1-event-organiser.component';

describe('Them1EventOrganiserComponent', () => {
  let component: Them1EventOrganiserComponent;
  let fixture: ComponentFixture<Them1EventOrganiserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Them1EventOrganiserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Them1EventOrganiserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
