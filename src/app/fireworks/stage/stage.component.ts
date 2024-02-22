import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { UserIdleService } from 'angular-user-idle';
import { CalendarPipe } from 'ngx-moment';
import { MessageService } from '../../shared/services/message.service';
import { RoomType } from '../models/virtualevent.room.model';
import { SharedFireworksComponentService } from '../services/shared.service';
import { VirtualEventService } from '../services/virtualevent.service';
import { RoomBaseComponent } from '../shared/roombase.component';
import { ThemingService } from '../shared/_theme/theme.service';

@Component({
  selector: 'fireworks-stage',
  templateUrl: './stage.component.html',
  styleUrls: ['./stage.component.scss']
})
export class StageComponent extends RoomBaseComponent {

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

  ngOnInit(): void {

    if (this.validatePermissionAndInitializeData()) {

      const room = this.sharedService.virtualEventUser.VirtualEvent.Rooms.find(x => x.RoomType == RoomType.Stage); // TODO

      if (!room) {
        this.noRoomAccess = true;
        return;
      }
      this.getRoomData(room.VirtualEventRoomId, () => { });
      this.subscribeSurveyUpdate(room);
      this.subscribeRoomUpdate(room);

    }
  }
}


