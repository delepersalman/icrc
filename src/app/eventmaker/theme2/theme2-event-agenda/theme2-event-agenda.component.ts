
import { ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, ElementRef, Input, OnInit, QueryList, Renderer2, ViewChild, ViewChildren, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { DesignerToolbarComponent } from '../../component-setting/designer-toolbar/designer-toolbar.component';
import { EventAgendaModel, SectionPropertyModel, ngStyleModel } from '../../../shared/models/event-maker/event-maker-model';
import { GlobalService } from '../../../shared/services/global-service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'theme2-event-agenda',
  templateUrl: './theme2-event-agenda.component.html',
  styleUrls: ['./theme2-event-agenda.component.scss'],
})
export class Theme2EventAgendaComponent implements OnInit {
  @Input() eventAgenda: EventAgendaModel = new EventAgendaModel();
  @Input() isFullPage: boolean;
  @Input() websiteDetails: any;
  ngStyle: ngStyleModel = new ngStyleModel();
  @ViewChildren('appendItem', { read: ViewContainerRef })
  public dynComponents: QueryList<ViewContainerRef>;
  expanded = false;
  domainUrl: string;
  groupArr: any[] = [];
  heading: SectionPropertyModel = new SectionPropertyModel();
  Title: SectionPropertyModel = new SectionPropertyModel();
  Description: SectionPropertyModel = new SectionPropertyModel();
  Venue: SectionPropertyModel = new SectionPropertyModel();
  Time: SectionPropertyModel = new SectionPropertyModel();
  Speakers: SectionPropertyModel = new SectionPropertyModel();
  Sponsors: SectionPropertyModel = new SectionPropertyModel();
  Tickets: SectionPropertyModel = new SectionPropertyModel();
  SeeAllBtn : SectionPropertyModel = new SectionPropertyModel();
  sectionHeading: SectionPropertyModel;
  sectionBanner: SectionPropertyModel;
  AgendaBox: SectionPropertyModel;
  eventUrl: string;
  constructor(private globalService: GlobalService, private renderer: Renderer2, private cd: ChangeDetectorRef,  private router: Router) { }
  showHideToolbar(event: any, prop: SectionPropertyModel, agenda: any) {
    if(this.eventAgenda.EditMode){
    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if (vcr.element.nativeElement == event.target) {
          if (agenda) {
            prop.FieldId = agenda.ScheduleId;
            if(this.ngStyle.PropertyName === 'AgendaBox'){
            prop.BGColor = agenda.BGColor;

            }
            this.ngStyle.FieldId = agenda.ScheduleId;
          }
          this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventAgenda);
          prop.expanded = true;
        }
      })
    }else{
      this.setFocus();
    }
  }
  showHideButtonToolbar(event: any, prop: SectionPropertyModel, agenda: any = undefined) {
    if (this.eventAgenda.EditMode) {
      this.dynComponents.map(
        (vcr: ViewContainerRef, index: number) => {
          vcr.clear();
          prop.expanded = false;
          if (1 || vcr.element.nativeElement == event.target) {
            if (agenda) {
              prop.FieldId = agenda.ScheduleId;
              if(this.ngStyle.PropertyName === 'AgendaBox'){
              prop.BGColor = agenda.BGColor;

              }
              this.ngStyle.FieldId = agenda.ScheduleId;
            }
            this.ngStyle.websiteDetails = this.websiteDetails;
            this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventAgenda, true);
            prop.expanded = true;
          }
        });
    }
  }
  changeAlignment(event) {
    this.globalService.changeAlignment(event, this.eventAgenda, this.ngStyle);
    this.cd.detectChanges();
    this.ngStyle =  new ngStyleModel();
  }
  getBannerSectionStyleString(sectionName) {
    return this.globalService.getBannerSectionStyleString(sectionName);
  }
  ChangeDetect(event, section) {
    this.ngStyle = this.globalService.changeDetected(event, section, this.ngStyle, this.cd);
    this.cd.detectChanges();
  }
  onChange(value, prop) {
    this.globalService.onChange(value, prop, this.eventAgenda);
  }
  ngDoCheck(): void {
    if(this.websiteDetails){
      this.eventUrl = this.globalService.getEventUrl("event-agenda",this.websiteDetails.Event);
    }
    if (this.eventAgenda.ComponentId) {
      this.groupArr = this.eventAgenda.AgendaList.reduce((r, { StartDate }) => {
        if (!r.some(o => o.StartDate == StartDate)) {
          r.push({ StartDate, groupItem: this.eventAgenda.AgendaList.filter(v => v.StartDate == StartDate) });
        }
        return r;
      }, []);
      this.heading = this.eventAgenda.SectionProperties.filter(a => a.Name === 'EventSchedules')[0];
      this.Title = this.eventAgenda.SectionProperties.filter(a => a.Name === 'Title')[0];
      this.Description = this.eventAgenda.SectionProperties.filter(a => a.Name === 'Description')[0];
      this.Tickets = this.eventAgenda.SectionProperties.filter(a => a.Name === 'Tickets')[0];
      this.Venue = this.eventAgenda.SectionProperties.filter(a => a.Name === 'Venue')[0];
      this.Time = this.eventAgenda.SectionProperties.filter(a => a.Name === 'Timezone')[0];
      this.Speakers = this.eventAgenda.SectionProperties.filter(a => a.Name === 'Speakers')[0];
      this.Sponsors = this.eventAgenda.SectionProperties.filter(a => a.Name === 'Sponsors')[0];
      this.SeeAllBtn = this.eventAgenda.SectionProperties.filter(a => a.Name == 'SeeAllAgendaBTN')[0]; 
      this.sectionHeading = this.eventAgenda.SectionProperties.filter(a => a.Name == 'SectionHeading')[0];
      this.sectionBanner = this.eventAgenda.SectionProperties.filter(a => a.Name == 'SectionBanner')[0];
      this.AgendaBox = this.eventAgenda.SectionProperties.filter(a => a.Name == 'AgendaBox')[0];
      this.ngStyle.sectionTextColor = this.eventAgenda.ModuleTextColor;
      this.ngStyle.sectionBgColor = this.eventAgenda.ModuleBGColor;
      this.ngStyle.SectionBorder =   this.eventAgenda.SectionBorder;
      this.ngStyle.SectionPadding =   this.eventAgenda.SectionPadding;
      this.ngStyle.BannerSectionBorder =   this.eventAgenda.BannerSectionBorder;
      this.ngStyle.BannerSectionPadding =   this.eventAgenda.BannerSectionPadding;
      this.ngStyle.BannerSectionBGColor = this.eventAgenda.SectionBGColor;
    }
  }
  trackByFn(index, item) {
    return item.ScheduleId;
  }
  trackBysFn(index, item) {
    return item.StartDate;
  }
  setFocus(){
    try { window.parent.postMessage("urlChanged_event-agenda",'*'); } catch { }
    this.router.navigate(['event', this.eventAgenda.EventId, "event-agenda"]);
  }
  ngOnInit(): void {
    this.renderer.listen('window', 'click', (e: any) => {
      this.globalService.clearToolBar(this.dynComponents, e);
    });
    this.domainUrl = environment.domainUrl;
    this.globalService.onFieldDataChanged.subscribe(s => {
      for (let index = 0; index < s.length; index++) {
        for (let j = 0; j < this.eventAgenda.AgendaList.length; j++) {
          if (s[index].FieldId === this.eventAgenda.AgendaList[j].ScheduleId && s[index].FieldName === 'AgendaBox') {
            this.eventAgenda.AgendaList[j].BGColor = s[index].BGColor;
          }
        }
      }
    });
  }
  getStyleString(fieldName: SectionPropertyModel) {
    return this.globalService.getStyleString(fieldName);
  }
  getSectionStyleString(sectionName) {
    return this.globalService.getSectionStyleString(sectionName);
  }
  getTicketProperty(agendaId, Name) {
    return this.eventAgenda.SectionProperties.filter(a => a.DataFieldId === agendaId && a.Name === Name)[0];
  }
}
