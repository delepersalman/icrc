import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import CustomPageModel, { EventmakerPageModel, EventmakerSectionModel, EventWebsiteModel } from 'src/app/shared/models/event-maker/event-maker-model';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ViewEventService } from '../../service/view-event.service';
import { GlobalService } from 'src/app/shared/services/global-service';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
@Component({
  selector: 'edit-privacy-policy',
  templateUrl: './edit-privacy-policy.component.html',
  styleUrls: ['./edit-privacy-policy.component.scss']
})
export class EditPrivacyPolicyComponent implements OnInit {
  @Input() pageData: any
  pageInfo: EventmakerSectionModel
  customPageInfo: CustomPageModel = new CustomPageModel();
  @Output() outputEvent : EventEmitter<any> = new EventEmitter<any>();
  editor: any = ClassicEditor;
  constructor(private _eventmakerService: EventMakerService, private _viewEventService: ViewEventService, private globalService:GlobalService) { }

  ngOnInit(): void {
    if(this.pageData)
    this.pageInfo = this.pageData;
      this.customPageInfo.CustomPageId = this.pageData.PageId;    
      this.customPageInfo.PageTitle = this.pageData.PageTitle; 
      this.customPageInfo.ShowOnHeader = this.pageData.ShowOnHeader; 
      this.customPageInfo.Description = this.pageData.CustomPageData.Description;
      this.customPageInfo.IsSystemModule = this.pageInfo.IsSystemModule;
      this.customPageInfo.EventMakerWebsiteId = this.pageData.eventWebsiteDetail.WebsiteDetailId;
  }
  savePageData() {
    if(!this.customPageInfo.Description){
      this.globalService.showToast("Description is required!", "error-message");
      return false;
    }
    if (this.customPageInfo.ShowOnHeader && this.pageData.eventWebsiteDetail.EventPages.filter(a=>a.ShowOnHeader && a.Selected).length >= 7){
      this.globalService.showToast("Only allowed up to 7 links in header", "error-message");
      return false;
    }
      this._eventmakerService.saveCustomPage(this.customPageInfo).subscribe(res => {  
        this.globalService.showToast("Saved successfully!", "success-message");
        this.outputEvent.emit(true);
        this._viewEventService.getEventWebsiteDetail(this.pageData.eventWebsiteDetail.Event.EventId);     
      })
    //}
  }
  // getEventIntro() {
  //   this.eventWebsiteDetail = this.pageData.eventWebsiteDetail;
  //   this.eventMakerService.getEventIntro(this.eventWebsiteDetail.Event.EventId).subscribe(res => {
  //     if (res)
  //       this.eventIntro = res;
  //       this.eventIntro.ModuleName = this.pageInfo.PageTitle
  //       this.eventIntro.EventID = this.eventWebsiteDetail.Event.EventId;
  //       this.eventIntro.ComponentId = this.pageData.PageId; 
  //       this.eventIntro.ShowOnHeader = this.pageData.ShowOnHeader;
  //       this.eventHashtags.push({name: this.eventIntro.EventType.trim()});
  //       this.eventHashtags.push({name: this.eventIntro.EventCategory.trim()});
  //   })
  // }

}
