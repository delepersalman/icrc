import { Component, Input, OnInit } from '@angular/core';
import CustomPageModel, { EventRefundPolicyDescriptionModel, EventmakerPageModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';

@Component({
  selector: 'refund-policy',
  templateUrl: './event-refund-policy.component.html',
})
export class EventRefundPolicyComponent implements OnInit {
  @Input() eventId;
  @Input() eventCustomPages:EventmakerPageModel;
  @Input() isFullPage: boolean;
  eventPolicyDesc: EventRefundPolicyDescriptionModel = new EventRefundPolicyDescriptionModel();
  componentName:string;
  @Input() themeName:string;
  @Input() websiteDetails: any;
  constructor(private eventMakerService: EventMakerService) { }

  ngOnInit(): void {
    if(this.eventId)
    this.getEventDesc();
    this.componentName = `theme${this.themeName}-event-refund-policy`;
  }
  getModuleLoader() {
    return () =>
    import("../eventmaker.module").then(m => m.EventmakerModule);
  }

  getEventDesc() {
    this.eventMakerService.getEventRefundPolicy(this.eventId).subscribe(res => {
      if (res && this.websiteDetails){
      this.eventPolicyDesc = this.eventMakerService.MapComponentBaseData<EventRefundPolicyDescriptionModel>(this.eventPolicyDesc,this.eventCustomPages,this.websiteDetails.FontList);
      this.eventPolicyDesc.EventPolicyDescription = res.EventPolicyDescription;    
      } 
    });
  }

}
