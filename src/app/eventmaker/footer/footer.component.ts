import { Component, Input, OnInit } from '@angular/core';
import { EventFooter } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';

@Component({
  selector: 'event-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
@Input() themeName: string;
componentName: string;
@Input() eventCustomPages: any;
@Input() isFullPage: boolean;
@Input() websiteDetails: any;
eventFooter: EventFooter = new EventFooter();
  constructor(private eventmakerService: EventMakerService) {

  }

  ngOnInit(): void {
    this.componentName = "theme" + this.themeName + "-event-footer";  
    if(this.eventCustomPages && this.websiteDetails){
    this.eventFooter = this.eventmakerService.MapComponentBaseData<EventFooter>(this.eventFooter,this.eventCustomPages, this.websiteDetails.FontList);    
    this.eventFooter.EventId = this.websiteDetails.Event.EventId
    }
  }
  getModuleLoader() {
    return () =>
      import("../eventmaker.module").then(m => m.EventmakerModule);
  }
}
