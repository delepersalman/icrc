import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventFAQListModel, EventFAQModel, EventmakerPageModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';

@Component({
  selector: 'event-faq',
  templateUrl: './event-faq.component.html',
  styleUrls: ['./event-faq.component.scss']
})
export class EventFaqComponent implements OnInit {
  @Input() eventId;
  @Input() eventCustomPages: EventmakerPageModel;
  eventFAQ: EventFAQListModel = new EventFAQListModel();
  componentName: string;
  @Input() themeName: string;
  @Input() isFullPage: boolean;
  @Input() websiteDetails: any;
  constructor(private eventmakerService: EventMakerService, private router: ActivatedRoute) { }

  ngOnInit(): void {
    this.getEventFAQ();
    this.componentName = `theme${this.themeName}-event-faq`;
  }
  getModuleLoader() {
    return () =>
      import("../eventmaker.module").then(m => m.EventmakerModule);
  }

  getEventFAQ() {
    this.eventmakerService.getEventFAQ(this.eventId).subscribe(res => {
      if (res && this.websiteDetails)
        this.eventFAQ.eventFAQs = res;
      this.eventFAQ = this.eventmakerService.MapComponentBaseData<EventFAQListModel>(this.eventFAQ, this.eventCustomPages, this.websiteDetails.FontList);
    })
  }

}
