import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, Renderer2, SimpleChanges, ViewChildren, ViewContainerRef } from '@angular/core';
import { EventmakerPageModel, EventmakerSectionModel, EventWebsiteModel,EventTicketState, ngStyleModel, SectionPropertyModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventDealModel, PromoCodeResponseModel, TicketInfoModel, TicketInfoViewModel, TicketLockRequestModel, TicketLockResponseModel, TicketLockViewModel } from 'src/app/shared/models/event/event-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { EventCheckoutService } from 'src/app/shared/services/event-maker/event-checkout.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CheckoutPageModalComponent } from '../../checkout-attendee/checkout-page-modal/checkout-page-modal.component';
import { CheckoutPageModalConfirmComponent } from '../../checkout-attendee/checkout-page-modal/checkout-page-modal-confirm/checkout-page-modal-confirm.component';
import { ViewEventService } from '../../service/view-event.service';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { ViewAgendaModalComponent } from '../../event-tickets/view-agenda-modal/view-agenda-modal.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { MessageService } from 'src/app/shared/services/message.service';

@Component({
  selector: 'theme2-event-tickets',
  templateUrl: './theme2-event-tickets.component.html',
  styleUrls: ['./theme2-event-tickets.component.scss']
})
export class Theme2EventTicketsComponent implements OnInit {
  kmaEventId = null;
  @Input() eventTickets: TicketInfoModel;
  @Input() isFullPage: boolean;
  @Input() websiteDetails: EventWebsiteModel;
  @Input() Discount: any;
  ngStyle: ngStyleModel = new ngStyleModel();
  domainUrl: string;
  totalPrice = 0;
  totalPriceWithoutDiscout = 0;
  heading: SectionPropertyModel = new SectionPropertyModel();
  TicketName: SectionPropertyModel = new SectionPropertyModel();
  Price: SectionPropertyModel = new SectionPropertyModel();
  Quantity: SectionPropertyModel = new SectionPropertyModel();
  TotalHeader: SectionPropertyModel = new SectionPropertyModel();

  TicketInName: SectionPropertyModel = new SectionPropertyModel();
  TicketInTotal: SectionPropertyModel = new SectionPropertyModel();
  TicketInQuantity: SectionPropertyModel = new SectionPropertyModel();
  TicketInPrice: SectionPropertyModel = new SectionPropertyModel();
  TicketInVenue: SectionPropertyModel = new SectionPropertyModel();
  TicketInDate: SectionPropertyModel = new SectionPropertyModel();

  ViewAgenda: SectionPropertyModel = new SectionPropertyModel();
  Total: SectionPropertyModel = new SectionPropertyModel();
  Description: SectionPropertyModel = new SectionPropertyModel();
  PromoCode: SectionPropertyModel = new SectionPropertyModel();
  ApplyButton: SectionPropertyModel = new SectionPropertyModel();
  CheckoutButton: SectionPropertyModel = new SectionPropertyModel();
  TimeOnTicketBox: SectionPropertyModel = new SectionPropertyModel();
  Ticket_Venue: SectionPropertyModel = new SectionPropertyModel();
  TicketBox: SectionPropertyModel = new SectionPropertyModel();
  CheckoutAllowInPopup: boolean = false;
  @ViewChildren('appendItem', { read: ViewContainerRef })
  public dynComponents: QueryList<ViewContainerRef>;
  expanded = false;
  EventId: number;
  checkoutSections: EventmakerSectionModel[] = [];
  parentDialog: MatDialogRef<CheckoutPageModalComponent>;
  promoCodeValue: string;
  promoCodeApplied: boolean;
  promoCodeCheckResponse: PromoCodeResponseModel;
  @Input() State: EventTicketState;
  sectionHeading: SectionPropertyModel;
  sectionBanner: SectionPropertyModel;
  constructor(
    private _messageService: MessageService,
    private globalService: GlobalService,
    private _router: Router,
    private _eventmakerService: EventMakerService,
    private dialog: MatDialog,
    private _checkoutService: EventCheckoutService,
    private renderer: Renderer2,
    private cd: ChangeDetectorRef,
    private _route: ActivatedRoute) { }

  ngOnInit(): void {
    this._route.queryParams.subscribe(params => {
      this.kmaEventId = params['amp;kmaEventId'];
      });
    this.domainUrl = environment.domainUrl;
    this.globalService.onTicketLoadedAfterPromoCodeChanged.subscribe(s => {
      this.calculateGrossPrice();
    });
    this.globalService.onFieldDataChanged.subscribe(s => {
      for (let index = 0; index < s.length; index++) {
        for (let j = 0; j < this.eventTickets.eventTickets.length; j++) {
          if (s[index].FieldId === this.eventTickets.eventTickets[j].TicketId && s[index].FieldName === 'TicketBox') {
            this.eventTickets.eventTickets[j].BGColor = s[index].BGColor;
            this.eventTickets.eventTickets[j].TextColor = s[index].TextColor;
          }
        }
      }
    });
    this.renderer.listen('window', 'click', (e: any) => {
      this.globalService.clearToolBar(this.dynComponents, e);
    });
  }

