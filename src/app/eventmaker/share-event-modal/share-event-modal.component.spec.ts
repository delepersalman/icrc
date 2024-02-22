import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareEventModalComponent } from './share-event-modal.component';

describe('ShareEventModalComponent', () => {
  let component: ShareEventModalComponent;
  let fixture: ComponentFixture<ShareEventModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareEventModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareEventModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
