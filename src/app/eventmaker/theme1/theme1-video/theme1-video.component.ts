import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, QueryList, Renderer2, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CustomPageSesstionModel, ngStyleModel, SectionPropertyModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';
import Player from '@vimeo/player';
@Component({
  selector: 'theme1-video',
  templateUrl: './theme1-video.component.html',
  styleUrls: ['./theme1-video.component.scss']
})
export class Theme1VideoComponent implements OnInit {
  @Input() customModel: CustomPageSesstionModel = new CustomPageSesstionModel();
  @ViewChild('playerContainer') playerContainer: ElementRef;
  ngStyle: ngStyleModel = new ngStyleModel();
  public dataModel: CustomPageSesstionModel;
  @Input() IsEditMode: boolean
  @ViewChildren('appendItem', { read: ViewContainerRef })
  public dynComponents: QueryList<ViewContainerRef>;
  domainUrl: string;
  expanded = false;
  videoUrl: string;
  VideoSource: string;
  constructor(private globalService: GlobalService, protected _sanitizer: DomSanitizer, private renderer: Renderer2,
    private cd: ChangeDetectorRef) { }


  ngOnInit(): void {
    this.renderer.listen('window', 'click', (e: any) => {
      this.globalService.clearToolBar(this.dynComponents, e);
      });
    this.domainUrl = environment.domainUrl;
  }
  ngDoCheck() {
    this.dataModel = this.customModel;
    this.ngStyle.sectionTextColor =  this.dataModel.ModuleTextColor;
    this.ngStyle.sectionBgColor = this.dataModel.ModuleBGColor;
    this.ngStyle.SectionPadding = this.dataModel.SectionPadding;
    this.dataModel.ModuleBGColor = this.dataModel.eventCustomPages.BGColor;
    this.dataModel.ModuleTextColor = this.dataModel.eventCustomPages.TextColor;
    this.dataModel.SectionBorder = this.dataModel.eventCustomPages.SectionBorder;
    this.dataModel.SectionPadding = this.dataModel.eventCustomPages.SectionPadding;
    this.dataModel.BGImage = this.dataModel.eventCustomPages.BGImage;
    this.dataModel.ModuleBGImageId = this.dataModel.eventCustomPages.BGImageId;
    if (this.dataModel.eventCustomPages.CustomPageData.VideoUrl) {

      if (this.dataModel.eventCustomPages.CustomPageData.VideoUrl.includes("vimeo")) {
        this.VideoSource = "vimeo";
        if (this.playerContainer) {
          //this.videoUrl = this.dataModel.eventCustomPages.CustomPageData.VideoUrl + "&output=embed";;        
          const player = new Player(this.playerContainer?.nativeElement, { url: this.dataModel.eventCustomPages.CustomPageData.VideoUrl, innerWidth:'1140px'});
        } 
      }else {
        let existingEle = document.getElementById('iframe_api');
        if (!existingEle) {
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          tag.id = "iframe_api";
          document.body.appendChild(tag);
        }
        this.VideoSource = "youtube";
        this.videoUrl = this.globalService.parseYouTube(this.dataModel.eventCustomPages.CustomPageData.VideoUrl);
      }
    }
  }
  
  showHideToolbar(event: any, prop: SectionPropertyModel) {
    prop.IsEditable = false;
    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if (vcr.element.nativeElement == event.target) {
          this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.customModel);
          prop.expanded = true;
        }
      })

  }
  safeURL(url) {
    return this._sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  showHideButtonToolbar(event: any, prop: SectionPropertyModel) {
    this.globalService.showHideButtonToolbar(event, prop, this.ngStyle);
  }
  changeAlignment(event) {
    this.globalService.changeAlignment(event, this.dataModel, this.ngStyle);
    this.cd.detectChanges();
    this.ngStyle =  new ngStyleModel();
  }

    ChangeDetect(event, section) {
    this.ngStyle = this.globalService.changeDetected(event, this.dataModel, this.ngStyle, this.cd);
    this.ngStyle.SectionName = "video";
    this.cd.detectChanges();
  }
  getId(title: string) {
    if (title)
      return title.replace(/ /g, '').toLowerCase();
  }
  getStyleString(fieldName: SectionPropertyModel) {
    return this.globalService.getStyleString(fieldName);
  }
  getSectionStyleString(sectionName) {
    return this.globalService.getSectionStyleString(sectionName);
  }
}
