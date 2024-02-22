import { ChangeDetectorRef, Component, Input, OnInit, QueryList, Renderer2, ViewChildren, ViewContainerRef } from '@angular/core';
import { EventCheckoutSettingModel, EventWebsiteModel, EventmakerPageModel, EventmakerSectionModel, SectionPropertyModel, ngStyleModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'theme1-checkout-payment',
  templateUrl: './theme1-checkout-payment.component.html',
  styleUrls: ['./theme1-checkout-payment.component.scss']
})
export class Theme1CheckoutPaymentComponent implements OnInit {
  @Input() eventCheckOut: EventCheckoutSettingModel = new EventCheckoutSettingModel();
  ngStyle: ngStyleModel = new ngStyleModel();
  @ViewChildren('appendItem', { read: ViewContainerRef })
  public dynComponents: QueryList<ViewContainerRef>;
  expanded = false;
  heading: SectionPropertyModel = new SectionPropertyModel();
  tnC: SectionPropertyModel = new SectionPropertyModel();
  tnCLink: SectionPropertyModel = new SectionPropertyModel();
  order: SectionPropertyModel = new SectionPropertyModel();
  PaymentBox: SectionPropertyModel = new SectionPropertyModel();
  CustomQuestionBox: SectionPropertyModel = new SectionPropertyModel();
  BillingDetails: SectionPropertyModel = new SectionPropertyModel();
  CardInfo: SectionPropertyModel = new SectionPropertyModel();
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
  domainUrl: string;
  eventId;
  themeName;
  eventCustomPages: EventmakerSectionModel;
  constructor(private globalService: GlobalService, private cd: ChangeDetectorRef,
    private _eventmakerService: EventMakerService, private renderer: Renderer2) { }
  showHideToolbar(event: any, prop: SectionPropertyModel) {
    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if (vcr.element.nativeElement.innerText == event.target.innerText) {
          this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventCheckOut);
          prop.expanded = true;
        }
      })
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
      this.heading = this.eventCheckOut.SectionProperties.filter(a => a.Name === 'PaymentHeading')[0];
      this.tnC = this.eventCheckOut.SectionProperties.filter(a => a.Name === 'TnC')[0];
      this.tnCLink = this.eventCheckOut.SectionProperties.filter(a => a.Name === 'TncLink')[0];
      this.order = this.eventCheckOut.SectionProperties.filter(a => a.Name === 'Place_OrderBTN')[0];
      this.PaymentBox = this.eventCheckOut.SectionProperties.filter(a => a.Name === 'PaymentBox')[0];
      this.CustomQuestionBox = this.eventCheckOut.SectionProperties.filter(a => a.Name === 'CustomQuestionBox')[0];
      this.BillingDetails = this.eventCheckOut.SectionProperties.filter(a => a.Name === 'BillingDetails')[0];
    this.CardInfo = this.eventCheckOut.SectionProperties.filter(a => a.Name === 'CardInfo')[0];
    }
  }
  showHideButtonToolbar(event: any, prop: SectionPropertyModel) {
    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if (vcr.element.nativeElement.innerText === event.target.innerText) {
          this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventCheckOut, true);
          prop.expanded = true;
        }
      })
  }
  ngOnInit(): void {
    this.renderer.listen('window', 'click', (e: any) => {
      this.dynComponents.forEach(element => {
        if (e.target !== element.element.nativeElement && e.target.parentElement.parentElement.nodeName !== 'BUTTON' && e.target.parentElement.parentElement.nodeName !== "DESIGNER-TOOLBAR" && e.target.parentElement.parentElement.nodeName !== "MAT-CHECKBOX") {
          element.clear();
          return;
        }
      });
    });
    this.domainUrl = environment.domainUrl;
  }
  getStyleString(fieldName: SectionPropertyModel) {
    return this.globalService.getStyleString(fieldName);
  }
  getSectionStyleString(sectionName) {
    return this.globalService.getSectionStyleString(sectionName);
  }
}
