import { DOCUMENT } from '@angular/common';
import { Component, ComponentFactoryResolver, EventEmitter, HostListener, Inject, Input, OnChanges, OnInit, Output, SimpleChanges, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventmakerPageModel, EventmakerSectionModel, EventTicketState, EventWebsiteModel, LogoDetailModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';
import { EventIntroComponent } from '../event-intro/event-intro.component';
import { GlobalConstants } from '../globals';
const websiteType = {
  singlePage: 'Single',
  multiPage: 'Multiple'
}
export interface DynamicContentInputs { [k: string]: any; };

@Component({
  selector: 'event-page-view',
  templateUrl: './event-page-view.component.html',
  styleUrls: ['./event-page-view.component.scss']
})
export class EventPageViewComponent implements OnInit, OnChanges {
  @Input() eventWebsiteDetail: EventWebsiteModel = new EventWebsiteModel();
  @Input() IsEditMode: boolean
  @Input() EventPage: EventmakerPageModel;
  webSiteMenu: any[] = [];
  eventSelectedpages: EventmakerSectionModel[] = [];
  eventHeaderPage: EventmakerSectionModel = new EventmakerSectionModel();
  eventFooterPage: EventmakerSectionModel = new EventmakerSectionModel();
  logoDetails: LogoDetailModel = new LogoDetailModel();
  // Keep track of list of generated components for removal purposes
  components = [];
  domainUrl:string
  @Output() outputEvent : EventEmitter<any> = new EventEmitter<any>();
  discount: string;
  constructor( private router: ActivatedRoute,@Inject(DOCUMENT) private document:Document, private globalService:GlobalService) { }
  eventId:number;
  componentname: string;
  themeName: string;
  bookTicketUrl: any;
  Url: string;
  State: EventTicketState;
  IsEventExpired: boolean = false;
  IsBannerEnabled: boolean = true;
  @HostListener('mousewheel', ['$event'])
  onMousewheel(event) {
    let stiCLass = document.getElementsByClassName('stick-to-top');
    if (stiCLass.length > 0) {
      for (let i = 0; i < stiCLass.length; i++) {
        stiCLass[i].classList.remove('stick-to-top');
      }
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    this.prepareMenuData();
  }

  getModuleLoader() {
    return () =>
      import("../eventmaker.module").then(m => m.EventmakerModule);
  }
  ngOnInit(): void {
    this.router.queryParamMap.subscribe((queryParams) => {
      this.discount = queryParams.get('amp;discount');
    });
    this.router.params.subscribe(params => {
      this.eventId = params['eventId'];
      this.componentname = params['componentname'];
      if (this.componentname === 'event-organiser' || this.componentname === 'event-countdown') {
        this.componentname = 'event-intro';
      }
      this.domainUrl = environment.domainUrl;
      this.router.url.subscribe(res => {
        GlobalConstants.EditMode = res[0].path === "eventmaker" ? true : false;
        this.IsEditMode = GlobalConstants.EditMode;
      })
      this.prepareMenuData();
    });

  }
  sychValue(event) {
    this.outputEvent.emit(event)
  }
  prepareMenuData() {
    if (this.eventWebsiteDetail && this.EventPage && this.eventWebsiteDetail.TemplateId) {
      // if(!this.eventWebsiteDetail.TemplateId){
      //   this.themeName ="1"; 
      // }else
      if(this.eventWebsiteDetail.WebsiteType == websiteType.singlePage) {
        this.eventWebsiteDetail.EventPages[0].PageSections = this.eventWebsiteDetail.EventPages[0].PageSections.filter(x=>x.PageSystemName !== 'event-footer');
      }
      this.themeName = this.eventWebsiteDetail.TemplateId.toString();
      this.logoDetails = this.eventWebsiteDetail.LogoDetails;
      this.State = this.eventWebsiteDetail.State;
      let homePage = this.eventWebsiteDetail.EventPages.filter(a => a.PageSystemName == 'event')[0].PageSections.filter(s => s.PageTitle == 'Home')[0];

      let checkoutPage = this.eventWebsiteDetail.EventPages.filter(a => a.PageSystemName == 'checkout')[0]
      if (checkoutPage && checkoutPage.IsExpanded && this.IsEditMode) {
        this.componentname = undefined;
        let attendeeSection = checkoutPage.PageSections.filter(s => s.PageSystemName == 'checkout-attendee')[0];
        if (attendeeSection) {
          this.IsBannerEnabled = (attendeeSection.EventmakerPagePropertyDesigns.filter(a => a.Name === 'BannerSection')[0] ? true : false);
        } else {
          this.IsBannerEnabled = false;
        }
      }
      let checkoutConfirmationPage = this.eventWebsiteDetail.EventPages.filter(a => a.PageSystemName == 'checkout-confirmation')[0]
      if (checkoutConfirmationPage && checkoutConfirmationPage.IsExpanded && this.IsEditMode) {
        this.componentname = undefined;
        let confirmationSection = checkoutConfirmationPage.PageSections.filter(s => s.PageSystemName == 'confirmation-section')[0];
        if (confirmationSection) {
          this.IsBannerEnabled = (confirmationSection.EventmakerPagePropertyDesigns.filter(a => a.Name === 'BannerSection')[0] ? true : false);
        } else {
          this.IsBannerEnabled = false;
        }
      }
      let styleName = this.themeName + ".css";
      this.loadStyle(styleName, this.themeName);

      this.eventFooterPage = this.EventPage.PageSections.filter(x => x.Selected && x.PageSystemName === 'event-footer')[0];
      let eventSelectedpages = this.EventPage.PageSections.filter(x => x.Selected && x.PageSystemName !== 'event-header');
      if (homePage) {
        for (let index = 0; index < eventSelectedpages.length; index++) {
          let activeOnHomepage = homePage.EventmakerPagePropertyDesigns.filter(a => a.Name === eventSelectedpages[index].PageSystemName)[0];
          eventSelectedpages[index].HomePageActive = activeOnHomepage ? true : (this.EventPage.IsExpanded && this.EventPage.PageSystemName === 'event' ? false : true);
        }
      }
      this.eventSelectedpages = eventSelectedpages
      this.eventHeaderPage = this.EventPage.PageSections.filter(x => x.Selected && x.PageSystemName === 'event-header')[0];
      this.webSiteMenu = [];
      this.eventWebsiteDetail.EventPages.forEach(res => {
        res.PageSections.filter(a => a.Selected && a.PageSystemName !== 'event-header').map(p => {
          var pageUrl = this.eventWebsiteDetail.WebsiteType == websiteType.singlePage ? p.PageSystemName.toLowerCase() : (this.IsEditMode ? '/eventmaker/' : '/event/') + this.eventId + "/" + p.PageSystemName.toLowerCase();
          this.Url = this.eventWebsiteDetail.WebsiteType;
          if (p.PageSystemName === 'event-tickets') {
            this.bookTicketUrl = { name: p.PageTitle, url: pageUrl, type: this.eventWebsiteDetail.WebsiteType, PageSystemName: p.PageSystemName.toLowerCase(), componentname: this.componentname };
          }
          this.webSiteMenu.push({ name: p.PageTitle, url: pageUrl, type: this.eventWebsiteDetail.WebsiteType, PageSystemName: p.PageSystemName.toLowerCase(), componentname: this.componentname });

        });
      });
      this.bookTicketUrl = {};
    }
  }
  loadStyle(cssFile, themeName) {
    if (this.document.getElementById(themeName)) {
      let existingEle = this.document.getElementById(themeName) as HTMLLinkElement;
      existingEle.href = cssFile;
    } else {
      var headEl = this.document.getElementsByTagName('head')[0];
      const newLinkEl = this.document.createElement('link');
      newLinkEl.rel = "stylesheet";
      newLinkEl.id = themeName;
      newLinkEl.href = cssFile;
      headEl.appendChild(newLinkEl);
    }
  }
  loadScripts(scriptFile, themeName) {
    if (this.document.getElementById(themeName + "_scripts")) {
      let existingEle = this.document.getElementById(themeName) as HTMLScriptElement;
      existingEle.src = scriptFile;
    } else {
      var headEl = this.document.getElementsByTagName('head')[0];
      const newLinkEl = this.document.createElement('script');
      newLinkEl.id = themeName + "_scripts";
      newLinkEl.src = scriptFile;
      headEl.appendChild(newLinkEl);
    }
  }
  isSelected(page) {
    if (this.eventWebsiteDetail.EventPages)
      return this.EventPage.PageSections.filter(x => x.PageTitle == page && x.Selected).length > 0;
    else
      return false;
  }

}
