import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { UserIdleService } from 'angular-user-idle';
import { CalendarPipe } from 'ngx-moment';
import { MessageService } from '../../shared/services/message.service';
import { RoomType, VideoSource, VirtualEventRoomModel } from '../models/virtualevent.room.model';
import { SharedFireworksComponentService } from '../services/shared.service';
import { VirtualEventService } from '../services/virtualevent.service';
import { RoomBaseComponent } from '../shared/roombase.component';
import { takeUntil } from 'rxjs/operators';
import { ThemingService } from '../shared/_theme/theme.service';
import { Subject } from 'rxjs';
import { StatusCode } from 'src/app/shared/models/api.response.model';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'fireworks-reception',
  templateUrl: './reception.component.html',
  styleUrls: ['./reception.component.scss']
})
export class ReceptionComponent extends RoomBaseComponent {

  displayedScheduleColumns: string[] = ['Title', 'StartDateUtc', 'EndDateUtc', 'RoomType', 'Action'];

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
      const room = this.sharedService.virtualEventUser.VirtualEvent.Rooms.find(x => x.RoomType === RoomType.Reception); // TODO

      if (!room) {
        this.noRoomAccess = true;
        return;
      }

      if (this.sharedService.boothLoaded) {
        this.getRoomData(room.VirtualEventRoomId, () => {
          if (this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)) {
            this.roomData.IsEnabled = true;
          }
          this.sharedService.currentRoomData = this.roomData;
          this.sharedService.enableChatRoom = this.roomData.IsEnabled;
        });
      } else {

        const eventId = this.sharedService.virtualEventUser.VirtualEvent.EventId.toString();
        this.virtualEventService.getEventUserDetail(eventId, true).pipe(takeUntil(this.unsubscribeAll)).subscribe((d) => {
          if (!d || d.StatusCode === StatusCode.Error || d.StatusCode === StatusCode.BadRequest) {
            this.messageService.showErrorMessage(
              'An error occurred while fetching the event data'
            );
            return;
          }
          if (d.StatusCode === StatusCode.Ok) {
            const data = d.Data;
            if (data.VirtualEvent) {
              this.sharedService.virtualEventUser = data;
              this.getRoomData(room.VirtualEventRoomId, () => {
                if (this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)) {
                  this.roomData.IsEnabled = true;
                }
                this.sharedService.currentRoomData = this.roomData;
                this.sharedService.enableChatRoom = this.roomData.IsEnabled;
              });
            }
          }
        },
          (error) => {
            this.userAllowed = false;
          }
        );
      }

      this.subscribeSurveyUpdate(room);
      this.subscribeRoomUpdate();
    }
  }

  whenLobbyHasData(): void {
    this.noRoomAccess = false;
  }
}



