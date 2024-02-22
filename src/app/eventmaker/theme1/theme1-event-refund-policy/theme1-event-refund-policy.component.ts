import { ChangeDetectorRef, Component, Input, OnInit, QueryList, Renderer2, ViewChildren, ViewContainerRef } from '@angular/core';
import { EventRefundPolicyDescriptionModel, ngStyleModel, SectionPropertyModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'theme1-event-refund-policy',
  templateUrl: './theme1-event-refund-policy.component.html',
  styleUrls: ['./theme1-event-refund-policy.component.scss']
})
export class Theme1EventRefundPolicyComponent implements OnInit {
  @Input() eventPolicyDesc: EventRefundPolicyDescriptionModel;
  ngStyle: ngStyleModel = new ngStyleModel();
  domainUrl: string;
  heading: SectionPropertyModel = new SectionPropertyModel();
  description: SectionPropertyModel = new SectionPropertyModel();
  constructor(private globalService: GlobalService, private renderer: Renderer2, private cd: ChangeDetectorRef) { }
  @ViewChildren('appendItem', { read: ViewContainerRef })
  public dynComponents: QueryList<ViewContainerRef>;
  changeAlignment(event) {
    this.globalService.changeAlignment(event, this.eventPolicyDesc, this.ngStyle);
    this.cd.detectChanges();
    this.ngStyle = new ngStyleModel();
  }
  ChangeDetect(event, section) {
    this.ngStyle = this.globalService.changeDetected(event, section, this.ngStyle, this.cd);
    this.cd.detectChanges();
  }
  ngDoCheck(): void {
    if (this.eventPolicyDesc.ComponentId) {
      this.heading = this.eventPolicyDesc.SectionProperties.filter(a => a.Name == 'RefundPolicyHeading')[0];
      this.description = this.eventPolicyDesc.SectionProperties.filter(a => a.Name == 'RefundPolicyDescription')[0];
      this.ngStyle.sectionTextColor = this.eventPolicyDesc.ModuleTextColor;
      this.ngStyle.sectionBgColor = this.eventPolicyDesc.ModuleBGColor;
    }
  }
  onChange(value, prop) {
    this.globalService.onChange(value, prop, this.eventPolicyDesc);
  }
  ngOnInit(): void {
    this.renderer.listen('window', 'click', (e: any) => {
      this.globalService.clearToolBar(this.dynComponents, e);
      });
    this.domainUrl = environment.domainUrl;
  }
  showHideToolbar(event: any, prop: SectionPropertyModel) {

    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if (vcr.element.nativeElement == event.target) {
          this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventPolicyDesc);
          prop.expanded = true;
        }
      });
  }
  getStyleString(fieldName: SectionPropertyModel) {
    return this.globalService.getStyleString(fieldName);
  }
  getSectionStyleString(sectionName) {
    return this.globalService.getSectionStyleString(sectionName);
  }
}
