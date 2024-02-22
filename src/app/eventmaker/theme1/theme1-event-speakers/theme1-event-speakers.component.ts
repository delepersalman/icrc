import { ChangeDetectorRef, Component, DoCheck, Input, OnChanges, OnInit, QueryList, Renderer2, ViewChildren, ViewContainerRef } from '@angular/core';
import { EventSpeakerModel, EventSpeakers, ngStyleModel, SectionPropertyModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'theme1-event-speakers',
  templateUrl: './theme1-event-speakers.component.html',
  styleUrls: ['./theme1-event-speakers.component.scss']
})
export class Theme1EventSpeakersComponent implements OnInit, DoCheck {
  @Input() eventSpeakers: EventSpeakers = new EventSpeakers();
  constructor(private globalService: GlobalService, private renderer: Renderer2, private cd: ChangeDetectorRef) { }
  ngStyle: ngStyleModel = new ngStyleModel();
  domainUrl: string
  heading: SectionPropertyModel = new SectionPropertyModel();
  SpeakerBox: SectionPropertyModel = new SectionPropertyModel();
  Category: SectionPropertyModel = new SectionPropertyModel();
  @ViewChildren('appendItem', { read: ViewContainerRef })
  public dynComponents: QueryList<ViewContainerRef>;
  expanded = false;
  groupArr: any[] = [];
  ngOnInit(): void {
    this.renderer.listen('window', 'click', (e: any) => {
      this.globalService.clearToolBar(this.dynComponents, e);
      });
    this.globalService.onFieldDataChanged.subscribe(s => {
      for (let index = 0; index < s.length; index++) {
        for (let j = 0; j < this.eventSpeakers.eventSpeakers.length; j++) {
          if (s[index].FieldId === this.eventSpeakers.eventSpeakers[j].EventSpeakerId && s[index].FieldName === 'SpeakerBox') {
            this.eventSpeakers.eventSpeakers[j].BGColor = s[index].BGColor;
            this.eventSpeakers.eventSpeakers[j].TextColor = s[index].TextColor;
          }
        }
      }
    });
    this.domainUrl = environment.domainUrl;
  }
  trackByFn(index, item) {
    return item.ScheduleId;
  }
  trackBysFn(index, item) {
    return item.StartDate;
  }
  ngDoCheck(): void {
    if (this.eventSpeakers.ComponentId) {
      this.groupArr = this.eventSpeakers.eventSpeakers.reduce((r, { CategoryName }) => {
        if (!r.some(o => o.CategoryName == CategoryName)) {
          r.push({ CategoryName, groupItem: this.eventSpeakers.eventSpeakers.filter(v => v.CategoryName == CategoryName) });
        }
        return r;
      }, []);
      this.ngStyle.sectionTextColor = this.eventSpeakers.ModuleTextColor;
      this.ngStyle.sectionBgColor = this.eventSpeakers.ModuleBGColor;
      this.heading = this.eventSpeakers.SectionProperties.filter(a => a.Name === 'EventSpeakers')[0];
      this.SpeakerBox = this.eventSpeakers.SectionProperties.filter(a => a.Name == 'SpeakerBox')[0];
      this.Category = this.eventSpeakers.SectionProperties.filter(a => a.Name == 'Category')[0];
    }
  }
  showHideButtonToolbar(event: any, prop: SectionPropertyModel, speaker: any = undefined) {
    if (this.eventSpeakers.EditMode) {
      this.dynComponents.map(
        (vcr: ViewContainerRef, index: number) => {
          vcr.clear();
          prop.expanded = false;
          if (vcr.element.nativeElement == event.target) {
            if (speaker) {
              prop.FieldId = speaker.EventSpeakerId;
              prop.BGColor = speaker.BGColor;
              prop.Color = speaker.Color;
            }
            this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventSpeakers, true);
            prop.expanded = true;
          }
        });
    }
  }
  changeAlignment(event) {
    this.globalService.changeAlignment(event, this.eventSpeakers, this.ngStyle);
    this.cd.detectChanges();
    this.ngStyle = new ngStyleModel();
  }
  ChangeDetect(event, section) {
    this.ngStyle = this.globalService.changeDetected(event, section, this.ngStyle, this.cd);
    this.cd.detectChanges();
  }
  showHideToolbar(event: any, prop: SectionPropertyModel) {

    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = true;
        if (vcr.element.nativeElement == event.target) {
          prop.expanded = false;
          this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventSpeakers);

        }
      })

  }
  onChange(value, prop) {
    this.globalService.onChange(value, prop, this.eventSpeakers);
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
