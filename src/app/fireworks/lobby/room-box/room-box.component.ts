import { Component, Input, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { RoomType, VirtualEventRoomModel } from '../../models/virtualevent.room.model';
import { SharedFireworksComponentService } from '../../services/shared.service';
import { PagerService } from '../../services/pager.service';
import * as moment from 'moment';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'lobby-room-box',
  templateUrl: './room-box.component.html',
  styleUrls: ['./room-box.component.scss']
})
export class RoomBoxComponent implements OnInit, AfterViewInit, OnDestroy {

  unsubscribeAll: Subject<any>;
  autoJoin = 'autoJoin';

  constructor(
    public sharedService: SharedFireworksComponentService,
    public router: Router,
    private pagerService: PagerService) {
    this.unsubscribeAll = new Subject();
  }

  @Input() roomData: VirtualEventRoomModel;
  // array of all items to be paged

  // pager object
  pager: any = {};

  // paged items
  pagedItems: any[];

  isSimpleRoom = false;

  booths: any[];

  virtualBackgroundUrl: string;

  isRoomLive = false;
  roomScheduleStatus: string;

  ngOnInit(): void {

    if (this.roomData) {

      if (this.roomData.RoomType === RoomType.Reception
        || this.roomData.RoomType === RoomType.GreenRoom
        || this.roomData.RoomType === RoomType.Keynote
        || this.roomData.RoomType === RoomType.Stage) {
        this.isSimpleRoom = true;

        this.checkIfRoomIsLive();

      } else {
        this.isSimpleRoom = false;
        this.booths = this.roomData.VirtualEventBooths;
        this.setPage(1);
      }
    }
  }

  ngAfterViewInit(): void {
    timer(0, 1000 * 15).subscribe(() => {
      this.checkIfRoomIsLive();
    });
  }

  goToRoom(roomData: any): string {
    const roomTypeRoute = this.getRoomTypeRoute(roomData.RoomType);
    let url = `/s/fireworks/${this.sharedService.virtualEventUser.VirtualEvent.EventId}/${this.sharedService.virtualEventUser.EventAccessToken}/${roomTypeRoute}`;
    if (!this.isSimpleRoom) {
      url = url + `/${roomData.RoomName.replace(/ /g, '-')}/${roomData.VirtualEventRoomId}/join`;
    }
    //this.router.navigate([url], { queryParams: { 'autojoin': true } });
    window.location.href = url;
    return url;
  }

  getRoomTypeRoute(roomType): string {
    let roomTypeRoute = '';
    switch (roomType) {
      case 'expo':
      case 'expo_booth':
        roomTypeRoute = 'expo';
        break;
      case 'session':
      case 'session_booth':
        roomTypeRoute = 'session';
        break;
      case 'networking':
      case 'networking_booth':
        roomTypeRoute = 'networking';
        break;
      case 'customroom':
        roomTypeRoute = 'customroom';
        break;
      default:
        roomTypeRoute = this.roomData.RoomType;
        break;
    }
    return roomTypeRoute;
  }

  setPage(page: number): void {
    // get pager object from service
    this.pager = this.pagerService.getPager(this.booths.length, page, 1);
    // get current page of items
    this.pagedItems = this.booths.slice(this.pager.startIndex, this.pager.endIndex + 1);
  }

  isBooth(roomData): boolean {
    return roomData.RoomType === RoomType.Expo || roomData.RoomType === RoomType.ExpoBooth;
  }

  hasBackgroundImage(): boolean {
    let hasBackground = false;
    if (this.roomData) {
      if (this.roomData.ShowBackgroundImage && this.roomData.BackgroundImage) {
        this.virtualBackgroundUrl = this.sharedService.domainUrl + this.roomData.BackgroundImage.ImagePath;
        hasBackground = true;
      }
      else if (this.roomData.MediaType && this.roomData.MediaType.toLowerCase() === 'image' && this.roomData.RoomImage) {
        hasBackground = true;
        this.virtualBackgroundUrl = this.sharedService.domainUrl + this.roomData.RoomImage.ImagePath;
      }
      else if (this.sharedService.virtualEventUser.VirtualEvent
        && this.sharedService.virtualEventUser.VirtualEvent.ShowBackgroundImage
        && this.sharedService.virtualEventUser.VirtualEvent.BackgroundImagePath) {
        this.virtualBackgroundUrl = this.sharedService.domainUrl
          + this.sharedService.virtualEventUser.VirtualEvent.BackgroundImagePath;
        hasBackground = true;
      }
      else {
        hasBackground = false;
      }
    }
    return hasBackground;
  }

  checkIfRoomIsLive(): void {

    if (this.roomData && this.sharedService.eventSchedules) {
      let scheduleStatus: number;
      const currentDateTimestamp = Date.parse(moment.utc().format());
      this.isRoomLive = this.sharedService.eventSchedules
        .some(s => s.VirtualEventRoomId === this.roomData.VirtualEventRoomId
          && Date.parse(moment.utc(s.StartDateUtc).format()) <= currentDateTimestamp
          && Date.parse(moment.utc(s.EndDateUtc).format()) > currentDateTimestamp
        );

      if (this.isRoomLive) {
        scheduleStatus = 1;
      }
      else if (this.sharedService.eventSchedules
        .some(s => s.VirtualEventRoomId === this.roomData.VirtualEventRoomId
          && Date.parse(moment.utc(s.StartDateUtc).format()) > currentDateTimestamp)) {
        scheduleStatus = 2;
      } else {
        scheduleStatus = 3;
      }

      this.roomScheduleStatus = this.sharedService.scheduleStatus[scheduleStatus];
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.unsubscribe();
  }

  getScheduleStatus(booth: VirtualEventRoomModel): string {

    if (booth && this.sharedService.eventSchedules) {
      let scheduleStatus: number;
      const currentDateTimestamp = Date.parse(moment.utc().format());
      this.isRoomLive = this.sharedService.eventSchedules
        .some(s => s.VirtualEventRoomId === booth.VirtualEventRoomId
          && Date.parse(moment.utc(s.StartDateUtc).format()) <= currentDateTimestamp
          && Date.parse(moment.utc(s.EndDateUtc).format()) > currentDateTimestamp
        );

      if (this.isRoomLive) {
        scheduleStatus = 1;
      }
      else if (this.sharedService.eventSchedules
        .some(s => s.VirtualEventRoomId === booth.VirtualEventRoomId
          && Date.parse(moment.utc(s.StartDateUtc).format()) > currentDateTimestamp)) {
        scheduleStatus = 2;
      } else {
        scheduleStatus = 3;
      }

      this.roomScheduleStatus = this.sharedService.scheduleStatus[scheduleStatus];
      return this.roomScheduleStatus;
    }
  }
}
