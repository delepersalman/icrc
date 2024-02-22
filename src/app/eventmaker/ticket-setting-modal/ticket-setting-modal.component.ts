import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventmakerPageModel, EventmakerSectionModel, EventWebsiteModel, SectionPropertyModel, SectionPropertyRequestModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { GlobalService } from 'src/app/shared/services/global-service';
import { AddNewPageComponent } from '../custom-page/add-new-page/add-new-page.component';

export interface Section {
  name: string;
  src: string;
  active: boolean;
}

export interface Hashtags {
  name: string;
}

@Component({
  selector: 'app-ticket-setting-modal',
  templateUrl: './ticket-setting-modal.component.html',
  styleUrls: ['./ticket-setting-modal.component.scss']
})
export class TicketSettingModalComponent implements OnInit {
  @Output() outputEvent: EventEmitter<any> = new EventEmitter<any>();
  dialogTitle: string;
  eventWebsiteDetail: EventWebsiteModel = new EventWebsiteModel();
  pageInfo: any
  constructor(
    private _eventmakerService: EventMakerService,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private globalService: GlobalService) { }
  sectionProperties: SectionPropertyModel[] = [];
  allowPopup: SectionPropertyModel = new SectionPropertyModel();
  selectedComponents: number[] = [];
  requestModel: SectionPropertyRequestModel = new SectionPropertyRequestModel();
  allChecked = false;
  allowChecked = false;
  ticketId: any = 0;
  getSetionProperties() {
    let IsCustomizationEnabledForData = 0;
    if (this.data.ModuleName === "event-tickets")
      IsCustomizationEnabledForData = 1;
    else if (this.data.ModuleName === "checkout-attendee")
      IsCustomizationEnabledForData = 2;
      else if (this.data.ModuleName === "event-agenda")
      IsCustomizationEnabledForData = 3;
    this._eventmakerService.getSetionProperties(this.pageInfo.PageId, false, this.eventWebsiteDetail.WebsiteDetailId, this.ticketId, IsCustomizationEnabledForData).subscribe(res => {
      if (res)
        this.sectionProperties = res;
      this.requestModel.CustomPageId = this.pageInfo.PageId;
      this.requestModel.EventId = this.pageInfo.EventId;
      this.selectedComponents = this.pageInfo.EventmakerPagePropertyDesigns.filter(a => a.DataFieldId === this.ticketId).map(a => a.EventmakerPagePropertyId);
      if (this.isAllChecked()) {
        this.allChecked = true;
      }
      else {
        this.allChecked = false;
      }
      if (res.length > 0)
        this.requestModel.EventmakerWebsiteComponentId = res[0].EventmakerWebsiteComponentId;
    });

  }
  checked(item, list, allowpo = undefined) {
    var idx = list.indexOf(item);
    if (idx > -1) {
      list.splice(idx, 1);
      if (!allowpo)
        this.allChecked = false
    }
    else {
      list.push(item);
      if (this.isAllChecked()) {
        if (!allowpo)
          this.allChecked = true;
      }
    }
  };
  exists(item, list) {

    return list.indexOf(item) > -1;
  };
  setAll(checked: boolean) {
    this.allChecked = checked == false ? true : false;
    if (this.sectionProperties == null) {
      return;
    }
    if (!checked) {
      this.selectedComponents = [];
      this.sectionProperties.forEach(t => {
        if (this.selectedComponents.indexOf(t.EventmakerPagePropertyId)! - 1)
          this.selectedComponents.push(t.EventmakerPagePropertyId);
      });
    } else {
      this.selectedComponents = [];
    }
  }
  isAllChecked() {
    let isChecked = true;
    this.sectionProperties.forEach(t => {
      if (this.selectedComponents.indexOf(t.EventmakerPagePropertyId) == -1)
        if (isChecked) {
          isChecked = false;
          return;
        }
    });
    return isChecked;
  }
  saveSectionData() {
    this.requestModel.SelectedPropertiess = this.selectedComponents;
    this.globalService.showLoader(true);
    this.requestModel.TicketId = this.ticketId;
    this.requestModel.EventId = this.data.eventWebsiteDetail.Event.EventId;
    this._eventmakerService.saveSectionData(this.requestModel).subscribe(res => {
      this.globalService.showToast("Saved successfully!", "success-message");
      this.outputEvent.emit(true);
    });
  }
  ngOnInit(): void {
    if (this.data) {
      this.ticketId = this.data.data
      this.eventWebsiteDetail = this.data.eventWebsiteDetail,
        this.eventWebsiteDetail.EventPages.forEach(webPage => {
          if (!this.pageInfo)
            this.pageInfo = webPage.PageSections.filter(y => y.PageSystemName == this.data.ModuleName)[0];
        });

      this.getSetionProperties();
    }
  }

}
