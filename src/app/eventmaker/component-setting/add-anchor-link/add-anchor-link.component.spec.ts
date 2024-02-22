import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAnchorLinkComponent } from './add-anchor-link.component';

describe('AddAnchorLinkComponent', () => {
  let component: AddAnchorLinkComponent;
  let fixture: ComponentFixture<AddAnchorLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAnchorLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAnchorLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
