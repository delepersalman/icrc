import { Component, Input, Output, EventEmitter, OnInit, ViewContainerRef, QueryList, ViewChildren, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { EventDescriptionModel, EventIntroModel, EventTicketState, EventWebsiteModel, EventmakerSectionModel, SectionPropertyModel, ngStyleModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { environment } from 'src/environments/environment';
import { AddToCalendarModalComponent } from '../../add-to-calendar-modal/add-to-calendar-modal.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { GlobalService } from 'src/app/shared/services/global-service';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ShareEventModalComponent } from '../../share-event-modal/share-event-modal.component';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'theme2-intro-rendor',
  templateUrl: './theme2-intro-rendor.component.html',
  styleUrls: ['./theme2-intro-rendor.component.scss']
})
export class Theme2IntroRendorComponent implements OnInit {
  @Input() websiteDetails: any;
  @Input() eventSelectedpages: EventmakerSectionModel[];
  @Output() outputEvent: EventEmitter<any> = new EventEmitter<any>();
  @Input() themeName: string;
  @Input() eventId: number;
  @Input() State: EventTicketState;
  eventIntro: EventIntroModel = new EventIntroModel();
  eventDesc: EventDescriptionModel = new EventDescriptionModel();
  @Input() bookTicketUrl: any;
  addCalendarURI: string;
  ngStyle: ngStyleModel = new ngStyleModel();
  ngDescStyle: ngStyleModel = new ngStyleModel();
  domainUrl: string;
  addtoCalender: string
  EditMode: boolean;
  userFavorite: boolean;
  userThumbup: boolean;
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
  image: SectionPropertyModel;
  prop: SectionPropertyModel;
  heading: SectionPropertyModel;
  introPage: EventmakerSectionModel;
  descriptionPage: EventmakerSectionModel;
  countDown: EventmakerSectionModel;
  organiser: EventmakerSectionModel;
  constructor(private globalService: GlobalService, private eventMakerService: EventMakerService, private dialog: MatDialog, private renderer: Renderer2, private cd: ChangeDetectorRef, private sanitized: DomSanitizer) { }
  drop(event: CdkDragDrop<string[]>) {
    this.globalService.drop(event, this.eventIntro);
    this.globalService.changeAlignment(event, this.eventIntro, this.ngStyle, true);
  }
  changeAlignment(event, sectionName) {
    if(sectionName === 'event-intro' ){
    this.globalService.changeAlignment(event, this.eventIntro, this.ngStyle);
    this.ngStyle = new ngStyleModel();
    }else{
      this.globalService.changeAlignment(event, this.eventDesc, this.ngDescStyle);
    this.ngDescStyle = new ngStyleModel();
    }
  }
  showHideToolbar(event: any, prop: SectionPropertyModel, isBtn: boolean = false, sectionName) {
    this.globalService.closeToolBar();
    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if (vcr.element.nativeElement.innerText == event.target.innerText) {
          if(sectionName === 'event-intro'){
            this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventIntro, false, (prop.Name == 'DateInfo' ? this.isDateFormateEnabled : false));
            }else if (sectionName === 'event-description'){
              this.globalService.showHideToolbar(event, prop, this.ngDescStyle, vcr, this.eventDesc, true);
            }
        
          prop.expanded = true;
        }
      });
  }
  showHideButtonToolbar(event: any, prop: SectionPropertyModel, sectionName) {
    if (this.eventIntro.EditMode) {
      this.dynComponents.map(
        (vcr: ViewContainerRef, index: number) => {
          vcr.clear();
          prop.expanded = false;
          if (vcr.element.nativeElement.innerText == event.target.innerText) {
            if(sectionName === 'event-intro'){
            this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventIntro, true);
            }else if (sectionName === 'event-description'){
              this.globalService.showHideToolbar(event, prop, this.ngDescStyle, vcr, this.eventDesc, true);
            }
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
  onChange(value, prop) {
    this.globalService.onChange(value, prop, this.eventIntro);
  }
  onFavorite(obj, evnt, prop) {
    if (this.eventIntro.EditMode) {
      this.showHideButtonToolbar(evnt, prop,'event-intro');
      return;
    }
    obj.Type = "fav";
    this.outputEvent.emit(obj);
  }
  onThumbup(obj, evnt, prop) {
    if (this.eventIntro.EditMode) {
      this.showHideButtonToolbar(evnt, prop, 'event-intro');
      return;
    }
    obj.Type = "lik";
    this.outputEvent.emit(obj);
  }

  openAddtoCalendarModal() {
    const dialogRef = this.dialog.open(AddToCalendarModalComponent, {
      data: this.eventIntro,
      width: '300px',
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
      width: '500px',
      scrollStrategy: new NoopScrollStrategy()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }

  ngOnInit(): void {
    this.ngStyle.SectionName = "intro";
    this.ngDescStyle.SectionName = "description";
    this.domainUrl = environment.domainUrl;
    this.addtoCalender = "https://www.google.com/calendar/render?action=TEMPLATE&text={{eventIntro.EventTitle}}&dates={{eventIntro.DateInfo.StartDateTime}}/{{eventIntro.DateInfo.EndDateTime}}&details={{this.eventIntro.EventTitle}} at {{this.eventIntro.Address}}&location={{this.eventIntro.VenueName}}, {{this.eventIntro.Address}}";
    this.renderer.listen('window', 'click', (e: any) => {
      this.globalService.clearToolBar(this.dynComponents, e);
    });
    this.getPageSettings();
  }
  ngOnChanges(): void {
    this.getPageSettings();
  }
  showTimeZone = false;
  showEventDescription = true;
  getStyleString(fieldName: SectionPropertyModel) {
    return this.globalService.getStyleString(fieldName);
  }
  getSectionStyleString(sectionName) {
    return this.globalService.getSectionStyleString(sectionName);
  }
  getPageSettings(){  
    this.introPage = undefined;
    this.descriptionPage  = undefined;
    this.countDown = undefined;
    this.organiser = undefined;
    this.image = undefined;
    for (let index = 0; index < this.eventSelectedpages.length; index++) {
      const element = this.eventSelectedpages[index];
      if(element.PageSystemName ===  "event-intro" && element.IsSystemModule  && element.HomePageActive)      {
        this.introPage = element;
        this.getEventIntro(element);
      }else if(element.PageSystemName ===  "event-description" && element.IsSystemModule  && element.HomePageActive) {      
        this.descriptionPage = element;
        this.getEventDesc(element);
      }
      else if(element.PageSystemName ===  "event-countdown" && element.IsSystemModule  && element.HomePageActive)      {
        this.countDown = element;
      }
      else if(element.PageSystemName ===  "event-organiser" && element.IsSystemModule  && element.HomePageActive)      {
        this.organiser = element;
      }
    }
  }
  getEventIntro(page) {
    this.eventMakerService.getEventIntro(this.eventId).subscribe(res => {
      if (res && this.websiteDetails)
        this.eventIntro = res;
      this.eventIntro.EventId = this.eventId;
      this.eventIntro = this.eventMakerService.MapComponentBaseData<EventIntroModel>(this.eventIntro, page, this.websiteDetails.FontList);
      this.eventIntro.DateInfo.StartDateTime = this.globalService.setUTC(this.eventIntro.DateInfo.StartDateTime);
      this.eventIntro.DateInfo.NextDateTime = this.globalService.setUTC(this.eventIntro.DateInfo.NextDateTime);
      this.eventIntro.DateInfo.EndDateTime = this.globalService.setUTC(this.eventIntro.DateInfo.EndDateTime);
      this.ngStyle.sectionTextColor = this.eventIntro.ModuleTextColor;
      this.ngStyle.bgColor = this.eventIntro.ModuleBGColor;
      this.ngStyle.SectionBorder = this.eventIntro.SectionBorder;
      this.ngStyle.SectionPadding = this.eventIntro.SectionPadding;

      this.isDateFormateEnabled = this.eventIntro.SectionProperties.filter(a => a.Name == 'EnableDateFormate')[0] ? true : false;
      
      this.IsAddressEnabled = this.eventIntro.SectionProperties.filter(a => a.Name === 'Address')[0]
      this.IsVenueNameEnabled = this.eventIntro.SectionProperties.filter(a => a.Name === 'VenueName')[0];
      this.IsDateEnabled = this.eventIntro.SectionProperties.filter(a => a.Name === 'DateInfo')[0]
      this.IsEndDateEnabled = this.eventIntro.SectionProperties.filter(a => a.Name === 'EndDateInfo')[0];
      if (this.IsDateEnabled) {
        this.ngStyle.CustomDateFormat = this.eventIntro.SectionProperties.filter(a => a.Name == 'DateInfo')[0]?.CustomDateFormat;
      }else {
        this.ngStyle.CustomDateFormat = this.eventIntro.SectionProperties.filter(a => a.Name == 'EndDateInfo')[0]?.CustomDateFormat;
      }
      this.showTimeZone = this.eventIntro.SectionProperties.filter(a => a.Name == 'ShowTimeZone')[0] ? true : false;
      this.eventIntro.EventDateTimeInfoString = this.globalService.getEventDateTimeInfoString(this.eventIntro.DateInfo, this.showTimeZone, this.ngStyle.CustomDateFormat, this.IsEndDateEnabled, this.IsDateEnabled);
    })
  }
  getEventDesc(page) {
    this.eventMakerService.getEventDescription(this.eventId).subscribe(res => {
      if (res && this.websiteDetails)
        this.eventDesc = res;
      this.eventDesc = this.eventMakerService.MapComponentBaseData<EventDescriptionModel>(this.eventDesc, page, this.websiteDetails.FontList);
      this.heading = this.eventDesc.SectionProperties.filter(a => a.Name == 'EventDescription')[0];
      this.prop = this.eventDesc.SectionProperties.filter(a => a.Name == 'Description')[0];
      this.image = this.eventDesc.SectionProperties.filter(a => a.Name == 'Flyer')[0];
      this.ngDescStyle.sectionTextColor = this.eventDesc.ModuleTextColor;
      this.ngDescStyle.bgColor = this.eventDesc.ModuleBGColor;
      this.ngDescStyle.SectionBorder = this.eventDesc.SectionBorder;
      this.ngDescStyle.SectionPadding = this.eventDesc.SectionPadding;
    })
  }
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
  ChangeDetect(event, section) {
    if (section.EditMode && section.ModuleName === 'event-intro') {
      this.ngStyle = this.globalService.changeDetected(event, section, this.ngStyle, this.cd);
      this.cd.detectChanges();
    } else {
      this.ngDescStyle = this.globalService.changeDetected(event, section, this.ngDescStyle, this.cd);
      this.cd.detectChanges();
    }
  }

}
