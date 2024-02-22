import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { AfterContentInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, Renderer2, ViewChildren, ViewContainerRef } from '@angular/core';
import { ECImageViewModel } from 'src/app/shared/models/ec-image-model';
import { EventIntroModel, EventWebsiteModel, ngStyleModel, SectionPropertyModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { AddToCalendarModalComponent } from '../../add-to-calendar-modal/add-to-calendar-modal.component';
import { ShareEventModalComponent } from '../../share-event-modal/share-event-modal.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';

@Component({
  selector: 'theme2-event-intro',
  templateUrl: './theme2-event-intro.component.html',
  styleUrls: ['./theme2-event-intro.component.scss']
})
export class Theme2EventIntroComponent implements OnInit, OnChanges {
  @Input() eventIntro: EventIntroModel = new EventIntroModel();
  @Input() bookTicketUrl: any;
  @Input() websiteDetails: EventWebsiteModel;
  addCalendarURI:string;
  ngStyle:ngStyleModel = new ngStyleModel();
  domainUrl:string;
  addtoCalender:string
  EditMode:boolean;
  userFavorite : boolean;
  userThumbup : boolean;
  shareUrl: string;
  isDateFormateEnabled: boolean;
  eventDescPage: any;
  eventorganiserPage: any;
  isFullPage: boolean = true;
  IsEndDateEnabled: any;
  IsDateEnabled: any;
  IsAddressEnabled: any;
  IsVenueNameEnabled: any;
  @ViewChildren('appendItem', { read: ViewContainerRef })
  public dynComponents: QueryList<ViewContainerRef>;

  @Output() outputEvent : EventEmitter<any> = new EventEmitter<any>();
  constructor(private globalService: GlobalService, private dialog: MatDialog, private renderer: Renderer2, private  cd: ChangeDetectorRef) { }
  drop(event: CdkDragDrop<string[]>) {
    this.globalService.drop(event, this.eventIntro);
    this.globalService.changeAlignment(event, this.eventIntro, this.ngStyle,true);
  }
  changeAlignment(event){
    this.globalService.changeAlignment(event, this.eventIntro, this.ngStyle);
    this.ngStyle = new ngStyleModel();
  }
  showHideToolbar(event:any,prop:SectionPropertyModel,isBtn: boolean=false){    
    this.globalService.closeToolBar();
    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if (vcr.element.nativeElement.innerText == event.target.innerText) {
          this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventIntro,false, (prop.Name == 'DateInfo'?this.isDateFormateEnabled:false));
          prop.expanded = true;
        }
      });  
 }
  showHideButtonToolbar(event: any, prop: SectionPropertyModel) {
    if (this.eventIntro.EditMode) {
   this.dynComponents.map(
        (vcr: ViewContainerRef, index: number) => {
          vcr.clear();
          prop.expanded = false;
          if (vcr.element.nativeElement.innerText == event.target.innerText) {
            this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventIntro, true);
            prop.expanded = true;
          }
        });
    }
    else {
      if (prop.Name === 'Share')
        this.openShareEventModal();
      else if (prop.Name === 'AddtoCalendar')
        this.openAddtoCalendarModal();
      else if (prop.Name === 'BookTicket')
        this.setFocus("event-tickets");
    }
  }
 setFocus(id) {
  try {
    const errorField = document.getElementById(id);
    errorField.scrollIntoView({ behavior: "smooth", inline: "nearest" });
  } catch (err) {

  }
}
  onChange(value, prop){
    this.globalService.onChange(value, prop, this.eventIntro);
   }
  onFavorite(obj,evnt, prop){
    if(this.eventIntro.EditMode){
      this.showHideButtonToolbar(evnt,prop);
      return;
    }
    obj.Type="fav";
    this.outputEvent.emit(obj);
  }
  onThumbup(obj, evnt, prop){
    if(this.eventIntro.EditMode){
      this.showHideButtonToolbar(evnt,prop);
      return;
    }
    obj.Type="lik";
    this.outputEvent.emit(obj);
  }
  
  openAddtoCalendarModal() {
    const dialogRef = this.dialog.open(AddToCalendarModalComponent, {
       data:this.eventIntro,
       width:'300px',
       scrollStrategy: new NoopScrollStrategy()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }
  
  openShareEventModal() {
    const dialogRef = this.dialog.open(ShareEventModalComponent, {
       data: this.eventIntro,
      width:'500px',
      scrollStrategy: new NoopScrollStrategy()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }

  ngOnInit(): void {
    this.ngStyle.SectionName = "intro";
    this.domainUrl = environment.domainUrl;
    this.addtoCalender ="https://www.google.com/calendar/render?action=TEMPLATE&text={{eventIntro.EventTitle}}&dates={{eventIntro.DateInfo.StartDateTime}}/{{eventIntro.DateInfo.EndDateTime}}&details={{this.eventIntro.EventTitle}} at {{this.eventIntro.Address}}&location={{this.eventIntro.VenueName}}, {{this.eventIntro.Address}}";
    this.renderer.listen('window', 'click', (e: any) => {
      this.globalService.clearToolBar(this.dynComponents, e);
      });
     }
  ngOnChanges():void{
    this.ngStyle.SectionName = "intro";
    this.ngStyle.sectionTextColor =  this.eventIntro.ModuleTextColor;
    this.ngStyle.sectionBgColor = this.eventIntro.ModuleBGColor;
    this.ngStyle.SectionBorder = this.eventIntro.SectionBorder;
    this.ngStyle.SectionPadding = this.eventIntro.SectionPadding;
  }
  showTimeZone = false;
  showEventDescription = true;
  ngDoCheck(){
    if(this.websiteDetails && this.eventIntro.DateInfo){
      this.ngStyle.sectionTextColor =  this.eventIntro.ModuleTextColor;
      this.ngStyle.sectionBgColor = this.eventIntro.ModuleBGColor;
      this.ngStyle.SectionBorder = this.eventIntro.SectionBorder;
      this.ngStyle.SectionPadding = this.eventIntro.SectionPadding;
      if(this.websiteDetails.EventPages.filter(a=>a.IsExpanded && a.PageSystemName === 'checkout')[0])
      this.showEventDescription =  !this.websiteDetails.EventPages.filter(a=>a.IsExpanded && a.PageSystemName === 'checkout')[0].IsExpanded;
      this.websiteDetails.EventPages.filter(a=>a.PageSystemName === 'event')[0].PageSections.forEach(element => {
        if( element.PageSystemName === 'event-description'){
          this.eventDescPage = element;
        }else if(element.PageSystemName === 'event-organiser'){
          this.isFullPage =false;
          this.eventorganiserPage =  element;
        }
      });
      this.isDateFormateEnabled =  this.eventIntro.SectionProperties.filter(a => a.Name == 'EnableDateFormate')[0]?true:false;
      if(this.isDateFormateEnabled){
        this.ngStyle.CustomDateFormat = this.eventIntro.SectionProperties.filter(a => a.Name == 'DateInfo')[0]?.CustomDateFormat;
      }
      this.IsAddressEnabled = this.eventIntro.SectionProperties.filter(a => a.Name === 'Address')[0]
      this.IsVenueNameEnabled = this.eventIntro.SectionProperties.filter(a => a.Name === 'VenueName')[0];
      this.IsDateEnabled = this.eventIntro.SectionProperties.filter(a => a.Name === 'DateInfo')[0]
       this.IsEndDateEnabled = this.eventIntro.SectionProperties.filter(a => a.Name === 'EndDateInfo')[0];
      this.showTimeZone = this.eventIntro.SectionProperties.filter(a => a.Name == 'ShowTimeZone')[0]?true:false;
      this.eventIntro.EventDateTimeInfoString = this.globalService.getEventDateTimeInfoString(this.eventIntro.DateInfo, this.showTimeZone, this.ngStyle.CustomDateFormat, this.IsEndDateEnabled, this.IsDateEnabled);
    }
  }
  getStyleString(fieldName: SectionPropertyModel) {
    return this.globalService.getStyleString(fieldName);
  }
  getSectionStyleString(sectionName) {
    return this.globalService.getSectionStyleString(sectionName);
  }
  ChangeDetect(event, section) {
    this.ngStyle = this.globalService.changeDetected(event, section,this.ngStyle,this.cd);
    this.cd.detectChanges();
  }
}
