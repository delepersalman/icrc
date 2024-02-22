import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, QueryList, Renderer2, ViewChildren, ViewContainerRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { EventDescriptionModel, ngStyleModel, SectionPropertyModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'theme1-event-description',
  templateUrl: './theme1-event-description.component.html',
  styleUrls: ['./theme1-event-description.component.scss']
})
export class Theme1EventDescriptionComponent implements OnInit {
  @Input() eventDesc: EventDescriptionModel = new EventDescriptionModel();

  ngStyle: ngStyleModel = new ngStyleModel();
  domainUrl: string;
  prop: SectionPropertyModel = new SectionPropertyModel();
  heading: SectionPropertyModel = new SectionPropertyModel();
  @ViewChildren('appendItem', { read: ViewContainerRef })
  public dynComponents: QueryList<ViewContainerRef>;
  expanded = false;
  hasChangesLoaded = false;
  constructor(private globalService: GlobalService, private sanitized: DomSanitizer, private renderer: Renderer2,
     private cd: ChangeDetectorRef) { }
  drop(event: CdkDragDrop<string[]>) {
    this.globalService.drop(event, this.eventDesc);
  }
  showHideToolbar(event: any, prop: SectionPropertyModel) {
    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if (vcr.element.nativeElement == event.target) {
          this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventDesc);
          prop.expanded = true;
        }
      })
  }
  changeAlignment(event) {
    this.globalService.changeAlignment(event, this.eventDesc, this.ngStyle);
    this.cd.detectChanges();
    this.ngStyle =  new ngStyleModel();
  }
  ChangeDetect(event, section) {
    this.ngStyle = this.globalService.changeDetected(event, section, this.ngStyle, this.cd);
    this.cd.detectChanges();
  }
  ngDoCheck(): void {
    if (this.eventDesc.ComponentId && !this.hasChangesLoaded) {
      this.hasChangesLoaded =true;
      this.heading = this.eventDesc.SectionProperties.filter(a => a.Name == 'EventDescription')[0];
      this.ngStyle.sectionTextColor =  this.eventDesc.ModuleTextColor;
      this.ngStyle.sectionBgColor = this.eventDesc.ModuleBGColor;
    }
  }
  ngOnInit(): void {
    this.renderer.listen('window', 'click', (e: any) => {
      this.globalService.clearToolBar(this.dynComponents, e);
      });
    this.domainUrl = environment.domainUrl;
  }
  transform(value) {
    if(value && !value.includes("</a>"))
    return this.sanitized.bypassSecurityTrustHtml(value);
    else
    return value;
  }

  errorHandler(event) {
    event.target.src = "/assets/eventmaker/theme1/media/no-image.jpg";
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
}
