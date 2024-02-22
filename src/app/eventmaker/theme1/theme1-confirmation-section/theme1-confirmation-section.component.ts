import { ChangeDetectorRef, Component, Input, OnInit, QueryList, Renderer2, ViewChildren, ViewContainerRef } from '@angular/core';
import { EventCheckoutSettingModel, SectionPropertyModel, ngStyleModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'theme1-confirmation-section',
  templateUrl: './theme1-confirmation-section.component.html',
  styleUrls: ['./theme1-confirmation-section.component.scss']
})
export class Theme1ConfirmationSectionComponent implements OnInit {
  @Input() confirmationSection: EventCheckoutSettingModel = new EventCheckoutSettingModel();
  ngStyle:ngStyleModel = new ngStyleModel();
  @ViewChildren('appendItem', { read: ViewContainerRef })
  public dynComponents: QueryList<ViewContainerRef>;
  expanded = false;
  SuccessMessage:SectionPropertyModel= new SectionPropertyModel();
  OrderNumber:SectionPropertyModel= new SectionPropertyModel();
  TicketEmailed: SectionPropertyModel= new SectionPropertyModel();
  YourPurchageLink: SectionPropertyModel= new SectionPropertyModel();
  GoToAllPurchageLink: SectionPropertyModel= new SectionPropertyModel();
  ShareEventLink: SectionPropertyModel= new SectionPropertyModel();
  WhatsNext: SectionPropertyModel= new SectionPropertyModel();
  CreateEventLink: SectionPropertyModel= new SectionPropertyModel();
  ContactUsLink: SectionPropertyModel= new SectionPropertyModel();
  SeeOrganigerLink: SectionPropertyModel= new SectionPropertyModel();
  MoreEventLink: SectionPropertyModel= new SectionPropertyModel();
  AddtoCalendar: SectionPropertyModel= new SectionPropertyModel();
  ConfirmationBox: SectionPropertyModel= new SectionPropertyModel();  
  VenueName: SectionPropertyModel = new SectionPropertyModel();
  TicketName: SectionPropertyModel = new SectionPropertyModel();
  TicketDate: SectionPropertyModel = new SectionPropertyModel();
  domainUrl: string;
  TicketCountNo: SectionPropertyModel;
  ShareEventBox: SectionPropertyModel;
  constructor(private globalService: GlobalService, private cd: ChangeDetectorRef, private renderer: Renderer2) { }
  showHideToolbar(event: any, prop: SectionPropertyModel) {
    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if (vcr.element.nativeElement == event.target) {
          this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.confirmationSection);
          prop.expanded = true;
        }
      })
  }
  changeAlignment(event) {
    this.globalService.changeAlignment(event, this.confirmationSection, this.ngStyle);
    this.cd.detectChanges();
  }
  ChangeDetect(event, section) {
    this.ngStyle = this.globalService.changeDetected(event, section, this.ngStyle, this.cd);
    this.cd.detectChanges();
  }
  onChange(value, prop) {
    this.globalService.onChange(value, prop, this.confirmationSection);
  }
  ngDoCheck(): void {
    if (this.confirmationSection.ComponentId) {
      this.SuccessMessage = this.confirmationSection.SectionProperties.filter(a => a.Name === 'SuccessMessage')[0];
      this.OrderNumber = this.confirmationSection.SectionProperties.filter(a => a.Name === 'OrderNumber')[0];
      this.TicketEmailed = this.confirmationSection.SectionProperties.filter(a => a.Name === 'TicketEmailed')[0];
      this.YourPurchageLink = this.confirmationSection.SectionProperties.filter(a => a.Name === 'YourPurchageLink')[0];
      this.GoToAllPurchageLink = this.confirmationSection.SectionProperties.filter(a => a.Name === 'GoToAllRegistration')[0];
      this.ShareEventLink = this.confirmationSection.SectionProperties.filter(a => a.Name === 'ShareEventLink')[0];
      this.WhatsNext = this.confirmationSection.SectionProperties.filter(a => a.Name === 'WhatNext')[0];
      this.CreateEventLink = this.confirmationSection.SectionProperties.filter(a => a.Name === 'CreateEventLink')[0];
      this.ContactUsLink = this.confirmationSection.SectionProperties.filter(a => a.Name === 'ContactUsLink')[0];
      this.SeeOrganigerLink = this.confirmationSection.SectionProperties.filter(a => a.Name === 'SeeOrganigerLink')[0];
      this.MoreEventLink = this.confirmationSection.SectionProperties.filter(a => a.Name === 'MoreEventLink')[0];
      this.AddtoCalendar = this.confirmationSection.SectionProperties.filter(a => a.Name === 'AddtoCalendar')[0];
      this.ConfirmationBox = this.confirmationSection.SectionProperties.filter(a => a.Name === 'ConfirmationBox')[0];
      this.TicketName = this.confirmationSection.SectionProperties.filter(a => a.Name === 'TicketName')[0];
      this.VenueName = this.confirmationSection.SectionProperties.filter(a => a.Name === 'CN_VenueName')[0];
      this.TicketDate = this.confirmationSection.SectionProperties.filter(a => a.Name === 'TicketDate')[0];
      this.TicketCountNo = this.confirmationSection.SectionProperties.filter(a => a.Name === 'TicketCountNo')[0];
      this.ShareEventBox = this.confirmationSection.SectionProperties.filter(a => a.Name === 'ShareEventBox')[0];
    }
  }
  getStyleString(fieldName: SectionPropertyModel) {
    return this.globalService.getStyleString(fieldName);
  }
  getSectionStyleString(sectionName) {
    return this.globalService.getSectionStyleString(sectionName);
  }
  showHideButtonToolbar(event: any, prop: SectionPropertyModel) {
    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if (vcr.element.nativeElement == event.target) {
          this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.confirmationSection, true);
          prop.expanded = true;
        }
      })
  }
  ngOnInit(): void {
    this.renderer.listen('window', 'click', (e: any) => {
      this.globalService.clearToolBar(this.dynComponents, e);
    });
    this.domainUrl = environment.domainUrl;
  }

}
