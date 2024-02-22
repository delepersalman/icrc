import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { EventDealModel, EventTeamModel, TicketInfoModel, TicketInfoViewModel } from 'src/app/shared/models/event/event-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { EventmakerPageModel, EventmakerSectionModel, EventTicketState, EventWebsiteModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { ViewEventService } from '../service/view-event.service';
import { truncate } from 'fs';
@Component({
  selector: 'event-tickets',
  templateUrl: './event-tickets.component.html',
  styleUrls: ['./event-tickets.component.scss']
})
export class EventTicketsComponent implements OnInit {
  @Input() eventId;
  @Input() isFullPage: boolean;
  @Input() IsEventExpired: boolean;
  eventTickets: TicketInfoModel = new TicketInfoModel();
  eventDeals: EventDealModel[] = [];
  @Input() eventCustomPages: EventmakerPageModel;
  componentName: string;
  @Input() themeName: string;
  @Input() websiteDetails: any;
  @Input() Discount: any;
  @Input() State: EventTicketState;
  constructor(
    private eventMakerService: EventMakerService,
    private router: ActivatedRoute,
    private globalService: GlobalService) { }

  ngOnInit(): void {
    if (this.eventId && this.websiteDetails) {
      this.getEventDeals();    
        this.getEventTickets();
      this.componentName = `theme${this.themeName}-event-tickets`;
    }
    this.globalService.onPromoCodeChanged.subscribe(s => {
      this.getEventTickets(s);
    });
    this.globalService.onPromoCodeRemoved.subscribe(s => {
      this.getEventTickets(s, true);
    })
  }
  getModuleLoader() {
    return () =>
      import("../eventmaker.module").then(m => m.EventmakerModule);
  }

  getTitle(ngDirectiveName) {
    return (ngDirectiveName == "deal-uber" ? "Add Uber (For Convenience Later and Save Time)" : ngDirectiveName == "deal-lyft" ? "Add Lyft (For Convenience Later and Save Time)" : "Add Parking (Save up to 40% over drive up)");
  }

  getDescription(ngDirectiveName) {
    return (ngDirectiveName == "deal-uber" ? "There is no obligation to pay. You'll be able to select and change your destination and drop-off locations at any time"
      : ngDirectiveName == "deal-lyft" ? "There is no obligation to pay. You'll be able to select and change your destination and drop-off locations at any time"
        : "Bundle ParkWhiz and save money and time on Parking near the event!");
  }

  getEventDeals() {
    this.eventMakerService.getEventDeals(this.eventId).subscribe(res => {
      if (res)
        this.eventDeals = res;
      this.eventDeals.forEach(deal => {
        deal.Description = this.getDescription(deal.ngDirective);
        deal.Title = this.getTitle(deal.ngDirective);
      })
    })
  }

  getEventTickets(promoCode?: string, promoCodeRemoved?: boolean) {
    this.eventTickets.EventId = this.eventId;
    this.eventMakerService.getEventTickets(this.eventId, promoCode,(this.Discount?true:false)).subscribe(res => {
      if (res) {
        if (promoCode) {
          if(this.Discount)
          this.eventTickets.eventTickets = [];
          for (let index = 0; index < res.length; index++) {
            if (!this.eventTickets.eventTickets.filter(a => a.TicketId == res[index].TicketId)[0]) {
              res[index].Quants = [0];
              for (let i = res[index].Minimum; i <= res[index].Maximum; i++)
                  res[index].Quants.push(i);            
                  this.eventTickets.eventTickets.push(res[index]);     
            }else{
              let ticket = this.eventTickets.eventTickets.filter(a => a.TicketId == res[index].TicketId)[0]
              ticket.Price =res[index].Price;
              ticket.SourcePrice =res[index].SourcePrice;
            }
          }
          this.eventTickets.eventTickets.forEach((ticket, key) => {
            ticket.TotalPrice = ticket.Quantity * res.find(f => f.TicketId == ticket.TicketId)?.Price;
            ticket.GrossTotal = ticket.Quantity * res.find(f => f.TicketId == ticket.TicketId)?.SourcePrice;

          });
          this.globalService.setTicketLoadedAfterPromoCodeChanged(true);
          return;
        }

        if (promoCodeRemoved) {
          for (let index = 0; index < this.eventTickets.eventTickets.length; index++) {
            if (!res.filter(a => a.TicketId == this.eventTickets.eventTickets[index].TicketId)[0]) {
              this.eventTickets.eventTickets.splice(index, 1);
            }
          }
          this.eventTickets.eventTickets.forEach((ticket, key) => {
            ticket.TotalPrice = ticket.Quantity * res.find(f => f.TicketId == ticket.TicketId)?.Price;
            ticket.GrossTotal = ticket.Quantity * res.find(f => f.TicketId == ticket.TicketId)?.SourcePrice;
          });
          this.globalService.setTicketLoadedAfterPromoCodeChanged(true);
          return;
        }

        this.eventTickets.eventTickets = res;
        this.eventTickets.eventDeals = this.eventDeals;
        if(this.websiteDetails)
        this.eventTickets = this.eventMakerService.MapComponentBaseData<TicketInfoModel>(this.eventTickets, this.eventCustomPages, this.websiteDetails.FontList);
        this.eventTickets.eventTickets.forEach((ticket, key) => {

          ticket.TotalPrice = 0;
          ticket.StartDate = new Date(ticket.StartDate);
          ticket.Quants = [0];
          for (let i = ticket.Minimum; i <= ticket.Maximum; i++)
            ticket.Quants.push(i);

          ticket.StartDate = this.globalService.setUTC(ticket.StartDate);
          if (!ticket.DisplayDate)
            ticket.StartDateFormatted = "";
          else if (ticket.StartDateText)
            ticket.StartDateFormatted = ticket.StartDateText.slice(1);
          else
            ticket.StartDateFormatted = this.globalService.FormatDateTimeWithWeekday(ticket.StartDate);
        });
      }
    })
  }
}
