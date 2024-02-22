import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { UserIdleService } from 'angular-user-idle';
import { CountdownComponent } from 'ngx-countdown';
import { CalendarPipe } from 'ngx-moment';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'src/app/shared/services/message.service';
import { RoomType, VirtualEventPrivateRoomModel, VirtualEventRoomModel } from '../../models/virtualevent.room.model';
import { SharedFireworksComponentService } from '../../services/shared.service';
import { VirtualEventService } from '../../services/virtualevent.service';
import { RoomBaseComponent } from '../../shared/roombase.component';
import { ThemingService } from '../../shared/_theme/theme.service';

@Component({
  selector: 'app-join-breakout',
  templateUrl: './join-breakout.component.html',
  styleUrls: ['./join-breakout.component.scss']
})
export class JoinBreakoutComponent extends RoomBaseComponent implements OnInit {

  @ViewChild('cd', { static: false }) private countdown: CountdownComponent;
  roomCloseFormat = 'h\'h\':m\'m\':s\'s\'';
  constructor(public route: ActivatedRoute,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public titleService: Title,
    public virtualEventService: VirtualEventService,
    public messageService: MessageService,
    public amCalendar: CalendarPipe,
    public userIdle: UserIdleService,
    public sharedService: SharedFireworksComponentService,
    public router: Router,
    public themeService: ThemingService) {
    super(dialog, sharedService, messageService, virtualEventService, router, themeService);
  }
  showCountdown = false;
  participentsIds = "";
  ngOnInit() {
    try {
      this.roomId = this.route.snapshot.params["{roomid}"];
      if (this.roomId) {
        this.titleService.setTitle('Eventcombo Fireworks - ' + RoomType.Breakout);
        if (this.validatePermissionAndInitializeData()) {
          if (this.sharedService.virtualEventUser && this.sharedService.virtualEventUser.VirtualEvent) {
            this.virtualEventService.getBreakoutRoomDetail(this.roomId).pipe(takeUntil(this.unsubscribeAll)).subscribe(rd => {
              this.resourcesLoading = false;
              if (rd && rd.Data) {
                if (rd.Data.IsRoomOpen && rd.Data.ParticipantIds.indexOf(this.sharedService.virtualEventUser.VirtualEventUserId.toString()) != -1
                  || this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)) {
                  let roomData = {
                    VirtualEventRoomId: rd.Data.VirtualEventPrivateRoomId,
                    AllowGroupChat: true,
                    AllowGuestInvite: rd.Data.AllowGuestInvite,
                    AllowHandouts: rd.Data.AllowHandouts,
                    AllowOneToOneNetworking: true,
                    AllowPollsAndSurvey: rd.Data.AllowPollsAndSurvey,
                    AllowPrivateChat: true,
                    AllowRecording: rd.Data.AllowRecording,
                    RoomName: rd.Data.RoomName,
                    StreamId: rd.Data.StreamId,
                    RoomType: RoomType.Breakout,
                    MediaType: 'video',
                    VideoSource: 'eventcombo',
                    EnableAttendeeView: true,
                    RoomCloseCountDown: rd.Data.RoomCloseCountDownTime,
                    RoomEndTime: rd.Data.RoomEndTime,
                    IsEnabled: true
                  } as VirtualEventRoomModel;
                  this.roomData = roomData;

                  document.documentElement.style.setProperty('--theme-color', this.roomData.BoardBackgroundColor ? this.roomData.BoardBackgroundColor : this.sharedService.virtualEventUser.VirtualEvent.BoardBackgroundColor);
                  if (rd.Data.RoomParticipants) {
                  }
                  this.resourcesLoading = false;
                  this.sharedService.setRoomChannelName(this.roomData);
                  this.sharedService.setRoomData(this.roomData);
                } else
                  this.sendAttendeeBackToMainRoom();

                if (this.roomData) {
                  setTimeout(() => {
                    this.sendAttendeeBackToMainRoom();
                  }, this.roomData.RoomEndTime * 60000);
                }
              }
            }, error => {
              this.userAllowed = false;
            });
          }
          else {
            this.messageService.showErrorMessage('Sorry! An error occurred while loading event infomration.')
          }

          this.sharedService.onBreakoutRoomOpen.pipe(takeUntil(this.unsubscribeAll)).subscribe((breakoutRoom: VirtualEventPrivateRoomModel) => {
            if (this.roomData.VirtualEventRoomId == breakoutRoom.VirtualEventPrivateRoomId) {
              this.showCountdown = false;
              if (this.countdown)
                this.countdown.stop();
            }
          });
        }
      }
    } catch (e) {

    }

    this.sharedService.onBreakoutRoomClose.pipe(takeUntil(this.unsubscribeAll)).subscribe((breakoutRoom: VirtualEventPrivateRoomModel) => {
      var isParticipent = (this.participentsIds.indexOf(this.sharedService.virtualEventUser.VirtualEventUserId.toString()) != -1);
      if (!isParticipent && this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)) {
        if (breakoutRoom.VirtualEventPrivateRoomId == this.roomData.VirtualEventRoomId) {
          this.sendAttendeeBackToMainRoom();
        }
      }
      else {
        this.roomCloseFormat = this.sharedService.getCountdownFormat(this.roomData.RoomCloseCountDown * 1000);
        this.showCountdown = true;
      }
    });

    this.sharedService.onMessageBroadcastToBreakoutRoom.pipe(takeUntil(this.unsubscribeAll)).subscribe(data => {
      var roomExists = data.roomIds.find((x: number) => x == this.roomId);
      if (roomExists)
        this.messageService.showSuccessMessage(data.message);
    })
  }

  onCountdownFinish(e: any) {
    if (e) {
      this.sendAttendeeBackToMainRoom();
    }
  }


  sendAttendeeBackToMainRoom() {
    var refRoomId = this.route.snapshot.params["{refRoomId}"];
    if (refRoomId) {
      this.virtualEventService.getEventRoomDetail(this.sharedService.virtualEventUser.VirtualEvent.EventId, refRoomId).pipe(takeUntil(this.unsubscribeAll)).subscribe(res => {
        var roomData = res.Data;
        if (roomData) {
          this.sharedService.roomClientConnected = false;
          this.moveAttendeeToAnotherRoom(roomData.RoomType, roomData.RoomName, roomData.VirtualEventRoomId, this.sharedService.autoJoin);
        }
      });
    }
  }

}
