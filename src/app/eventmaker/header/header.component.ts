import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { EventTicketState, EventmakerPageModel, EventmakerSectionModel, HeaderModel, LogoDetailModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'event-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() logoDetails: LogoDetailModel = new LogoDetailModel();
  @Input() eventHeaderPage: EventmakerSectionModel;
  @Input() headerFixed: boolean = false;
  @Input() themeName: string;
  @Input() eventId: number;
  @Input() websiteType: string;
  @Input() State: EventTicketState;
  @Input() websiteDetails: any;
  componentName: string;
  @Input() Url: any;
  headerSection: HeaderModel = new HeaderModel();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  constructor(private _globalService: GlobalService, private eventMakerService: EventMakerService) { }


  ngOnInit(): void {
    this._globalService.onLogoDetailChagne.subscribe(res => {
      this.logoDetails = res;
    })
    this._globalService.onChangeFaviconDetails.subscribe(res => {
      let favIcon: HTMLLinkElement = document.querySelector('#favIcon');
      if (res && res.ImagePath) {
        window.parent.postMessage((environment.domainUrl + res.ImagePath), "*");
        favIcon.href = environment.domainUrl + res.ImagePath;
      }
    });

    interval(1000 * 30)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        try { window.parent.postMessage("keep-session-alive",'*'); } catch { }
      });
  }

  ngDoCheck() {
    if (this.eventHeaderPage && this.eventHeaderPage.EventmakerPagePropertyDesigns) {
      this.componentName = `theme${this.themeName}-event-header`;
      this.headerSection = this.eventMakerService.MapComponentBaseData<HeaderModel>(this.headerSection, this.eventHeaderPage, this.websiteDetails.FontList);
      this.headerSection.Url = this.Url;
      this.headerSection.EventId = this.eventId;
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(true);
    this._unsubscribeAll.complete();
  }

  getModuleLoader() {
    return () =>
      import("../eventmaker.module").then(m => m.EventmakerModule);
  }
}
