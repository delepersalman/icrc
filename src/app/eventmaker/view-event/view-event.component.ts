import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ECImageViewModel } from 'src/app/shared/models/ec-image-model';
import { EventmakerPageModel, EventmakerSectionModel, EventWebsiteModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { ViewEventService } from '../service/view-event.service';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-view-event',
  templateUrl: './view-event.component.html',
  styleUrls: ['./view-event.component.scss']
})
export class ViewEventComponent implements OnInit, OnDestroy {
  @Input() eventWebsiteDetail: EventWebsiteModel = new EventWebsiteModel();
  @Input() IsEditMode:boolean
  subscription: Subscription;
  logoImages: ECImageViewModel[] = [];
  eventSelectedpages: EventmakerSectionModel[] = [];
  EventPage: EventmakerPageModel;
  customStyle: any;
  favIcon:ECImageViewModel[]=[];
  path:string;
  constructor(private _viewEventService: ViewEventService, private _router: ActivatedRoute, private _globalService: GlobalService) {
    this._router.params.subscribe(params =>
      this.eventWebsiteDetail.Event.EventId = params['eventId']);
      this._router.url.subscribe(res=>{       
        this.path =  res[0].path;
      })  
  }

  
getWebsitedetails(){
  this.favIcon =[];
  this._viewEventService.getEventWebsiteDetail(this.eventWebsiteDetail.Event.EventId);
    this.subscription = this._viewEventService.eventWebsiteDetailChange.subscribe(eventDetails => {
      this.logoImages = [];
      this.eventWebsiteDetail = eventDetails;
      this.EventPage = eventDetails.EventPages.filter(x=>x.PageSystemName.toLowerCase() == this.path.toLowerCase())[0];
      this.eventSelectedpages =this.EventPage.PageSections.filter(x=>x.Selected);
      if (this.eventWebsiteDetail.LogoDetails.Image)
        this.logoImages.push(this.eventWebsiteDetail.LogoDetails.Image);
      if (this.eventWebsiteDetail.Favicon)
        this.favIcon.push(this.eventWebsiteDetail.Favicon);
        this._globalService.changeFaviconDetails(this.eventWebsiteDetail.Favicon);
    })
}

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.getWebsitedetails();
  }
}
