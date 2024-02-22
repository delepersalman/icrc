import { Component, Input, EventEmitter, OnInit, Output } from '@angular/core';
import { EventCheckoutSettingModel, EventmakerPageModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { GlobalService } from 'src/app/shared/services/global-service';

@Component({
  selector: 'confirmation-section',
  templateUrl: './confirmation-section.component.html',
  styleUrls: ['./confirmation-section.component.scss']
})
export class ConfirmationSectionComponent implements OnInit {
  @Input() eventId;
  @Input() eventCustomPages: EventmakerPageModel;
  @Output() outputEvent: EventEmitter<any> = new EventEmitter<any>();
  @Input() themeName: string;
  componentName: string;
  lockid: string;
  @Input() websiteDetails: any;
  constructor(private eventMakerService: EventMakerService, private globalService: GlobalService) { }
  confirmationSection: EventCheckoutSettingModel = new EventCheckoutSettingModel();

  ngOnInit(): void {
    this.componentName = `theme${this.themeName}-confirmation-section`;
    this.getConfirmationData();
  }
  getModuleLoader() {
    return () =>
      import("../eventmaker.module").then(m => m.EventmakerModule);
  }
  getConfirmationData() {
    if(this.websiteDetails)
    this.confirmationSection = this.eventMakerService.MapComponentBaseData<EventCheckoutSettingModel>(this.confirmationSection, this.eventCustomPages, this.websiteDetails.FontList);
  }
}
