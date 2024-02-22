import { Injectable } from '@angular/core';
import { GlobalService } from '../../shared/services/global-service';
import { EventMakerService } from '../../shared/services/event-maker/event-maker.service';
import { EventWebsiteModel } from '../../shared/models/event-maker/event-maker-model';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { QuestionNAnswer } from '../EditSettings/edit-faq/edit-faq.component';

@Injectable({
  providedIn: 'root'
})
export class ViewEventService {
  styleSheet: any;
  link: any;
  eventWebsiteDetailChange: Subject<EventWebsiteModel> = new Subject<EventWebsiteModel>();
  eventWebsiteDetail: EventWebsiteModel = new EventWebsiteModel();
  constructor(private _globalService: GlobalService, private _eventmakerService: EventMakerService) { }

  getEventWebsiteDetail(eventId: number) {
    this._globalService.showLoader(true);
    this._eventmakerService.getEventWebsiteDetail(eventId).subscribe(res => {
      this._globalService.showLoader(false);
      if (res)
        this.eventWebsiteDetail = res;
      this.setStyles(this.eventWebsiteDetail);
      this.eventWebsiteDetail.FontType = this.eventWebsiteDetail.FontStyle ? 'Web Safe Fonts' : 'Custom Font';
      let logoId = this.eventWebsiteDetail.LogoDetails.LogoTypeId;
      this.eventWebsiteDetail.LogoType = logoId=== 3?'No Logo': logoId === 0?'Upload Logo' : logoId === 2 ? 'Enter Text' : 'Enter URL';
      this.eventWebsiteDetail.BannerType =this.eventWebsiteDetail.BannerTypeId === 2?'No Banner':this.eventWebsiteDetail.BannerTypeId === 1 ? 'Enter URL' : 'Upload Banner';
      this.changeFont(this.eventWebsiteDetail);
      this.eventWebsiteDetail.ThemeColors.forEach((val, index) => {
        this.changeTheme(val.Color, index + 1);
      })
      this._globalService.changeLogoDetails(this.eventWebsiteDetail.LogoDetails);
      this._globalService.changeFaviconDetails(this.eventWebsiteDetail.Favicon);
      this._globalService.eventEndDate = this.eventWebsiteDetail.DateInfo.IsDateNull?"":this.eventWebsiteDetail.DateInfo.StartDateTime;
      this.eventWebsiteDetailChange.next(this.eventWebsiteDetail);
    })
  }

  changeTheme(color: string, index) {
    document.documentElement.style.setProperty('--theme-colour' + index, color);
  }

  setStyles(eventWebsiteDetail: EventWebsiteModel) {
    if (this.styleSheet)
      this.styleSheet.remove();
    this.styleSheet = document.createElement('style');
    this.styleSheet.innerHTML = eventWebsiteDetail.CustomCss
    document.head.appendChild(this.styleSheet);
  }

  changeFont(eventWebsiteDetail: EventWebsiteModel) {
    if (eventWebsiteDetail.FontType == 'Custom Font') {
      eventWebsiteDetail.FontStyle = '';
      if (eventWebsiteDetail.FontSource) {
        if (this.link)
          this.link.remove();
        this.link = document.createElement('link');
        this.link.rel = 'stylesheet';
        this.link.type = 'text/css';
        this.link.href = eventWebsiteDetail.FontSource;
        document.head.appendChild(this.link);
      }
      document.documentElement.style.setProperty('--font-style', eventWebsiteDetail.FontStyle);
    } else {
      eventWebsiteDetail.FontSource = '';
      eventWebsiteDetail.FontStyle = '';
      document.documentElement.style.setProperty('--font-style', eventWebsiteDetail.FontStyle);
    }
  }
}
