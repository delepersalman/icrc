import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventmakerPageModel, EventSpeakerModel, EventSpeakers } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';

@Component({
  selector: 'event-speakers',
  templateUrl: './event-speakers.component.html',
  styleUrls: ['./event-speakers.component.scss']
})
export class EventSpeakersComponent implements OnInit {
  @Input() eventId;
  eventSpeaker: EventSpeakers = new EventSpeakers();
  @Input() isFullPage: boolean;
  @Input() eventCustomPages:EventmakerPageModel;
  componentName:string;
  @Input() themeName:string;
  @Input() websiteDetails: any;
  constructor(private eventmakerService: EventMakerService) { }

  ngOnInit(): void {
    if(this.eventId)
    this.getEventSpeakers();
    this.componentName = `theme${this.themeName}-event-speakers`;
  }
  getModuleLoader() {
    return () =>
    import("../eventmaker.module").then(m => m.EventmakerModule);
  }

  getEventSpeakers() {
    this.eventmakerService.getEventSpeaker(this.eventId).subscribe(res => {
      if (res && this.websiteDetails)
        this.eventSpeaker.eventSpeakers = res;
        this.eventSpeaker = this.eventmakerService.MapComponentBaseData<EventSpeakers>(this.eventSpeaker,this.eventCustomPages, this.websiteDetails.FontList);    
        this.eventSpeaker.EventId= this.eventId;
    })
  }

}
