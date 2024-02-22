import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventDescriptionModel, EventWebsiteModel, EventmakerPageModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { GlobalConstants } from '../globals';

@Component({
  selector: 'event-organiser',
  templateUrl: './event-organiser.component.html',
  styleUrls: ['./event-organiser.component.scss']
})
export class EventOrganiserComponent implements OnInit {
  @Input() eventId;
  @Input() eventCustomPages:EventmakerPageModel;
  @Input() themeName:string;
  @Input() isFullPage: boolean;
  @Input() websiteDetails: EventWebsiteModel;
  eventDesc: EventDescriptionModel = new EventDescriptionModel();
  componentName:string;
  constructor(private eventMakerService: EventMakerService) { }

  ngOnInit(): void {
    this.getEventDesc();
    this.componentName = `theme${this.themeName}-event-organiser`;
  }
  getModuleLoader() {
    return () =>
    import("../eventmaker.module").then(m => m.EventmakerModule);
  }

  getEventDesc() {
    if(this.eventId){
    this.eventMakerService.getEventDescription(this.eventId).subscribe(res => {
      if (res && this.websiteDetails)
        this.eventDesc = res;
        this.eventDesc.EventID = this.eventId;
        this.eventDesc = this.eventMakerService.MapComponentBaseData<EventDescriptionModel>(this.eventDesc,this.eventCustomPages, this.websiteDetails.FontList);    
    })
  }
  }

}
