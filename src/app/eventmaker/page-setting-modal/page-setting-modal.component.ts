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
  selector: 'app-page-setting-modal',
  templateUrl: './page-setting-modal.component.html',
  styleUrls: ['./page-setting-modal.component.scss']
})
export class PageSettingModalComponent implements OnInit {
  @Output() outputEvent: EventEmitter<any> = new EventEmitter<any>();
  dialogTitle: string;
  eventWebsiteDetail: EventWebsiteModel = new EventWebsiteModel();
  pageInfo: EventmakerSectionModel = new EventmakerSectionModel();
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
    this._eventmakerService.getSetionProperties((this.ticketId === 0 ? this.pageInfo.PageId : this.ticketId), false, this.eventWebsiteDetail.WebsiteDetailId, this.ticketId).subscribe(res => {
      if (res) {
        if (this.eventWebsiteDetail && this.eventWebsiteDetail.WebsiteType === 'Single') {
          this.sectionProperties = res.filter(a => a.Name !== "SectionHeading" && a.Name !== "SectionBanner" && a.Name !== 'SeeAllSpeakerBTN' && a.Name !== 'SeeAllSponsorBTN' && a.Name !== 'SeeAllAgendaBTN');
        } else {
          if(res && res.filter(a=>a.Name === "OrganiserBox")[0]){
            this.sectionProperties = res.filter(a => a.Name !== "OrganizedBy");
          }else{
            this.sectionProperties = res;
          }
          
        }
        this.allowPopup = this.sectionProperties.filter(x => x.Name === 'AllowCheckoutinPopup')[0];
        this.requestModel.ShowOnHeader = this.pageInfo.ShowOnHeader;
        this.requestModel.CustomPageId = this.pageInfo.PageId;
        this.requestModel.EventId = this.pageInfo.EventId;
        this.selectedComponents = this.pageInfo.EventmakerPagePropertyDesigns.map(a => a.EventmakerPagePropertyId);
        if (this.allowPopup)
          this.allowChecked = this.selectedComponents.filter(x => x == this.allowPopup.EventmakerPagePropertyId)[0] ? true : false;
        this.pageInfo.EventmakerPagePropertyDesigns.filter(a => a.SiblingList.length > 0).forEach(a => {
          a.SiblingList.forEach(x => {
            if (this.pageInfo.PageSystemName !== "event-header" && this.pageInfo.PageSystemName !== "event-footer") {
              this.selectedComponents.push(x.EventmakerPagePropertyId);
            }
          });
        });
        if (this.isAllChecked()) {
          this.allChecked = true;
        }
        else {
          this.allChecked = false;
        }
        if (res.length > 0)
          this.requestModel.EventmakerWebsiteComponentId = res[0].EventmakerWebsiteComponentId; 2
      }
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
    if (this.allowPopup)
      this.allowChecked = this.selectedComponents.filter(x => x == this.allowPopup.EventmakerPagePropertyId)[0] ? true : false;
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
    let selectCompo = [];
    this.sectionProperties.forEach(t => {
      if (this.selectedComponents.indexOf(t.EventmakerPagePropertyId) > -1)
        selectCompo.push(t.EventmakerPagePropertyId);
    });
    this.requestModel.SelectedPropertiess = selectCompo;
    if (this.pageInfo.PageSystemName == 'event-header')
      if (this.selectedComponents.length > 7) {
        this.globalService.showToast("Only allowed up to 7 links in header", "error-message");
        return false;
      }
    this.globalService.showLoader(true);
    this.requestModel.EventId = this.data.eventWebsiteDetail.Event.EventId;
    this._eventmakerService.saveSectionData(this.requestModel).subscribe(res => {
      this.globalService.showToast("Saved successfully!", "success-message");
      this.outputEvent.emit(true);
    });
  }
  ngOnInit(): void {
    if (this.data) {
      if (this.data.Type === 'TicketBox') {
        this.ticketId = this.data.data
        this.eventWebsiteDetail = this.data.eventWebsiteDetail
      } else {
        this.pageInfo = this.data.data;
        if (this.pageInfo)
          this.eventWebsiteDetail = this.data.eventWebsiteDetail;
      }
      this.getSetionProperties();
    }
  }

}
