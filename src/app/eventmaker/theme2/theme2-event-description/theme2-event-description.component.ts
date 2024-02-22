import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, QueryList, Renderer2, ViewChildren, ViewContainerRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { EventDescriptionModel, EventIntroModel, EventWebsiteModel, ngStyleModel, SectionPropertyModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'theme2-event-description',
  templateUrl: './theme2-event-description.component.html',
  styleUrls: ['./theme2-event-description.component.scss']
})
export class Theme2EventDescriptionComponent implements OnInit {
  @Input() eventDesc: EventDescriptionModel = new EventDescriptionModel();
@Input() isFullPage: boolean = true;
  ngStyle: ngStyleModel = new ngStyleModel();
  domainUrl: string;
  prop: SectionPropertyModel = new SectionPropertyModel();
  image: SectionPropertyModel = new SectionPropertyModel();
  heading: SectionPropertyModel = new SectionPropertyModel();
  sectionHeading: SectionPropertyModel = new SectionPropertyModel();
  introDetails: EventIntroModel;
  eventCountdownPage: any;
  @Input() websiteDetails: EventWebsiteModel;
  @ViewChildren('appendItem', { read: ViewContainerRef })
  public dynComponents: QueryList<ViewContainerRef>;
  expanded = false;
  sectionBanner: any;

  constructor(private globalService: GlobalService, private sanitized: DomSanitizer, private renderer: Renderer2, private eventMakerService: EventMakerService, private cd: ChangeDetectorRef) { }
  drop(event: CdkDragDrop<string[]>) {
    this.globalService.drop(event, this.eventDesc);
  }
  showHideToolbar(event: any, prop: SectionPropertyModel) {
    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if (vcr.element.nativeElement.innerText == event.target.innerText) {
          this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventDesc);
          prop.expanded = true;
        }
      })
  }
  changeAlignment(event) {
    this.globalService.changeAlignment(event, this.eventDesc, this.ngStyle);
  }
  ngDoCheck(): void {
    if (this.eventDesc.ComponentId && this.websiteDetails) {
      this.websiteDetails.EventPages.filter(a=>a.PageSystemName === 'event')[0].PageSections.forEach(element => {
        if(element.PageSystemName === 'event-countdown'){
        //  this.isFullPage =false;
          this.eventCountdownPage =  element;
        }
      });
      if(!this.introDetails && this.eventDesc.EventId>0){
        this.eventMakerService.getEventIntro(this.eventDesc.EventId).subscribe(res=>{
          this.introDetails = res;
          this.introDetails.EventDateTimeInfoString = this.globalService.getEventDateTimeInfoString(this.introDetails.DateInfo, this.introDetails.DateInfo.TimeZoneShortName, this.ngStyle.CustomDateFormat);
        });
       
      }
      this.heading = this.eventDesc.SectionProperties.filter(a => a.Name == 'EventDescription')[0];
      this.sectionHeading = this.eventDesc.SectionProperties.filter(a => a.Name == 'SectionHeading')[0];
      this.prop = this.eventDesc.SectionProperties.filter(a => a.Name == 'Description')[0];
      this.image = this.eventDesc.SectionProperties.filter(a => a.Name == 'Flyer')[0];
      this.sectionBanner = this.eventDesc.SectionProperties.filter(a => a.Name == 'SectionBanner')[0];
      this.ngStyle.sectionTextColor =  this.eventDesc.ModuleTextColor;
      this.ngStyle.sectionBgColor = this.eventDesc.ModuleBGColor;
      this.ngStyle.SectionBorder =   this.eventDesc.SectionBorder;
      this.ngStyle.SectionPadding =   this.eventDesc.SectionPadding;
      this.ngStyle.BannerSectionBorder = this.eventDesc.BannerSectionBorder;
      this.ngStyle.BannerSectionPadding = this.eventDesc.BannerSectionPadding;
      this.ngStyle.BannerSectionBGColor = this.eventDesc.SectionBGColor;
    }
  }
  ngOnInit(): void {
    this.renderer.listen('window', 'click', (e: any) => {
      this.globalService.clearToolBar(this.dynComponents, e);
    });
    this.domainUrl = environment.domainUrl;
  }
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }

  errorHandler(event) {
    event.target.src = "/assets/eventmaker/theme1/media/no-image.jpg";
  }
  ChangeDetect(event, section, ChangeType) {
   this.ngStyle = this.globalService.changeDetected(event, section,this.ngStyle,this.cd, ChangeType);
   this.cd.detectChanges();
  }
  onChange(value, prop) {
    this.globalService.onChange(value, prop, this.eventDesc);
  }
  getStyleString(fieldName: SectionPropertyModel) {
    return this.globalService.getStyleString(fieldName);
  }
  getSectionStyleString(sectionName) {
    return this.globalService.getSectionStyleString(sectionName);
  }
  getBannerSectionStyleString(sectionName) {
    return this.globalService.getBannerSectionStyleString(sectionName);
  }
}
