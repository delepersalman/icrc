import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventCheckoutSettingModel, EventIntroModel, EventmakerPageModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { GlobalService } from 'src/app/shared/services/global-service';

@Component({
  selector: 'checkout-attendee',
  templateUrl: './checkout-attendee.component.html',
  styleUrls: ['./checkout-attendee.component.scss']
})
export class CheckoutAttendeeComponent implements OnInit {
  @Input() eventId;
  @Input() eventCustomPages: EventmakerPageModel;
  @Output() outputEvent: EventEmitter<any> = new EventEmitter<any>();
  @Input() themeName: string;
  componentName: string;
  componentNamePay: string;
  lockid: string;
  @Input() websiteDetails: any;
  constructor(private eventMakerService: EventMakerService, private globalService: GlobalService, private router: ActivatedRoute) { }
  eventCheckOut: EventCheckoutSettingModel = new EventCheckoutSettingModel();

  ngOnInit(): void {
    this.componentName = `theme${this.themeName}-checkout-attendee`;
    this.getCheckoutData();
    this.router.queryParams.subscribe(par => {
      this.lockid = par["lockId"]
    });
  }
  getModuleLoader() {
    return () =>
      import("../eventmaker.module").then(m => m.EventmakerModule);
  }
  getCheckoutData() {
    this.eventMakerService.getEventPurchaseInfo(this.eventId).subscribe(res => {
      if (res && this.websiteDetails) {
        this.eventCheckOut = res;
        this.eventCheckOut = this.eventMakerService.MapComponentBaseData<EventCheckoutSettingModel>(this.eventCheckOut, this.eventCustomPages, this.websiteDetails.FontList);
        this.eventCheckOut.EventId = this.eventId;
      }
    })
  }
}
