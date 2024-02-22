import { Component, OnDestroy, OnInit, HostListener, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EventSpeakerModel } from '../../models/virtualevent.model';
import { SharedFireworksComponentService } from '../../services/shared.service';
import { VirtualEventService } from '../../services/virtualevent.service';

@Component({
  selector: 'event-speakers',
  templateUrl: './speakers.component.html',
  styleUrls: ['./speakers.component.scss']
})
export class SpeakersComponent implements OnInit, OnDestroy {
  eventSpeakers: EventSpeakerModel[];
  unsubscribeAll: Subject<any> = new Subject();
  constructor(private virtualEventService: VirtualEventService, public sharedService: SharedFireworksComponentService, private renderer: Renderer2) {

    this.sharedService.onEventInfoUpdate.pipe(takeUntil(this.unsubscribeAll)).subscribe(() => {
      this.getSpeakerDetails();
    });

  }

  @ViewChild('scrollMe') selectedTab: ElementRef;
  updateScrollHeight(): void {
      const rightTopHeader = document.getElementsByClassName('tabButtonOuter')[0] as any;
      const scrollHeight = window.innerHeight - (rightTopHeader.offsetHeight);
      this.renderer.setStyle(this.selectedTab.nativeElement, 'height', scrollHeight + 'px');
  }

  ngOnInit(): void {
    this.getSpeakerDetails();
  }

  @HostListener('window:resize', ['$event'])
  sizeChange(): void {
    this.updateScrollHeight();
  }

  getSpeakerDetails(): void {
    this.virtualEventService.GetSpeakers(this.sharedService.virtualEventUser.VirtualEvent.EventId)
    .pipe(takeUntil(this.unsubscribeAll)).subscribe(res => {
      if (res.Data) {
        this.eventSpeakers = res.Data;
        this.sharedService.eventSpeakers = res.Data;
        this.sharedService.onEventSpeakerLoaded.next(this.sharedService.eventSpeakers);
        setTimeout(() => {
          this.updateScrollHeight();
        }, 1000);
      }
    })
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

}
