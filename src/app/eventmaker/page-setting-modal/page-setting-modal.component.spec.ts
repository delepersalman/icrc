import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageSettingModalComponent } from './page-setting-modal.component';

describe('PageSettingModalComponent', () => {
  let component: PageSettingModalComponent;
  let fixture: ComponentFixture<PageSettingModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageSettingModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageSettingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
