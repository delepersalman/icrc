import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Input, OnChanges, OnInit, QueryList, Renderer2, ViewChildren, ViewContainerRef, ChangeDetectorRef } from '@angular/core';
import { HeaderModel, LogoDetailModel, ngStyleModel, SectionPropertyModel, SectionPropertyRequestModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';
import { ViewEventService } from '../../service/view-event.service';
import { Route, Router } from '@angular/router';
const websiteType = {
  singlePage: 'Single',
  multiPage: 'Multiple'
}
@Component({
  selector: 'theme2-event-header',
  templateUrl: './theme2-event-header.component.html',
  styleUrls: ['./theme2-event-header.component.scss']
})

export class Theme2EventHeaderComponent implements OnInit, OnChanges {
  @Input() logoDetails: LogoDetailModel = new LogoDetailModel();
  @Input() page: HeaderModel= new HeaderModel();
  @Input() headerFixed: boolean = false;
  @Input() bookTicketUrl: any;
  @Input() eventId: any;
  @Input() websiteType: string;
  @Input() websiteDetails: any
  ngStyle:ngStyleModel = new ngStyleModel();
  domainUrl:string;
  requestModel:SectionPropertyRequestModel=new SectionPropertyRequestModel();
  componentname:string;
  @ViewChildren('appendItem', { read: ViewContainerRef })
  public dynComponents: QueryList<ViewContainerRef>;
  constructor(private renderer: Renderer2,  private _globalService: GlobalService, private eventMakerService: EventMakerService,private _viewEventService: ViewEventService, private router: Router, private cd: ChangeDetectorRef) { }
  setFocus(id) {
    if (id === '') {
      try { window.parent.postMessage("urlChanged_"+id,'*'); } catch { }
      this.router.navigate(['event', this.eventId]);
      return;
    }
    try {
     let stiCLass = document.getElementsByClassName('stick-to-top');
      if (stiCLass.length > 0) {
        for (let i = 0; i < stiCLass.length; i++) {
          stiCLass[i].classList.remove('stick-to-top');
        }
      }
      if(id === 'event-organiser' || id === 'event-countdown'){
        id = 'event-intro';
      }
      if(this.websiteType === 'Multiple' && id  !== 'event-contactus'){
        try { window.parent.postMessage("urlChanged_"+id,'*'); } catch { }
        this.router.navigate(['event', this.eventId, id]);
      }else{        
      const errorField = document.getElementById(id);
      errorField.scrollIntoView({ behavior: "smooth", inline: "nearest" }); 
      if(this.headerFixed){
        setTimeout(() => {
          errorField.getElementsByTagName('section')[0].classList.add('stick-to-top');  
        }, 100);
        } 
      }
    } catch (err) {

    }
  }
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.page.SectionProperties, event.previousIndex, event.currentIndex);
      this.SaveHeaderOrder();
    }
  }
  ngOnChanges() {   
    this.select(this.page.SectionProperties[0]);
  }
  ChangeDetect(event, section) {
    this.ngStyle = this._globalService.changeDetected(event, section,this.ngStyle,this.cd);
    this.cd.detectChanges();
  }
  onResizeLogo(event) {
    var shape = document.getElementById("resizeImage");
    var width = shape.offsetWidth;
    var height = shape.offsetHeight;
    this.logoDetails.LogoHeight = height;
    this.logoDetails.LogoWidth = width;
    this.websiteDetails.LogoDetails = this.logoDetails;
    this.eventMakerService.saveWebsiteDetails(this.websiteDetails).subscribe(res => {
      this.websiteDetails = res;
    });
  }
  changeAlignment(event){
    this._globalService.changeAlignment(event, this.page, this.ngStyle);
    this.ngStyle = new ngStyleModel();
  }
  showHideButtonToolbar(event:any, prop:SectionPropertyModel){  
    if(this.page.EditMode)
   {
    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if(vcr.element.nativeElement == event.target){
        this._globalService.showHideToolbar(event,prop,this.ngStyle, vcr, this.page,true);
        prop.expanded = true;
        }
      });
   }
    else
    {
     this.setFocus(prop.Url);
    }
   }
ngDoCheck(){
  this.page.SectionProperties.forEach(prop => {
    prop.Url = websiteType.singlePage? prop.Name.toLowerCase():"";
  });
  this.ngStyle.sectionTextColor =  this.page.ModuleTextColor;
  this.ngStyle.sectionBgColor = this.page.ModuleBGColor;
  this.ngStyle.SectionBorder =  this.page.SectionBorder;
  this.ngStyle.SectionPadding = this.page.SectionPadding;
}

  ngOnInit(): void {
    this.domainUrl= environment.domainUrl;
    this.requestModel.CustomPageId = this.page.ComponentId;
    this.requestModel.EventId = this.page.EventId;   
    this.renderer.listen('window', 'click', (e: any) => {
      this._globalService.clearToolBar(this.dynComponents, e);
    });
  }
 
  selected: any;
  select(item) {
    if(!this.page.EditMode)
    this.selected = item;
  };
  isActive(item) {
    return this.selected === item;
  };
  isActiveRoute(item){
    return item.PageSystemName== item.componentname;
  }
  
SaveHeaderOrder(){
  this.requestModel.SelectedPropertiess = this.page.SectionProperties.map(x=>x.EventmakerPagePropertyId);
  this.requestModel.EventmakerWebsiteComponentId = this.page.SectionProperties[0].EventmakerWebsiteComponentId;
  this.eventMakerService.saveSectionData(this.requestModel).subscribe(res => {
  });
}
getStyleString(fieldName: SectionPropertyModel) {
  return this._globalService.getStyleString(fieldName);
}
getSectionStyleString(sectionName) {
  return this._globalService.getSectionStyleString(sectionName);
}
}
