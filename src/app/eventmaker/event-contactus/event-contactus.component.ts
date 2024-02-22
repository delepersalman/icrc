import { ChangeDetectorRef, Component, Input, OnInit, QueryList, ViewChildren, ViewContainerRef } from '@angular/core';
import { ContactUsModalComponent } from '../contact-us-modal/contact-us-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { EventDescriptionModel, EventIntroModel, EventmakerPageModel, EventmakerSectionModel, ngStyleModel, SectionPropertyModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { environment } from 'src/environments/environment';
import { GlobalService } from 'src/app/shared/services/global-service';
import { NoopScrollStrategy } from '@angular/cdk/overlay';

@Component({
  selector: 'event-contactus',
  templateUrl: './event-contactus.component.html',
  styleUrls: ['./event-contactus.component.scss']
})
export class EventContactusComponent implements OnInit {
  @Input() eventId;
  @Input() eventCustomPages: EventmakerSectionModel;
  @Input() eventDesc: EventDescriptionModel = new EventDescriptionModel();
  componentName: string;
  @Input() themeName: string;
  @Input() websiteDetails: any;
  constructor(private eventMakerService: EventMakerService) { }



  ngOnInit(): void {
    if (this.eventCustomPages && this.websiteDetails) {
      this.eventDesc = this.eventMakerService.MapComponentBaseData<EventDescriptionModel>(this.eventDesc, this.eventCustomPages, this.websiteDetails.FontList);
      this.eventDesc.EventId = this.eventId;
    }
    this.componentName = `theme${this.themeName}-event-contactus`;
  }
  getModuleLoader() {
    return () =>
      import("../eventmaker.module").then(m => m.EventmakerModule);
  }

}
