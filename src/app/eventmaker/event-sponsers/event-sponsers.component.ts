import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventmakerPageModel, EventSponsorModel, EventSponsors } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { GlobalConstants } from '../globals';

@Component({
  selector: 'event-sponsors',
  templateUrl: './event-sponsers.component.html',
  styleUrls: ['./event-sponsers.component.scss']
})
export class EventSponsersComponent implements OnInit {
  @Input() eventId;
  eventSponsor: EventSponsors = new EventSponsors();
  @Input() eventCustomPages:EventmakerPageModel;
  @Input() isFullPage: boolean;
  componentName:string;
  @Input() themeName:string;
  @Input() websiteDetails: any;
  constructor(private eventMakerService: EventMakerService, private router: ActivatedRoute) { }

  ngOnInit(): void {   
    if(this.eventId)
    this.getEventSponsor();
    this.componentName = `theme${this.themeName}-event-sponsers`;
  }
  getModuleLoader() {
    return () =>
    import("../eventmaker.module").then(m => m.EventmakerModule);
  }

  getEventSponsor() {
    this.eventMakerService.getEventSponsor(this.eventId).subscribe(res => {
      if (res && this.websiteDetails){
        this.eventSponsor.eventSponsors =res;
        this.eventSponsor = this.eventMakerService.MapComponentBaseData<EventSponsors>(this.eventSponsor,this.eventCustomPages , this.websiteDetails.FontList);    
        this.eventSponsor.EventId= this.eventId;
        } 
    })
  }

}
