import { Component, OnInit, HostListener, Renderer2, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EventSponsorModel } from '../../models/virtualevent.model';
import { SharedFireworksComponentService } from '../../services/shared.service';
import { VirtualEventService } from '../../services/virtualevent.service';

@Component({
  selector: 'event-sponsors',
  templateUrl: './sponsors.component.html',
  styleUrls: ['./sponsors.component.scss']
})
export class SponsorsComponent implements OnInit, OnDestroy {
  eventSponsors: EventSponsorModel[];
  unsubscribeAll: Subject<any> = new Subject();
  constructor(
    private virtualEventService: VirtualEventService,
    public sharedService: SharedFireworksComponentService,
    private renderer: Renderer2) {
    this.sharedService.onEventInfoUpdate.pipe(takeUntil(this.unsubscribeAll)).subscribe(() => {
      this.getSponserData();
    });
  }

  @ViewChild('scrollMe') selectedTab: ElementRef;
  updateScrollHeight(): void {
      const rightTopHeader = document.getElementsByClassName('tabButtonOuter')[0] as any;
      const scrollHeight = window.innerHeight - (rightTopHeader.offsetHeight);
      this.renderer.setStyle(this.selectedTab.nativeElement, 'height', scrollHeight + 'px');
  }

  ngOnInit(): void {
    this.getSponserData();
  }

  @HostListener('window:resize', ['$event'])
  sizeChange(): void {
    this.updateScrollHeight();
  }

  getSponserData(): void {
    this.virtualEventService.GetSponsers(this.sharedService.virtualEventUser.VirtualEvent.EventId)
    .pipe(takeUntil(this.unsubscribeAll)).subscribe(res => {
      if (res.Data) {
        this.eventSponsors = res.Data;
        this.sharedService.eventSponsors = res.Data;
        this.sharedService.onEventSponsorLoaded.next(res.Data);
        setTimeout(() => {
          this.updateScrollHeight();
        }, 1000);
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }
}
