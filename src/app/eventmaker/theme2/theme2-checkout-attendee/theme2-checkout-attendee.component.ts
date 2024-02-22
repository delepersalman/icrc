import { ChangeDetectorRef, Component, Input, OnInit, QueryList, Renderer2, ViewChildren, ViewContainerRef } from '@angular/core';
import { EventCheckoutSettingModel, ngStyleModel, SectionPropertyModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'theme2-checkout-attendee',
  templateUrl: './theme2-checkout-attendee.component.html',
  styleUrls: ['./theme2-checkout-attendee.component.scss']
})
export class Theme2CheckoutAttendeeComponent implements OnInit {
  @Input() eventCheckOut: EventCheckoutSettingModel = new EventCheckoutSettingModel();
  ngStyle: ngStyleModel = new ngStyleModel();
  @Input() websiteDetails: any;
  @ViewChildren('appendItem', { read: ViewContainerRef })
  public dynComponents: QueryList<ViewContainerRef>;
  expanded = false;
  heading: SectionPropertyModel = new SectionPropertyModel();
  instructionAttendee: SectionPropertyModel = new SectionPropertyModel();
  order: SectionPropertyModel = new SectionPropertyModel();
  countDown: SectionPropertyModel = new SectionPropertyModel();
  CheckoutHDNG: SectionPropertyModel = new SectionPropertyModel();
  PromoCode: SectionPropertyModel = new SectionPropertyModel();
  InstallmentBox: SectionPropertyModel = new SectionPropertyModel();
  VariableBox: SectionPropertyModel = new SectionPropertyModel();
  MembershipBox: SectionPropertyModel = new SectionPropertyModel();
  CustomQuestionBox: SectionPropertyModel = new SectionPropertyModel();
  AttendeesInfo: SectionPropertyModel = new SectionPropertyModel();
  MemberEnabled: SectionPropertyModel = new SectionPropertyModel();
  TotalLabel: SectionPropertyModel = new SectionPropertyModel();
  TicketBox: SectionPropertyModel = new SectionPropertyModel();
  domainUrl: string;
  firstName: string;
  lastName: string;
  email: string;
  addAttendeeInfoToggle: boolean;
  phoneNumExtentions: 1;
  phoneNumber: number;
  paymentMethod: 1;
  accessCode: string;
  accessCodeApplyToggle: boolean;

  country: string;
  zipcode: string;
  ticketPaymentphoneNumExtentions: string;
  ticketPaymentphoneNumber: string;
  billingStreetAddress: string;
  billingOptionalAddress: string;
  cardNumber: number;
  expirationDate: string;
  securityCode: string;
  nameOnCard: string;
  iAgreeTerms: string;
  saveCardInfo: string;
  city: string;
  showAttendees: boolean;

  constructor(private globalService: GlobalService, private cd: ChangeDetectorRef, private renderer: Renderer2) { }
  showHideToolbar(event: any, prop: SectionPropertyModel) {
    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if (vcr.element.nativeElement == event.target) {
          this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventCheckOut);
          prop.expanded = true;
        }
      });
  }
  changeAlignment(event) {
    this.globalService.changeAlignment(event, this.eventCheckOut, this.ngStyle);
    this.cd.detectChanges();
    this.ngStyle = new ngStyleModel();
  }
  ChangeDetect(event, section) {
    this.ngStyle = this.globalService.changeDetected(event, section, this.ngStyle, this.cd);
    this.cd.detectChanges();
  }
  onChange(value, prop) {
    this.globalService.onChange(value, prop, this.eventCheckOut);
  }
  ngDoCheck(): void {
    if (this.eventCheckOut.ComponentId) {
      this.instructionAttendee = this.eventCheckOut.SectionProperties.filter(a => a.Name === 'InstructionsforAttendees')[0];
      this.heading = this.eventCheckOut.SectionProperties.filter(a => a.Name === 'Title')[0];
      this.CheckoutHDNG = this.eventCheckOut.SectionProperties.filter(a => a.Name === 'Checkout_Heading')[0];
      this.countDown = this.eventCheckOut.SectionProperties.filter(a => a.Name === 'OrderTimeOut')[0];
      this.PromoCode = this.eventCheckOut.SectionProperties.filter(a => a.Name === 'PromoCode')[0];
      this.InstallmentBox = this.eventCheckOut.SectionProperties.filter(a => a.Name === 'InstallmentBox')[0];
      this.VariableBox = this.eventCheckOut.SectionProperties.filter(a => a.Name === 'VariableBox')[0];
      this.MembershipBox = this.eventCheckOut.SectionProperties.filter(a => a.Name === 'MembershipBox')[0];
      this.CustomQuestionBox = this.eventCheckOut.SectionProperties.filter(a => a.Name === 'CustomQuestionBox')[0];
      this.AttendeesInfo = this.eventCheckOut.SectionProperties.filter(a => a.Name === 'AttendeesInfo')[0];
      this.TotalLabel =  this.eventCheckOut.SectionProperties.filter(a => a.Name === 'TotalLabel')[0];
      this.MemberEnabled =  this.eventCheckOut.SectionProperties.filter(a => a.Name === 'MemberEnabled')[0];
      this.TicketBox = this.eventCheckOut.SectionProperties.filter(a => a.Name == 'TicketCheckoutBox')[0];
    }
  }
  showHideButtonToolbar(event: any, prop: SectionPropertyModel, ticket: any = undefined) {
    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if (vcr.element.nativeElement == event.target) {
          if (ticket) {
            prop.FieldId = ticket.TicketId;
            if(this.ngStyle.PropertyName === 'TicketCheckoutBox'){
            prop.BGColor = ticket.BGColor;
            prop.Color = ticket.TextColor;
            }
            prop.CheckoutBGColor = ticket.CheckoutBGColor;
            this.ngStyle.FieldId = ticket.TicketId;
          }
          this.ngStyle.websiteDetails = this.websiteDetails;
          this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventCheckOut, true,false,this.websiteDetails);
          prop.expanded = true;
        }
      })
  }
  ngOnInit(): void {
    this.globalService.onFieldDataChanged.subscribe(s => {
      for (let index = 0; index < s.length; index++) {
        for (let j = 0; j < this.eventCheckOut.Tickets.length; j++) {
          if (s[index].FieldId === this.eventCheckOut.Tickets[j].TicketId && (s[index].FieldName === 'TicketBox' || s[index].FieldName === 'TicketCheckoutBox')) {
            this.eventCheckOut.Tickets[j].BGColor = s[index].BGColor;
            this.eventCheckOut.Tickets[j].TextColor = s[index].TextColor;
            this.eventCheckOut.Tickets[j].CheckoutBGColor = s[index].CheckoutBGColor;
          }
        }
      }
    });
    this.renderer.listen('window', 'click', (e: any) => {
      this.dynComponents.forEach(element => {
        if (e.target !== element.element.nativeElement && e.target.parentElement.parentElement.nodeName !== 'BUTTON' && e.target.parentElement.parentElement.nodeName !== "DESIGNER-TOOLBAR") {
          element.clear();
          return;
        }
      });
    });
    this.domainUrl = environment.domainUrl;
  }
  getTicketProperty(TicketId, Name) {
    return this.eventCheckOut.SectionProperties.filter(a => a.DataFieldId === TicketId && a.Name === Name)[0];
  }
  getStyleString(fieldName: SectionPropertyModel) {
    return this.globalService.getStyleString(fieldName);
  }
  getSectionStyleString(sectionName) {
    return this.globalService.getSectionStyleString(sectionName);
  }
}
