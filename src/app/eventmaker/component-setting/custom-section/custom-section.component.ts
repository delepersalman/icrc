import { Component, OnInit, EventEmitter, Output, Input, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { GlobalService } from 'src/app/shared/services/global-service';

@Component({
  selector: 'app-custom-section',
  templateUrl: './custom-section.component.html',
  styleUrls: ['./custom-section.component.scss']
})
export class CustomSectionComponent implements OnInit {
  SectionName: string
  @Output() saveEvent = new EventEmitter();
  constructor(private _eventmakerService: EventMakerService, private globalService: GlobalService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }

  saveSectionName() {
    if (this.SectionName) {
      const regex: RegExp = /[a-zA-Z]/g;
      if(!this.SectionName.match(regex)){
        this.globalService.showToast("Section name must contain at least one alphabet.", "error-message");
        return;
      }
      let customData = {
        PageTitle: this.SectionName,
        EventMakerWebsitePageId: this.data.EventMakerWebsitePageId,
        EventId: this.data.EventId,
        EventMakerWebsiteId: this.data.EventMakerWebsiteId
      }
      this.globalService.showLoader(true);
      this._eventmakerService.saveCustomPage(customData).subscribe(res => {
        this.globalService.showToast("Saved successfully!", "success-message");
        this.saveEvent.emit(res);
      });
    } else {
      this.globalService.showToast("Section Name is required!", "error-message");
    }
  }
}
