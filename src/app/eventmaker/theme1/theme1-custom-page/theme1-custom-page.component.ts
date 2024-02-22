import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, QueryList, Renderer2, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import CustomPageModel, { CustomPageSesstionModel, EventmakerSectionModel, SectionPropertyModel, ngStyleModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';
import Player from '@vimeo/player';
@Component({
  selector: 'theme1-custom-page',
  templateUrl: './theme1-custom-page.component.html',
  styleUrls: ['./theme1-custom-page.component.scss']
})
export class Theme1CustomPageComponent implements OnInit {
  @Input() eventCustomPages: EventmakerSectionModel;
  ngStyle:ngStyleModel = new ngStyleModel();
  @Input() IsEditMode:boolean;
  buttonProp:SectionPropertyModel= new SectionPropertyModel();
  customModel: CustomPageSesstionModel = new CustomPageSesstionModel();
  @ViewChildren('appendItem', { read: ViewContainerRef })
  public dynComponents: QueryList<ViewContainerRef>;
  @ViewChild('playerContainer') playerContainer: ElementRef;
  expanded = false;
  domainUrl:string;
  videoUrl:string;
  VideoSource: string;
  @Input() websiteDetails: any;
  constructor(private globalService: GlobalService, protected _sanitizer: DomSanitizer, private cd: ChangeDetectorRef,  private renderer: Renderer2) { }

  ngOnInit(): void {
    this.renderer.listen('window', 'click', (e: any) => {
      this.globalService.clearToolBar(this.dynComponents, e);
    });
      this.customModel.eventCustomPages = this.eventCustomPages;
      if (!this.customModel.eventCustomPages.CustomPageData)
        this.customModel.eventCustomPages.CustomPageData = new CustomPageModel();
      this.domainUrl = environment.domainUrl;
      this.customModel.EditMode = this.IsEditMode
      this.customModel.SectionProperties = this.eventCustomPages.EventmakerPagePropertyDesigns
      if(this.customModel.SectionProperties)
      this.buttonProp = this.customModel.SectionProperties.filter(a => a.Name == 'Button')[0];
      this.customModel.ComponentId = this.eventCustomPages.PageId;
      this.customModel.ModuleBGColor = this.eventCustomPages.BGColor;
      this.customModel.ModuleTextColor = this.eventCustomPages.TextColor;
      this.customModel.SectionBorder = this.eventCustomPages.SectionBorder;
      this.customModel.SectionPadding = this.eventCustomPages.SectionPadding;
      this.customModel.BGImage = this.eventCustomPages.BGImage;
      this.customModel.ModuleBGImageId = this.eventCustomPages.BGImageId;
      this.customModel.FontStyleList = this.websiteDetails.FontList;
  }
  ngDoCheck(){
    if (this.customModel.eventCustomPages.CustomPageData.VideoUrl) {
      if (this.customModel.eventCustomPages.CustomPageData.VideoUrl.includes("vimeo")) {
        this.VideoSource = "vimeo";
        if (this.playerContainer) {
          //this.videoUrl = this.dataModel.eventCustomPages.CustomPageData.VideoUrl + "&output=embed";;        
          const player = new Player(this.playerContainer?.nativeElement, { url: this.customModel.eventCustomPages.CustomPageData.VideoUrl },);
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
        this.videoUrl = this.globalService.parseYouTube(this.customModel.eventCustomPages.CustomPageData.VideoUrl);
      }
    }
    this.ngStyle.sectionTextColor =  this.customModel.ModuleTextColor;
    this.ngStyle.sectionBgColor = this.customModel.ModuleBGColor;
    this.ngStyle.SectionBorder =   this.customModel.SectionBorder;
    this.ngStyle.SectionPadding =   this.customModel.SectionPadding;
    this.customModel.ModuleBGColor = this.eventCustomPages.BGColor;
    this.customModel.ModuleTextColor = this.eventCustomPages.TextColor;
    this.customModel.SectionBorder = this.eventCustomPages.SectionBorder;
    this.customModel.SectionPadding = this.eventCustomPages.SectionPadding;
    this.customModel.BGImage = this.eventCustomPages.BGImage;
    this.customModel.ModuleBGImageId = this.eventCustomPages.BGImageId;
    this.customModel.FontStyleList = this.websiteDetails.FontList;
  }
  showHideToolbar(event:any,prop:SectionPropertyModel){ 
    prop.IsEditable=false;   
     this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if(vcr.element.nativeElement.innerText == event.target.innerText){
        this.globalService.showHideToolbar(event,prop,this.ngStyle, vcr, this.customModel);
        prop.expanded = true;
        }
      })
   
  }
  safeURL(url){
    return this._sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  showHideButtonToolbar(event:any, prop:SectionPropertyModel){  
    this.customModel.EditMode = this.IsEditMode;
    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if(vcr.element.nativeElement == event.target){
        this.globalService.showHideToolbar(event,prop,this.ngStyle, vcr, this.customModel, true);
        prop.expanded = true;
        }
      })
   }
  changeAlignment(event){
    this.globalService.changeAlignment(event, this.customModel, this.ngStyle);
    this.ngStyle = new ngStyleModel();
  }
  getId(title: string) {
    if(title)
    return title.replace(/ /g, '').toLowerCase();
  }
  ChangeDetect(event, section) {
    this.ngStyle = this.globalService.changeDetected(event, section, this.ngStyle, this.cd);
    this.ngStyle.SectionName = "custom";
    this.cd.detectChanges();
  }
  getStyleString(fieldName: SectionPropertyModel) {
    return this.globalService.getStyleString(fieldName);
  }
  getSectionStyleString(sectionName) {
    return this.globalService.getSectionStyleString(sectionName);
  }
}
