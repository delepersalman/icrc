import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { UserIdleService } from 'angular-user-idle';
import { CalendarPipe } from 'ngx-moment';
import { environment } from 'src/environments/environment';
import { MessageService } from '../../shared/services/message.service';
import { RoomType, VideoSource, VirtualEventRoomModel } from '../models/virtualevent.room.model';
import { SharedFireworksComponentService } from '../services/shared.service';
import { VirtualEventService } from '../services/virtualevent.service';
import { FwRoomComponent } from '../shared/fw-room/fw-room.component';
import { RoomBaseComponent } from '../shared/roombase.component';
import * as moment from 'moment';
import { PollDialogComponent } from '../shared/poll-dialog/poll-dialog.component';
import { Subscription } from 'rxjs';
import { ThemingService } from '../shared/_theme/theme.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'fireworks-networking',
  templateUrl: './networking.component.html',
  styleUrls: ['./networking.component.scss']
})
export class NetworkingComponent extends RoomBaseComponent implements OnInit, OnDestroy {
  roomData: VirtualEventRoomModel;
  constructor(
    public route: ActivatedRoute,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public titleService: Title,
    public sharedService: SharedFireworksComponentService,
    public virtualEventService: VirtualEventService,
    public messageService: MessageService,
    public amCalendar: CalendarPipe,
    public userIdle: UserIdleService,
    public router: Router,
    public themeService: ThemingService
  ) {
    super(dialog, sharedService, messageService, virtualEventService, router, themeService);
  }

  ngOnInit() {
    if (this.validatePermissionAndInitializeData()) {

      this.roomData = this.sharedService.virtualEventUser.VirtualEvent.Rooms.find(x => x.RoomType == RoomType.Networking);//TODO

      if (!this.roomData) {
        this.noRoomAccess = true;
        return;
      }

      this.getRoomData(this.roomData.VirtualEventRoomId, () => {
        this.themeService.setColorTheme(this.roomData.BoardBackgroundColor);
      });
      this.subscribeRoomUpdate(this.roomData);
      this.subscribeSurveyUpdate(this.roomData);
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

  joinNetworkingBooth(roomData: { RoomName: string; VirtualEventRoomId: any; }): void {
    const url = `/fireworks/${this.sharedService.virtualEventUser.VirtualEvent.EventId}/${this.sharedService.virtualEventUser.EventAccessToken}/networking/${roomData.RoomName.replace(/ /g, '-')}/${roomData.VirtualEventRoomId}/join`;
    this.router.navigate([url]);
  }
}
