import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAgendaModalComponent } from './view-agenda-modal.component';

describe('ViewAgendaModalComponent', () => {
  let component: ViewAgendaModalComponent;
  let fixture: ComponentFixture<ViewAgendaModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAgendaModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAgendaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
