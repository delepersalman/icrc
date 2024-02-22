import { Component, Input, OnInit, QueryList, ViewChildren, ViewContainerRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import CustomPageModel, { CustomPageSesstionModel, EventmakerSectionModel, ngStyleModel, SectionPropertyModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'event-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {
  @Input() eventCustomPages: EventmakerSectionModel;
  ngStyle:ngStyleModel = new ngStyleModel();
  @Input() IsEditMode:boolean;
  @Input() isFullPage: boolean;
  @Input() themeName:string;
  @Input() websiteDetails: any;
  customModel: CustomPageSesstionModel = new CustomPageSesstionModel();
  componentName:string;
  constructor(private globalService: GlobalService, protected _sanitizer: DomSanitizer) { }

  ngOnInit(): void {
      this.customModel.eventCustomPages = this.eventCustomPages;
      if (!this.customModel.eventCustomPages.CustomPageData)
        this.customModel.eventCustomPages.CustomPageData = new CustomPageModel();    
      this.customModel.EditMode = this.IsEditMode
      this.customModel.SectionProperties = this.eventCustomPages.EventmakerPagePropertyDesigns
      if(this.customModel.SectionProperties)  
      this.customModel.ComponentId = this.eventCustomPages.PageId;
      this.customModel.ModuleBGColor = this.eventCustomPages.BGColor;
      this.customModel.BGImage = this.eventCustomPages.BGImage;
      this.customModel.ModuleBGImageId = this.eventCustomPages.BGImageId;
      this.customModel.FontStyleList =  this.websiteDetails.FontList
      this.componentName = `theme${this.themeName}-video`;
  }
  getModuleLoader() {
    return () =>
    import("../eventmaker.module").then(m => m.EventmakerModule);
  }

}
