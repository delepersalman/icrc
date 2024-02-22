import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventGalleryModel, EventmakerPageModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';

@Component({
  selector: 'event-gallary',
  templateUrl: './event-gallary.component.html',
  styleUrls: ['./event-gallary.component.scss']
})
export class EventGallaryComponent implements OnInit { 
  @Input() eventId;
  @Input() isFullPage: boolean;
  eventGalleryModel: EventGalleryModel = new EventGalleryModel();
  @Input() eventCustomPages:EventmakerPageModel;
  componentName:string;
  @Input() themeName:string;
  @Input() websiteDetails: any;
  constructor(private eventmakerService: EventMakerService, private router: ActivatedRoute) { }

  ngOnInit(): void {
    this.getEventGallery();
    this.componentName = `theme${this.themeName}-event-gallary`;
  }
  getModuleLoader() {
    return () =>
    import("../eventmaker.module").then(m => m.EventmakerModule);
  }

  getEventGallery() {
    this.eventmakerService.getEventGallery(this.eventId).subscribe(res => {
      if (res)
        this.eventGalleryModel.eventGallery = res;
        this.eventGalleryModel = this.eventmakerService.MapComponentBaseData<EventGalleryModel>(this.eventGalleryModel,this.eventCustomPages, this.websiteDetails.FontList);    
    })
  }
}