  showHideToolbar(event: any, prop: SectionPropertyModel,ticket: any = undefined) {
    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if (vcr.element.nativeElement == event.target) {
          this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventTickets);
          prop.expanded = true;
        }
      });
  }
  showHideButtonToolbar(event: any, prop: SectionPropertyModel, ticket: any = undefined) {
    if (this.eventTickets.EditMode) {
      this.dynComponents.map(
        (vcr: ViewContainerRef, index: number) => {
          vcr.clear();
          prop.expanded = false;
          if (1 || vcr.element.nativeElement == event.target) {
            if (ticket) {
              prop.FieldId = ticket.TicketId;
              if(this.ngStyle.PropertyName === 'TicketBox'){
              prop.BGColor = ticket.BGColor;
              prop.Color = ticket.Color;
              }
              this.ngStyle.FieldId = ticket.TicketId;
              this.ngStyle.TicketTypeId = ticket.TicketTypeId;
            }
            this.ngStyle.websiteDetails = this.websiteDetails;
            this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventTickets, true);
            prop.expanded = true;
          }
        });
    }
  }
  getTicketProperty(TicketId, Name) {
    return this.eventTickets.SectionProperties.filter(a => a.DataFieldId === TicketId && a.Name === Name)[0];
  }
  onChange(value, prop) {
    this.globalService.onChange(value, prop, this.eventTickets);
  }
  changeAlignment(event) {
    this.globalService.changeAlignment(event, this.eventTickets, this.ngStyle);
    this.cd.detectChanges();
  }
  ngDoCheck(): void {
    if (this.eventTickets.ComponentId) {
      if (this.Discount) {
        this.promoCodeValue = this.Discount
        this.applyPromoCode();
      }
      this.heading = this.eventTickets.SectionProperties.filter(a => a.Name == 'Tickets')[0];
      this.ViewAgenda = this.eventTickets.SectionProperties.filter(a => a.Name == 'ViewAgenda')[0];
      this.Total = this.eventTickets.SectionProperties.filter(a => a.Name == 'TotalPrice')[0];
      this.Price = this.eventTickets.SectionProperties.filter(a => a.Name == 'Price')[0];
      this.Quantity = this.eventTickets.SectionProperties.filter(a => a.Name == 'Quantity')[0];
      this.TotalHeader = this.eventTickets.SectionProperties.filter(a => a.Name == 'Total')[0];

      this.TicketInName = this.eventTickets.SectionProperties.filter(a => a.Name == 'TicketInName')[0];
      this.TicketInTotal = this.eventTickets.SectionProperties.filter(a => a.Name == 'TicketInTotal')[0];
      this.TicketInQuantity = this.eventTickets.SectionProperties.filter(a => a.Name == 'TicketInQuantity')[0];
      this.TicketInPrice = this.eventTickets.SectionProperties.filter(a => a.Name == 'TicketInPrice')[0];
      this.TicketInVenue = this.eventTickets.SectionProperties.filter(a => a.Name == 'TicketInVenue')[0];
      this.TicketInDate = this.eventTickets.SectionProperties.filter(a => a.Name == 'TicketInDate')[0];

      this.PromoCode = this.eventTickets.SectionProperties.filter(a => a.Name == 'PromoCode')[0];
      this.ApplyButton = this.eventTickets.SectionProperties.filter(a => a.Name == 'Apply')[0];
      this.CheckoutButton = this.eventTickets.SectionProperties.filter(a => a.Name == 'Checkout')[0];
      this.TimeOnTicketBox = this.eventTickets.SectionProperties.filter(a => a.Name == 'TimeOnTicketBox')[0];
      this.Ticket_Venue = this.eventTickets.SectionProperties.filter(a => a.Name == 'Ticket_Venue')[0];
      this.TicketName = this.eventTickets.SectionProperties.filter(a => a.Name == 'TicketName')[0];
      this.Description = this.eventTickets.SectionProperties.filter(a => a.Name == 'Description')[0];
      this.ngStyle.sectionTextColor = this.eventTickets.ModuleTextColor;
      this.ngStyle.sectionBgColor = this.eventTickets.ModuleBGColor;
      this.ngStyle.SectionBorder = this.eventTickets.SectionBorder;
      this.ngStyle.SectionPadding = this.eventTickets.SectionPadding;
      this.ngStyle.BannerSectionBGColor = this.eventTickets.SectionBGColor;
      this.ngStyle.BannerSectionBorder = this.eventTickets.BannerSectionBorder;
      this.ngStyle.BannerSectionPadding = this.eventTickets.BannerSectionPadding;
      this.TicketBox = this.eventTickets.SectionProperties.filter(a => a.Name == 'TicketBox')[0];
      this.sectionHeading = this.eventTickets.SectionProperties.filter(a => a.Name == 'SectionHeading')[0];
      this.sectionBanner = this.eventTickets.SectionProperties.filter(a => a.Name == 'SectionBanner')[0];
    }
  }
  onPriceBlur(e, ticket) {
    ticket.Amount = (ticket.Amount < 0) || isNaN(ticket.Amount) || !ticket.Amount ? 0 : ticket.Amount;
    this.calculateTotalPrice(e, ticket, undefined);
  }

  calculateTotalPrice(e, ticket, AddorRemove) {
    if (this.promoCodeCheckResponse) {
      if (ticket.TicketTypeId !== 3) {
        if (ticket.Quantity > 0 || AddorRemove) {
          if (AddorRemove === false || ticket.Quantity < ticket.Quants.length)
            ticket.Quantity = (AddorRemove ? ticket.Quantity + 1 : ticket.Quantity - 1);
        }
      }
      if (ticket.TicketTypeId !== 1)
        this.applyPromoCodeDiscountOnTicket(this.promoCodeCheckResponse, ticket);
    } else {
      if (ticket.TicketTypeId !== 3) {
        if (ticket.Quantity > 0 || AddorRemove) {
          if (AddorRemove === false || ticket.Quantity < ticket.Quants.length)
            ticket.Quantity = (AddorRemove ? ticket.Quantity + 1 : ticket.Quantity - 1);
          ticket.TotalPrice = parseInt(ticket.Quantity) * ticket.Price;
        }
      }
      else {
        ticket.Amount = isNaN(ticket.Amount) || ticket.Amount < 0 ? 0 : ticket.Amount;
        ticket.TotalPrice = Number(ticket.Amount);
      }
    }
    this.totalPrice = Number((this.eventTickets.eventTickets.filter(f => !f.SoldOut).map(a => a.TotalPrice).reduce((acc, cur) => acc + cur, 0)).toFixed(2));
    this.totalPriceWithoutDiscout = Number((this.eventTickets.eventTickets.filter(f => !f.SoldOut).map(a => a.GrossTotal).reduce((acc, cur) => acc + cur, 0)).toFixed(2));
  }
  clearAmount(ticket) {
    if (ticket.Amount == 0)
      ticket.Amount = '';
  }
  calculateGrossPrice() {
    if (this.promoCodeCheckResponse) {
      if (this.promoCodeCheckResponse.Tickets) {
        this.promoCodeCheckResponse.Tickets.forEach(t => {
          let tFound = this.eventTickets.eventTickets.find(f => f.TicketId == t.TicketId);
          if (tFound) {
            this.applyPromoCodeDiscountOnTicket(this.promoCodeCheckResponse, tFound);
          }
        });
      } else {
        this.eventTickets.eventTickets.filter(f => !f.SoldOut).forEach(tt => { this.applyPromoCodeDiscountOnTicket(this.promoCodeCheckResponse, tt) });
      }
    }
    this.totalPrice = Number((this.eventTickets.eventTickets.filter(f => !f.SoldOut).map(a => a.TotalPrice).reduce((acc, cur) => acc + cur, 0)).toFixed(2));
    this.totalPriceWithoutDiscout = Number((this.eventTickets.eventTickets.filter(f => !f.SoldOut).map(a => a.GrossTotal).reduce((acc, cur) => acc + cur, 0)).toFixed(2));
  }

  applyPromoCode() {
    if (!this.eventTickets.EditMode) {

      if (this.promoCodeApplied) { return false; }
      if (!this.promoCodeValue) { return false; }

      this._checkoutService.checkPromoCode(this.eventTickets.EventId, this.promoCodeValue).subscribe(res => {
        if (res) {

          if (res.Message) {
            this._messageService.showErrorMessage(res.Message);
            return;
          }

          this.promoCodeCheckResponse = res;
          this.globalService.setPromoCode(res.PromoCode);
          this.promoCodeApplied = true;
        } else {
          this.promoCodeApplied = false;
        }
      })
    }
  }

  removePromoCode(event: any) {
    this.promoCodeApplied = false;
    this.promoCodeValue = '';
    this.promoCodeCheckResponse = undefined;
    this.globalService.removePromoCode();
  }

  orderCheckout(webreferralId, viewOnMap) {
    if (!this.eventTickets.EditMode) {
      this._eventmakerService.getEventWebsiteDetail(this.eventTickets.EventId).subscribe((eventDetails: EventWebsiteModel) => {

        //($scope.cartDeals, webreferralId, viewOnMap, $scope.waitlistId)
        let ticketData = new TicketLockRequestModel();
        ticketData.Deals = this.eventTickets.eventDeals;
        eventDetails.EventPages.forEach(res => {
          if (res.PageSystemName === 'checkout') {
            this.CheckoutAllowInPopup = res.PageSections.filter(x => x.Selected && x.PageSystemName === "checkout-attendee")[0]?.EventmakerPagePropertyDesigns?.filter(a => a.Name == 'AllowCheckoutinPopup')[0] ? true : false;
          }
        });
        //data.EventId = this.eventTickets
        this.eventTickets.eventTickets.forEach(tick => {

          if (tick.TicketTypeId === 3 && tick.Amount > 0  || (this.eventTickets.EventId == this.kmaEventId)) {
            let ticket = new TicketLockViewModel();
            ticket.Donate = tick.Amount;
            ticket.Quantity = 1;
            ticket.TicketQuantityDetailId = tick.TQDId;
            ticket.Amount = tick.Amount;
            ticketData.Tickets.push(ticket);
          } else if (tick.Quantity > 0) {
            let ticket = new TicketLockViewModel();
            ticket.LockTicketId = tick.TicketId;
            ticket.Donate = 0;
            ticket.Quantity = tick.Quantity;
            ticket.TicketQuantityDetailId = tick.TQDId;
            ticket.Amount = tick.TotalPrice;
            ticketData.Tickets.push(ticket);
          }
        });
        ticketData.IP = "";
        ticketData.WaitListId = 0;
        ticketData.AffiliateMemberId = 0;
        ticketData.AccessPromoCodeId = 0;
        ticketData.EventId = this.eventTickets.EventId;
        if (ticketData.Tickets.length > 0) {

          ticketData.AccessPromoCodeId = this.promoCodeCheckResponse?.PromoCodeId;

          this._checkoutService.postTickets(ticketData).subscribe((result) => {
            if (!result) {
              this.globalService.showToast('Please select tickets first :)', 'error-message');
            }
            if (result.TicketsAvailable) {
              if (this.CheckoutAllowInPopup) {
                eventDetails.TicketLockResponse = result;
                eventDetails.KmaEventId = this.kmaEventId;
                this.parentDialog = this.dialog.open(CheckoutPageModalComponent, {
                  data: eventDetails,
                  width: '900px',
                  hasBackdrop: false,
                  panelClass: 'iframe-checkout-popup',
                  scrollStrategy: new NoopScrollStrategy()
                });
                this.parentDialog.afterClosed().subscribe(result => {
                  if (result) {
                  }
                });
              } else {
                window.parent.location.href = environment.domainUrl + '/TicketPurchase/Checkout?lockId=' + result.LockId + '&webreferralId=0&iframe=false&kmaEventId=' + this.kmaEventId;
              }
            } else {
              this.globalService.showToast('Ticket is not available :)', 'error-message');
            }
          });
        }
        else
          this.globalService.showToast('Please select tickets first :)', 'error-message',);
      });
    }
  }

  openViewAgenda(TicketId) {
    if (this.eventTickets.EditMode)
      return;
      this.websiteDetails.TickerId = TicketId;
      const dialogRef = this.dialog.open(ViewAgendaModalComponent, {
        data: this.websiteDetails,
        width: '800px',
        scrollStrategy: new NoopScrollStrategy()
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
        }
      });
  }

  applyPromoCodeDiscountOnTicket(promo: any, tt: TicketInfoViewModel) {
    if (promo.Percents > 0) {
      let total = tt.Quantity * tt.Price;
      tt.GrossTotal = tt.Quantity * (tt.SourcePrice);
      tt.TotalPrice = Number((total).toFixed(2));
    } else if (promo.Amount > 0) {
      let total = tt.Quantity * tt.Price;
      tt.GrossTotal = tt.Quantity * (tt.SourcePrice);
      tt.TotalPrice = Number((total).toFixed(2));
    } else if (promo.IsOrderFree) {
      tt.TotalPrice = 0;
      tt.GrossTotal = tt.SourcePrice * tt.Quantity;
    }
    else {
      tt.TotalPrice = tt.Price;
      tt.GrossTotal = tt.TotalPrice;
    }
  }
  getStyleString(fieldName: SectionPropertyModel) {
    return this.globalService.getStyleString(fieldName);
  }
  getSectionStyleString(sectionName) {
    return this.globalService.getSectionStyleString(sectionName);
  }
  getBannerSectionStyleString(sectionName) {
    return this.globalService.getBannerSectionStyleString(sectionName);
  }
  ChangeDetect(event,section, ChangeType: any = 'Section') {
    this.ngStyle = this.globalService.changeDetected(event, section, this.ngStyle, this.cd, ChangeType);
    this.cd.detectChanges();
  }
}