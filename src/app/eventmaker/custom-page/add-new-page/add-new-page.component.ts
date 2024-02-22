import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ECImageViewModel } from 'src/app/shared/models/ec-image/ec-image-model';
import CustomPageModel, { CustomPageLinkButtons, EventmakerPageModel, SectionPropertyModel, SectionPropertyRequestModel, UploadType } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { GlobalService } from 'src/app/shared/services/global-service';
import { ViewEventService } from '../../service/view-event.service';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
export interface Section {
  name: string;
  src: string;
  active: boolean;
}
@Component({
  selector: 'add-new-page',
  templateUrl: './add-new-page.component.html',
  styleUrls: ['./add-new-page.component.scss']
})
export class AddNewPageComponent implements OnInit {
  pageInfo: EventmakerPageModel
  customPageInfo: CustomPageModel = new CustomPageModel();
  addNewPageForm: FormGroup;
  @Output() outputEvent: EventEmitter<any> = new EventEmitter<any>();
  editor: any = ClassicEditor;
  sectionProperties: SectionPropertyModel[] = [];
  selectedComponents: number[] = [];
  allChecked = false;
  uploadType: string;
  uploadTypeId: number;
  uploadTypeList: UploadType[] = [{ Name: 'Image', checked: false }, { Name: 'Video', checked: false }];
  uploadVideoUrl: string;
  pageTitle:string;
  constructor(private _eventmakerService: EventMakerService, private _viewEventService: ViewEventService, private globalService: GlobalService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    if (this.data) {
      this.customPageInfo = this.data.CustomPageData != null ? this.data.CustomPageData : new CustomPageModel();
      this.customPageInfo.CustomPageId = this.data.PageId;
      this.customPageInfo.ShowOnHeader = this.data.ShowOnHeader ? true : false;
      this.customPageInfo.IsSystemModule = this.data.IsSystemModule ? true : false;
      this.customPageInfo.EventMakerWebsiteId = this.data.WebsiteDetailId;
      this.customPageInfo.EventMakerWebsitePageId = this.data.EventMakerWebsitePageId;
      this.customPageInfo.PageSystemName = this.data.PageSystemName;
      this.customPageInfo.ActionLinkName = this.data.CustomPropertyName;
      this.customPageInfo.CustomSectionName = this.data.CustomSectionName;
      this.customPageInfo.PageTitle = this.data.PageTitle;
      this.pageTitle = this.data.PageTitle;
      this.getSetionProperties();
      if(!this.customPageInfo.ActionLinkTarget){
        this.customPageInfo.ActionLinkTarget = "_blank";
      }
      this.uploadTypeList.forEach(res => {
        if (this.customPageInfo.UploadType === 1) {
          if (res.Name == 'Video') {
            this.uploadType = "Video";
            res.checked = true;
          } else {
            res.checked = false;
          }
        } else {
          if (res.Name == 'Image') {
            this.uploadType = "Image";
            res.checked = true;
          } else {
            res.checked = false;
          }
        }
      });
     
    }
  }
  setRadioValue(value) {
    this.uploadTypeId = value;
  }
  selectImage(images: ECImageViewModel[]) {
    this.customPageInfo.PageImages = images;
  }

  saveCustomPage() {
    if(this.uploadTypeId)
    this.customPageInfo.UploadType = this.uploadTypeId;
    if (this.customPageInfo.VideoUrl) {
      var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
      var regExp1 = /^(http\:\/\/|https\:\/\/)?(www\.)?(vimeo\.com\/)([0-9]+)$/;
      var youtubeMatch = this.customPageInfo.VideoUrl.match(regExp);
      var vimeoMatch = this.customPageInfo.VideoUrl.match(regExp1);
      if (!youtubeMatch && !vimeoMatch ) {
        this.globalService.showToast("Please enter valid youtube/vimeo video url!", "error-message");
        return false;
      }
    }
    if(!this.customPageInfo.PageTitle)
    {
      this.globalService.showToast("Section Name is required.", "error-message");
      return false;
    }
    let testAlphabet = /^[a-zA-Z 0-9]+$/.test(this.customPageInfo.PageTitle);
    if(this.customPageInfo.PageTitle && !testAlphabet)
    {
      this.globalService.showToast("Section Name must contains alphanumeric only.", "error-message");
      return false;
    }
    this.customPageInfo.selectedComponents = this.selectedComponents;
    this.customPageInfo.EventId = this.data.Event.EventId;
    this._eventmakerService.saveCustomPage(this.customPageInfo).subscribe(res => {
      this.globalService.showToast("Saved successfully!", "success-message");
      this.outputEvent.emit(true);
      this._viewEventService.getEventWebsiteDetail(this.data.Event.EventId);
    })
    //}
  }
  getSetionProperties() {
    this._eventmakerService.getSetionProperties(this.customPageInfo.CustomPageId, true, this.customPageInfo.EventMakerWebsiteId).subscribe(res => {
      if (res) {
        this.customPageInfo.EventmakerWebsiteComponentId = res[0].EventmakerWebsiteComponentId;
        this.sectionProperties = res;
        this.selectedComponents = this.data.EventmakerPagePropertyDesigns.map(a => a.EventmakerPagePropertyId);
        if (!this.customPageInfo.Description) {
          this.customPageInfo.Description = "";
        }
      }
    });
  }
  checked(item, list) {
    var idx = list.indexOf(item);
    if (idx > -1) {
      list.splice(idx, 1);
    }
    else {
      list.push(item);
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
  public hasError = (controlName: string, errorName: string) => {
    return this.addNewPageForm.controls[controlName].hasError(errorName);
  }

  createForm() {
    this.addNewPageForm = new FormGroup({
      title: new FormControl('', [Validators.required, Validators.maxLength(60)]),
      Description: new FormControl('', [Validators.required, Validators.maxLength(60)])
    });
  }
}
