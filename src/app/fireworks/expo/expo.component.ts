import { Component, OnInit, OnDestroy } from '@angular/core';
import { RoomBaseComponent } from '../shared/roombase.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedFireworksComponentService } from '../services/shared.service';
import { VirtualEventService } from '../services/virtualevent.service';
import { MessageService } from '../../shared/services/message.service';
import { CalendarPipe } from 'ngx-moment';
import { UserIdleService } from 'angular-user-idle';
import { RoomType } from '../models/virtualevent.room.model';
import { takeUntil } from 'rxjs/operators';
import { ThemingService } from '../shared/_theme/theme.service';

@Component({
  selector: 'fireworks-expo',
  templateUrl: './expo.component.html',
  styleUrls: ['./expo.component.scss']
})

export class ExpoComponent extends RoomBaseComponent implements OnInit, OnDestroy {

  constructor(
    public router: Router,
    public route: ActivatedRoute,
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

  ngOnInit() {

    if (this.validatePermissionAndInitializeData()) {

      const room = this.sharedService.virtualEventUser.VirtualEvent.Rooms.find(x => x.RoomType === RoomType.Expo); // TODO

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

  joinExpoRoom(roomData: { RoomName: string; VirtualEventRoomId: any; }): void {
    const url = `/fireworks/${this.sharedService.virtualEventUser.VirtualEvent.EventId}/${this.sharedService.virtualEventUser.EventAccessToken}/expo/${roomData.RoomName.replace(/ /g, '-')}/${roomData.VirtualEventRoomId}/join`;
    this.router.navigate([url]);
  }
}
