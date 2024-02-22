 // tslint:disable: triple-equals
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UserIdleService } from 'angular-user-idle';
import { CalendarPipe } from 'ngx-moment';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from '../../shared/services/message.service';
import { SharedFireworksComponentService } from '../services/shared.service';
import { VirtualEventService } from '../services/virtualevent.service';
import { RoomBaseComponent } from '../shared/roombase.component';
import { ThemingService } from '../shared/_theme/theme.service';

@Component({
  selector: 'join-session',
  templateUrl: './join-room.component.html',
  styleUrls: ['./join-room.component.scss']
})
export class JoinRoomComponent extends RoomBaseComponent implements OnInit {

  constructor(
    public route: ActivatedRoute,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public titleService: Title,
    public virtualEventService: VirtualEventService,
    public messageService: MessageService,
    public amCalendar: CalendarPipe,
    public userIdle: UserIdleService,
    public sharedService: SharedFireworksComponentService,
    public router: Router,
    public themeService: ThemingService
  ) {
    super(dialog, sharedService, messageService, virtualEventService, router, themeService);
    this.route.params.pipe(takeUntil(this.unsubscribeAll)).subscribe((params: Params) => {
       this.ngOnInit();  // no impact as per my testing || room data called twice || because of this loading poll twice in expo ansd session
    });
  }

  ngOnInit(): void {

    if (this.validatePermissionAndInitializeData()) {

      this.roomId = this.route.snapshot.params['{roomid}'];

      if (this.roomId) {

        this.getRoomData(this.roomId, () => {
          this.subscribeSurveyUpdate(this.roomData);
        });

        this.sharedService.onBoothUpdate.pipe(takeUntil(this.unsubscribeAll)).subscribe(booth => {
          if (this.roomId == booth.BoothId) {
            this.getRoomData(this.roomId, () => { });
          }
        });
      }
    }
  }
}
