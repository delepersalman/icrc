import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedFireworksComponentService } from '../services/shared.service';
import { VirtualEventService } from '../services/virtualevent.service';
import { RoomBaseComponent } from '../shared/roombase.component';
import { MessageService } from '../../shared/services/message.service';
import { CalendarPipe } from 'ngx-moment';
import { UserIdleService } from 'angular-user-idle';
import { RoomType } from '../models/virtualevent.room.model';
import { environment } from 'src/environments/environment';
import { FwRoomComponent } from '../shared/fw-room/fw-room.component';
import * as moment from 'moment';
import { PollDialogComponent } from '../shared/poll-dialog/poll-dialog.component';
import { Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ThemingService } from '../shared/_theme/theme.service';

@Component({
  selector: 'fireworks-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss']
})
export class SessionComponent extends RoomBaseComponent implements OnInit, OnDestroy {

  resourcesLoading: boolean;
  boothNotAvailable: boolean;
  domainUrl = environment.domainUrl;
  subscriptions: Subscription[] = [];
  roomId = 0;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public titleService: Title,
    public sharedService: SharedFireworksComponentService,
    public virtualEventService: VirtualEventService,
    public messageService: MessageService,
    public amCalendar: CalendarPipe,
    public userIdle: UserIdleService,
    public themeService: ThemingService
  ) {
    super(dialog, sharedService, messageService, virtualEventService, router, themeService);
  }

  ngOnInit(): void {

    if (this.validatePermissionAndInitializeData()) {

      const room = this.sharedService.virtualEventUser.VirtualEvent.Rooms.find(x => x.RoomType.toLowerCase() === RoomType.Session); // TODO

      if (!room) {
        this.noRoomAccess = true;
        return;
      }

      this.getRoomData(room.VirtualEventRoomId, () => { });
      this.subscribeSurveyUpdate(room);
      this.subscribeRoomUpdate(room);
      this.sharedService.onBoothUpdate.pipe(takeUntil(this.unsubscribeAll)).subscribe(booth => {
        if (this.roomId === parseInt(booth.VirtualEventRoomId, 10)) {
          this.getRoomData(this.roomId, () => { });
        }
      });
      this.sharedService.onRoleChange.pipe(takeUntil(this.unsubscribeAll)).subscribe(async () => {
        if (this.roomId === this.sharedService.currentRoomData.VirtualEventRoomId) {
          this.getRoomData(this.roomId, () => { });
        }
      });
    }
  }

  ngOnDestroy(){
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.unsubscribe();
  }

  joinSessionBooth(roomData: { RoomName: string; VirtualEventRoomId: any; }): void {
    const url = `/fireworks/${this.sharedService.virtualEventUser.VirtualEvent.EventId}/${this.sharedService.virtualEventUser.EventAccessToken}/session/${roomData.RoomName.replace(/ /g, '-')}/${roomData.VirtualEventRoomId}/join`;
    this.router.navigate([url]);
  }
}
