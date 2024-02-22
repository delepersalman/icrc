import { Component, OnInit, Input, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { VirtualEventService } from '../services/virtualevent.service';
import { MatDialog } from '@angular/material/dialog';
import { VideoSource, RoomType, MediaType, VirtualEventRoomModel } from '../models/virtualevent.room.model';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { UserRole, VirtualEventUserModel } from '../models/virtualevent.user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedFireworksComponentService } from '../services/shared.service';
import { RtmChannel, AttributesMap, RtmClient, MemberAttributes, RtmMessage, ChatMessage } from '../models/rtm.model';
import { DialogAudioVideoData } from '../models/common.model';
import { MediaSettingDialogComponent } from '../shared/media-setting-dialog/media-setting-dialog.component';
import { VirtualEventModel } from '../models/virtualevent.model';
import { MessageService } from '../../shared/services/message.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { RoomBaseComponent } from '../shared/roombase.component';
import { CalendarPipe } from 'ngx-moment';
import { UserIdleService } from 'angular-user-idle';
import { FwRoomComponent } from '../shared/fw-room/fw-room.component';
import { takeUntil } from 'rxjs/operators';
import { ThemingService } from '../shared/_theme/theme.service';

@Component({
  selector: 'fireworks-keynote',
  templateUrl: './keynote.component.html',
  styleUrls: ['./keynote.component.scss']
})
export class KeynoteComponent extends RoomBaseComponent {

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

      let room = this.sharedService.virtualEventUser.VirtualEvent.Rooms.find(x => x.RoomType == RoomType.Keynote);//TODO

      if (!room) {
        this.noRoomAccess = true;
        return;
      }

      this.getRoomData(room.VirtualEventRoomId, () => { });
      this.subscribeRoomUpdate(room);
    }
  }
}
