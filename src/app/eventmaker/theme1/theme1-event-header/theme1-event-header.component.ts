import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, QueryList, Renderer2, ViewChildren, ViewContainerRef } from '@angular/core';
import { EventTicketState, HeaderModel, LogoDetailModel, ngStyleModel, SectionPropertyModel, SectionPropertyRequestModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';
import { ViewEventService } from '../../service/view-event.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
const websiteType = {
  singlePage: 'Single',
  multiPage: 'Multiple'
}
@Component({
  selector: 'theme1-event-header',
  templateUrl: './theme1-event-header.component.html',
  styleUrls: ['./theme1-event-header.component.scss']
})

export class Theme1EventHeaderComponent implements OnInit, OnChanges {
  @Input() logoDetails: LogoDetailModel = new LogoDetailModel();
  @Input() page: HeaderModel = new HeaderModel();
  @Input() headerFixed: boolean = false;
  @Input() bookTicketUrl: any;
  @Input() State: EventTicketState;
  @Input() websiteDetails: any;
  ngStyle: ngStyleModel = new ngStyleModel();
  domainUrl: string;
  requestModel: SectionPropertyRequestModel = new SectionPropertyRequestModel();
  componentname: string;
  subscription: Subscription;

  fragment: string;
  @ViewChildren('appendItem', { read: ViewContainerRef })
  public dynComponents: QueryList<ViewContainerRef>;
  constructor(private renderer: Renderer2, private _globalService: GlobalService, private eventMakerService: EventMakerService, private _viewEventService: ViewEventService
    , private cd: ChangeDetectorRef, private route: ActivatedRoute, private _eventmakerService: EventMakerService) { }

  ngAfterViewInit(): void {
    try {
      setTimeout(() => {
        if (this.fragment)
          this.setFocus(this.fragment);
      }, 500);
    } catch (e) { }
  }
  setFocus(id) {
    try {
      let stiCLass = document.getElementsByClassName('stick-to-top');
      if (stiCLass.length > 0) {
        for (let i = 0; i < stiCLass.length; i++) {
          stiCLass[i].classList.remove('stick-to-top');
        }
      }
      if (!id.includes("#"))
        id = "#" + id;
      const errorField = document.querySelector(id);

      errorField.scrollIntoView({ behavior: "smooth", inline: "nearest" });
      if (this.headerFixed) {
        setTimeout(() => {
          errorField.getElementsByTagName('section')[0].classList.add('stick-to-top');
        }, 100);
      }
      try { window.parent.postMessage("hashChanged_" + id, '*'); } catch { }
    } catch (err) {

    }
  }
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.page.SectionProperties, event.previousIndex, event.currentIndex);
      this.SaveHeaderOrder();
    }
  }
  onResizeLogo(event) {
    var shape = document.getElementById("resizeImage");
    var width = shape.offsetWidth;
    var height = shape.offsetHeight;
    this.logoDetails.LogoHeight = height;
    this.logoDetails.LogoWidth = width;
    this.websiteDetails.LogoDetails = this.logoDetails;
    this._eventmakerService.saveWebsiteDetails(this.websiteDetails).subscribe(res => {
      this.websiteDetails = res;
    });
  }
  ngOnChanges() {
    this.select(this.page.SectionProperties[0]);
  }
  changeAlignment(event) {
    this._globalService.changeAlignment(event, this.page, this.ngStyle);
    this.cd.detectChanges();
    this.ngStyle = new ngStyleModel();
  }
  ChangeDetect(event, section) {
    this.ngStyle = this._globalService.changeDetected(event, section, this.ngStyle, this.cd);
    this.cd.detectChanges();
  }
  showHideButtonToolbar(event: any, prop: SectionPropertyModel) {
    if (this.page.EditMode) {
      this.dynComponents.map(
        (vcr: ViewContainerRef, index: number) => {
          vcr.clear();
          prop.expanded = false;
          if (vcr.element.nativeElement == event.target) {
            this.ngStyle.SectionName = "event-header";
            this._globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.page, true);
            prop.expanded = true;
          }
        });
    }
    else {
      this.setFocus(prop.Url);
    }
  }
  ngDoCheck() {
    this.page.SectionProperties.forEach(prop => {
      prop.Url = websiteType.singlePage ? prop.Name.toLowerCase() : "";
    });
    this.ngStyle.sectionTextColor = this.page.ModuleTextColor;
    this.ngStyle.sectionBgColor = this.page.ModuleBGColor;
    this.logoDetails = this.websiteDetails.LogoDetails;
  }

  ngOnInit(): void {
    this.fragment = this.route.snapshot.fragment;
    this.domainUrl = environment.domainUrl;
    this.requestModel.CustomPageId = this.page.ComponentId;
    this.requestModel.EventId = this.page.EventId;
    this.renderer.listen('window', 'click', (e: any) => {
      this._globalService.clearToolBar(this.dynComponents, e);
    });
  }

  selected: any;
  select(item) {
    if (!this.page.EditMode)
      this.selected = item;
  };
  isActive(item) {
    return this.selected === item;
  };
  isActiveRoute(item) {
    return item.PageSystemName == item.componentname;
  }

  SaveHeaderOrder() {
    this.requestModel.SelectedPropertiess = this.page.SectionProperties.map(x => x.EventmakerPagePropertyId);
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
