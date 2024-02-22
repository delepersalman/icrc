import { ChangeDetectorRef, Component, DoCheck, Input, OnChanges, OnInit, QueryList, Renderer2, ViewChildren, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { EventSponsorModel, EventSponsors, ngStyleModel, SectionPropertyModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'theme2-event-sponsers',
  templateUrl: './theme2-event-sponsers.component.html',
  styleUrls: ['./theme2-event-sponsers.component.scss']
})
export class Theme2EventSponsersComponent implements OnInit, DoCheck {
  @Input() eventSponsors: EventSponsors= new EventSponsors();
  @Input() isFullPage: boolean;
  @Input() websiteDetails: any;
  sectionHeading: SectionPropertyModel;
  sectionBanner: SectionPropertyModel;
  eventUrl: string;
  constructor(private globalService: GlobalService, private renderer: Renderer2, private cd: ChangeDetectorRef, private router: Router) { }
  ngStyle:ngStyleModel = new ngStyleModel();
  domainUrl:string
  heading:SectionPropertyModel= new SectionPropertyModel();
  SponsorBox: SectionPropertyModel = new SectionPropertyModel();
  Category: SectionPropertyModel = new SectionPropertyModel();
  SeeAllBtn: SectionPropertyModel = new SectionPropertyModel();
  groupArr: any[] = [];
  @ViewChildren('appendItem', { read: ViewContainerRef })
  public dynComponents: QueryList<ViewContainerRef>;
  expanded = false;
  ngOnInit(): void {
    this.renderer.listen('window', 'click', (e: any) => {
      this.globalService.clearToolBar(this.dynComponents, e);
    });
    this.globalService.onFieldDataChanged.subscribe(s=>{
      for (let index = 0; index < s.length; index++) {       
        for (let j = 0; j < this.eventSponsors.eventSponsors.length; j++) {
          if(s[index].FieldId === this.eventSponsors.eventSponsors[j].EventSponsorId && s[index].FieldName === 'SponsorBox'){
            this.eventSponsors.eventSponsors[j].BGColor = s[index].BGColor;
            this.eventSponsors.eventSponsors[j].TextColor = s[index].TextColor;
          }
        }
      }
    });
    this.domainUrl = environment.domainUrl;
  }
  changeAlignment(event){
    this.globalService.changeAlignment(event, this.eventSponsors, this.ngStyle);
    this.cd.detectChanges();
    this.ngStyle =  new ngStyleModel();
  }
  getBannerSectionStyleString(sectionName) {
    return this.globalService.getBannerSectionStyleString(sectionName);
  }
  ChangeDetect(event,section, ChangeType: any='Section' ) {
    this.ngStyle = this.globalService.changeDetected(event,section,this.ngStyle,this.cd, ChangeType);
    this.cd.detectChanges();
  }
  showHideToolbar(event:any,prop:SectionPropertyModel){    
     if(this.eventSponsors.EditMode){
    this.dynComponents.map(
     (vcr: ViewContainerRef, index: number) => {
       vcr.clear();
       prop.expanded = false;
       if(vcr.element.nativeElement == event.target){       
       this.globalService.showHideToolbar(event,prop,this.ngStyle, vcr, this.eventSponsors); 
       prop.expanded = true;      
       }
     })  
    }else{
      this.setFocus();
    }
 }
 showHideButtonToolbar(event: any, prop: SectionPropertyModel, sponsor: any = undefined) {
  if (this.eventSponsors.EditMode) {
    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if (vcr.element.nativeElement == event.target) {
          if(sponsor){
            prop.FieldId = sponsor.EventSponsorId;
            prop.BGColor = sponsor.BGColor;
            prop.Color = sponsor.Color;
          }
          this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventSponsors, true);
          prop.expanded = true;
        }
      });
  }
}

setFocus(){
  try { window.parent.postMessage("urlChanged_event-sponsors",'*'); } catch { }
}

  onChange(value, prop){
    this.globalService.onChange(value, prop, this.eventSponsors);
   }
   trackByFn(index, item) {
    return item.ScheduleId;
  }
  trackBysFn(index, item) {
    return item.StartDate;
  }
  ngDoCheck():void{   
    if(this.websiteDetails){
      this.eventUrl = this.globalService.getEventUrl("event-sponsors",this.websiteDetails.Event);
    }
    if(this.eventSponsors.ComponentId){
      this.groupArr = this.eventSponsors.eventSponsors.reduce((r, { CategoryName }) => {
        if (!r.some(o => o.CategoryName === CategoryName)) {
          r.push({ CategoryName, groupItem: this.eventSponsors.eventSponsors.filter(v => v.CategoryName === CategoryName) });
        }
        return r;
      }, []);
      this.ngStyle.sectionTextColor =  this.eventSponsors.ModuleTextColor;
      this.ngStyle.sectionBgColor = this.eventSponsors.ModuleBGColor;
      this.ngStyle.SectionBorder = this.eventSponsors.SectionBorder;
      this.ngStyle.SectionPadding = this.eventSponsors.SectionPadding;
      this.ngStyle.BannerSectionBorder = this.eventSponsors.BannerSectionBorder;
      this.ngStyle.BannerSectionPadding = this.eventSponsors.BannerSectionPadding;
      this.ngStyle.BannerSectionBGColor = this.eventSponsors.SectionBGColor;
      this.heading= this.eventSponsors.SectionProperties.filter(a=>a.Name === 'EventSponsors')[0];     
      this.SponsorBox = this.eventSponsors.SectionProperties.filter(a => a.Name == 'SponsorBox')[0];
      this.Category = this.eventSponsors.SectionProperties.filter(a => a.Name == 'Category')[0];
      this.SeeAllBtn = this.eventSponsors.SectionProperties.filter(a => a.Name == 'SeeAllSponsorBTN')[0]; 
      this.sectionHeading = this.eventSponsors.SectionProperties.filter(a => a.Name == 'SectionHeading')[0];
      this.sectionBanner = this.eventSponsors.SectionProperties.filter(a => a.Name == 'SectionBanner')[0];
    }
  }
  errorHandler(event) {
    event.target.src = "/assets/eventmaker/theme1/media/no-image.jpg";
 }
 getStyleString(fieldName: SectionPropertyModel) {
  return this.globalService.getStyleString(fieldName);
}
getSectionStyleString(sectionName) {
  return this.globalService.getSectionStyleString(sectionName);
}
}
