import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, Input, OnInit, QueryList, Renderer2, ViewChildren, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { EventFooter, SectionPropertyModel, SectionPropertyRequestModel, ngStyleModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { GlobalService } from 'src/app/shared/services/global-service';

@Component({
  selector: 'theme2-event-footer',
  templateUrl: './theme2-event-footer.component.html',
  styleUrls: ['./theme2-event-footer.component.scss']
})
export class Theme2EventFooterComponent implements OnInit {
  @Input() websiteDetails: any
  @Input() eventFooter: EventFooter = new EventFooter();
  heading: SectionPropertyModel = new SectionPropertyModel();
  description: SectionPropertyModel = new SectionPropertyModel();
  quickLinks: SectionPropertyModel = new SectionPropertyModel();
  getTicketButton: SectionPropertyModel = new SectionPropertyModel();
  eventDescPage: any;
  ngStyle: ngStyleModel = new ngStyleModel();
  requestModel:SectionPropertyRequestModel=new SectionPropertyRequestModel();
  @ViewChildren('appendItem', { read: ViewContainerRef })
  public dynComponents: QueryList<ViewContainerRef>;
  expanded = false;
  menuList:any;
  constructor(private router: Router, private globalService: GlobalService, private eventMakerService: EventMakerService, private   renderer: Renderer2, private   cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.requestModel.Type ="Footer";
    this.requestModel.CustomPageId = this.eventFooter.ComponentId;
    this.requestModel.EventId = this.eventFooter.EventId;   
    this.renderer.listen('window', 'click', (e: any) => {
      this.globalService.clearToolBar(this.dynComponents, e);
    });
  }
  setFocus(id){
    this.router.navigate(['event', this.websiteDetails.Event.EventId, id]);
  }
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.menuList, event.previousIndex, event.currentIndex);
      this.SaveHeaderOrder();
    }
  }
  showHideToolbar(event: any, prop: SectionPropertyModel, isButton:boolean=false) {
    if(this.eventFooter.EditMode){
    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if (vcr.element.nativeElement.innerText == event.target.innerText) {
          this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventFooter, isButton);
          prop.expanded = true;
        }
      })
    }else{
      this.setFocus('event-tickets')
    }
  }
  changeAlignment(event) {
    this.globalService.changeAlignment(event, this.eventFooter, this.ngStyle);
  }
  ngDoCheck() {
    if (this.websiteDetails && this.eventFooter) {
      this.websiteDetails.EventPages.filter(a => a.PageSystemName === 'event')[0].PageSections.forEach(element => {
        if (element.PageSystemName === "event-contactus") {
          this.eventDescPage = element;
        }
      });
      this.heading = this.eventFooter.SectionProperties.filter(a => a.Name == 'Heading')[0];
      this.description = this.eventFooter.SectionProperties.filter(a => a.Name == 'Description')[0];
      this.getTicketButton = this.eventFooter.SectionProperties.filter(a => a.Name == 'GetTicketButton')[0];
      if(!this.menuList || this.menuList.length == 0)
      this.menuList = this.eventFooter.SectionProperties.filter(menu=>menu.Type !=='FooterComponentProperty');
      this.ngStyle.SectionBorder =   this.eventFooter.SectionBorder;
      this.ngStyle.SectionPadding =   this.eventFooter.SectionPadding;
    }  
  }
  showHideButtonToolbar(event:any, prop:SectionPropertyModel){  
    if(this.eventFooter.EditMode)
   {
    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if(vcr.element.nativeElement.innerText == event.target.innerText){
        this.globalService.showHideToolbar(event,prop,this.ngStyle, vcr, this.eventFooter,true);
        prop.expanded = true;
        }
      });
   }
    else
    {
     this.setFocus(prop.Url);
    }
   }
   selected: any;
   select(item) {
     if(!this.eventFooter.EditMode)
     this.selected = item;
   };
   isActive(item) {
     return this.selected === item;
   };
   isActiveRoute(item){
     return item.PageSystemName== item.componentname;
   }
   SaveHeaderOrder(){
    this.requestModel.SelectedPropertiess =this.menuList.map(x=>x.EventmakerPagePropertyId);
    this.requestModel.EventmakerWebsiteComponentId = this.eventFooter.SectionProperties[0].EventmakerWebsiteComponentId;
    this.eventMakerService.saveSectionData(this.requestModel).subscribe(res => {
    });
  }
  getStyleString(fieldName: SectionPropertyModel) {
    return this.globalService.getStyleString(fieldName);
  }
  getSectionStyleString(sectionName) {
    return this.globalService.getSectionStyleString(sectionName);
  }
  ChangeDetect(event, section) {
    this.ngStyle = this.globalService.changeDetected(event, section, this.ngStyle, this.cd);
    this.ngStyle.SectionName = "footer";
    this.requestModel.Type ="Footer";
    this.cd.detectChanges();
  }
}
