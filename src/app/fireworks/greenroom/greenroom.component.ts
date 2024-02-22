import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { UserNotificationModel, BasePagedListModel } from '../models/common.model';
import { VirtualEventService } from '../services/virtualevent.service';
import { SharedFireworksComponentService } from '../services/shared.service';
import { BehaviorSubject, of, Observable, merge } from 'rxjs';
import { catchError, finalize, startWith, switchMap, map, filter } from 'rxjs/operators';
import { RoomBaseComponent } from '../shared/roombase.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageService } from '../../shared/services/message.service';
import { CalendarPipe } from 'ngx-moment';
import { UserIdleService } from 'angular-user-idle';
import { RoomType } from '../models/virtualevent.room.model';
import { ThemingService } from '../shared/_theme/theme.service';

@Component({
  selector: 'app-greenroom',
  templateUrl: './greenroom.component.html',
  styleUrls: ['./greenroom.component.scss']
})
export class GreenRoomComponent extends RoomBaseComponent {

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

      const room = this.sharedService.virtualEventUser.VirtualEvent.Rooms.find(x => x.RoomType === RoomType.GreenRoom);

      if (!room) {
        this.noRoomAccess = true;
        return;
      }

      this.getRoomData(room.VirtualEventRoomId, () => { });
      this.subscribeRoomUpdate(room);
    }
  }
}
