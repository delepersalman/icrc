import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventDescriptionModel, EventWebsiteModel, EventmakerPageModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { GlobalConstants } from '../globals';

@Component({
  selector: 'event-description',
  templateUrl: './event-description.component.html',
  styleUrls: ['./event-description.component.scss']
})
export class EventDescriptionComponent implements OnInit {
  @Input() eventId;
  @Input() eventCustomPages:EventmakerPageModel;
  @Input() websiteDetails: EventWebsiteModel;
  eventDesc: EventDescriptionModel = new EventDescriptionModel();
  componentName:string;
  @Input() themeName:string;
  @Input() isFullPage:boolean = true;;
  constructor(private eventMakerService: EventMakerService, private router: ActivatedRoute) { }

  ngOnInit(): void {
    if(this.eventId)
    this.getEventDesc();
    this.componentName = `theme${this.themeName}-event-description`;
  }
  getModuleLoader() {
    return () =>
    import("../eventmaker.module").then(m => m.EventmakerModule);
  }

  getEventDesc() {
    this.eventMakerService.getEventDescription(this.eventId).subscribe(res => {
      if (res && this.websiteDetails)
        this.eventDesc = res;
        this.eventDesc = this.eventMakerService.MapComponentBaseData<EventDescriptionModel>(this.eventDesc,this.eventCustomPages, this.websiteDetails.FontList);    
    })
  }

}
