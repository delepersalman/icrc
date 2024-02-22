import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventIntroModel, EventTicketState, EventmakerPageModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { GlobalService } from 'src/app/shared/services/global-service';
import { ViewEncapsulation } from '@angular/core';
@Component({
  selector: 'event-intro',
  templateUrl: './event-intro.component.html',
  styleUrls: ['./event-intro.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EventIntroComponent implements OnInit {
  @Input() eventId;
  @Input() eventCustomPages: EventmakerPageModel;
  @Output() outputEvent: EventEmitter<any> = new EventEmitter<any>();
  @Input() themeName: string;
  @Input() bookTicketUrl: any;
  @Input() websiteDetails: any;
  @Input() isFullPage: boolean;
  @Input() State: EventTicketState;
  constructor(private eventMakerService: EventMakerService, private globalService: GlobalService) { }
  eventIntro: EventIntroModel = new EventIntroModel();
  componentName: string;
  ngOnInit(): void {
    this.getEventIntro();
    this.componentName = `theme${this.themeName}-event-intro`;
  }


  getEventIntro() {
    this.eventMakerService.getEventIntro(this.eventId).subscribe(res => {
      if (res && this.websiteDetails)
        this.eventIntro = res;
      this.eventIntro.EventID = this.eventId;
      this.eventIntro = this.eventMakerService.MapComponentBaseData<EventIntroModel>(this.eventIntro, this.eventCustomPages, this.websiteDetails.FontList);
      this.eventIntro.DateInfo.StartDateTime = this.globalService.setUTC(this.eventIntro.DateInfo.StartDateTime);
      this.eventIntro.DateInfo.NextDateTime = this.globalService.setUTC(this.eventIntro.DateInfo.NextDateTime);
      this.eventIntro.DateInfo.EndDateTime = this.globalService.setUTC(this.eventIntro.DateInfo.EndDateTime);
    })
  }
  synchvalue(event) {
    if (!event.AlreadyProcessed && event.Type == 'fav') {
      this.eventMakerService.getEventFavorite(this.eventId).subscribe(res => {
      });
    }
    if (!event.AlreadyProcessed && event.Type == 'lik') {
      this.eventMakerService.getEventVotes(this.eventId).subscribe(res => {
      });
    }
  }
  getModuleLoader() {
    return () =>
      import("../eventmaker.module").then(m => m.EventmakerModule);
  }
}
