import { Component, OnInit, HostListener, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { scheduled, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EventScheduleModel } from '../../models/virtualevent.model';
import { RoomType, VirtualEventRoomModel } from '../../models/virtualevent.room.model';
import { SharedFireworksComponentService } from '../../services/shared.service';
import { VirtualEventService } from '../../services/virtualevent.service';

@Component({
  selector: 'event-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss']
})
export class SchedulesComponent implements OnInit {
  eventSchedules: EventScheduleModel[];
  unsubscribeAll: Subject<any> = new Subject();
  selectedScheduleFilter = 'All';
  rooms: VirtualEventRoomModel[] = [];
  roomType: any = RoomType;

  constructor(private virtualEventService: VirtualEventService,
    public sharedService: SharedFireworksComponentService,
    public router: Router, private renderer: Renderer2) {
    this.sharedService.onEventInfoUpdate.pipe(takeUntil(this.unsubscribeAll)).subscribe(() => {
      this.bindChildRoom();
    });

    this.sharedService.onRoomDataUpdate.pipe(takeUntil(this.unsubscribeAll)).subscribe(res => {
      this.bindChildRoom();
    });

    this.sharedService.onBoothUpdate.pipe(takeUntil(this.unsubscribeAll)).subscribe(res => {
      this.bindChildRoom();
    });
  }

  @ViewChild('scrollMe') selectedTab: ElementRef;
  updateScrollHeight(): void {
    const filterDropdownHeight = 76;
    const rightTopHeader = document.getElementsByClassName('tabButtonOuter')[0] as any;
    const scrollHeight = window.innerHeight - (rightTopHeader.offsetHeight + filterDropdownHeight);
    this.renderer.setStyle(this.selectedTab.nativeElement, 'height', scrollHeight + 'px');
  }

  ngOnInit(): void {
    this.bindChildRoom();
  }

  @HostListener('window:resize', ['$event'])
  sizeChange(): void {
    this.updateScrollHeight();
  }

  getSchedualData(): void {
    this.virtualEventService.GetSchedules(this.sharedService.virtualEventUser.VirtualEvent.EventId)
      .pipe(takeUntil(this.unsubscribeAll)).subscribe(res => {
        if (res.Data) {
          this.sharedService.eventSchedules = res.Data;
          this.filterSchedule();
          this.sharedService.onScheduleUpdate.next();
          setTimeout(() => {
            this.updateScrollHeight();
          }, 1000);
        }
      });
  }

  bindChildRoom() {
    this.rooms = this.sharedService.virtualEventUser.VirtualEvent.Rooms;
    if (!this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)) {
      this.rooms = this.sharedService.virtualEventUser.VirtualEvent.Rooms.filter(x => x.RoomType != RoomType.GreenRoom);
    }
    if (this.rooms.length > 0) {
      if (this.sharedService.currentRoomData?.RoomType !== RoomType.Reception) {
        this.rooms.forEach(element => {
          if (element.RoomType == this.roomType.Session
            || element.RoomType == this.roomType.Expo
            || element.RoomType == this.roomType.Networking) {
            this.virtualEventService.getEventRoomDetail(this.sharedService.virtualEventUser.VirtualEvent.EventId, element.VirtualEventRoomId)
              .pipe(takeUntil(this.unsubscribeAll)).subscribe(rd => {
                if (rd && rd.Data) {
                  element.VirtualEventBooths = rd.Data.VirtualEventBooths;
                }
              }, error => {
              });
          }
        });
      }

      // To update room name in schedule in real time
      this.getSchedualData();
    }
  }

  filterSchedule(): void {
    if (this.selectedScheduleFilter != 'All') {
      this.eventSchedules = this.sharedService.eventSchedules.filter(s => s.RoomName == this.selectedScheduleFilter);
    } else {
      this.eventSchedules = this.sharedService.eventSchedules;
    }
  }

  joinSchedule(schedule: EventScheduleModel): void {
    if (this.sharedService.scheduleStatus[schedule.ScheduleStatus] != this.sharedService.scheduleStatus[3]) {
      let url = this.sharedService.getJoinRoomUrl(schedule.RoomType, schedule.RoomName, schedule.VirtualEventRoomId);
      this.router.navigate([url]);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }
}
