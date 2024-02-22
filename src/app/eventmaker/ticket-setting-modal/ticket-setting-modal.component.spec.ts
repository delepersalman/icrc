import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketSettingModalComponent } from './ticket-setting-modal.component';

describe('TicketSettingModalComponent', () => {
  let component: TicketSettingModalComponent;
  let fixture: ComponentFixture<TicketSettingModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketSettingModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketSettingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
