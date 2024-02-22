import { Directive, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MessageService } from '../../shared/services/message.service';
import { SharedFireworksComponentService } from '../services/shared.service';
import { MediaType, RoomBaseAction, RoomType, VideoSource, VirtualEventPrivateRoomModel, VirtualEventRoomModel } from '../models/virtualevent.room.model';
import { RtmClient, RtmChannel, RtmMessage, RtmTextMessage } from '../models/rtm.model';
import { Subject } from 'rxjs';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { takeUntil } from 'rxjs/operators';
import { FwRoomComponent } from './fw-room/fw-room.component';
import { MatDialog } from '@angular/material/dialog';
import { VirtualEventService } from '../services/virtualevent.service';
import { PollDialogComponent } from './poll-dialog/poll-dialog.component';
import { Router } from '@angular/router';
import { BroadcastDataModel, UserNotificationModel } from '../models/common.model';
import { ThemingService } from './_theme/theme.service';

const autoJoin = 'autoJoin';

@Directive()
export abstract class RoomBaseComponent implements OnInit, OnDestroy {

  unsubscribeAll: Subject<any>;

  constructor(
    public dialog: MatDialog,
    public sharedService: SharedFireworksComponentService,
    public messageService: MessageService,
    public virtualEventService: VirtualEventService,
    public router: Router,
    public themeService: ThemingService
  ) {

    this.unsubscribeAll = new Subject();

    this.checkAndGetUserBreakoutRoom();
    this.sharedService.onBreakoutRoomOpen.pipe(takeUntil(this.unsubscribeAll))
      .subscribe((breakoutRoom: VirtualEventPrivateRoomModel) => {
        if (breakoutRoom && this.roomData.RoomType !== RoomType.Breakout) {
          this.navigateToBreakoutRoom(breakoutRoom);
        }
      });

    this.sharedService.onGetAttendeeRoomName.pipe(takeUntil(this.unsubscribeAll)).subscribe((data: any) => {
      if (data && data.MemberIds.length > 0) {
        const memberId = data.MemberIds.find((x: number) => x === this.sharedService.virtualEventUser.VirtualEventUserId);
        if (memberId) {
          this.sendAttendeeRoomName(data.RequestBy);
        }
      }
    });

    this.sharedService.rtmClient.on('MessageFromPeer', (message: RtmTextMessage, remoteUserId, messagePros) => {
      var messageData = message.text.split('~');
      if (messageData[0] == this.sharedService.moveAttendee) {
        localStorage.setItem(autoJoin, JSON.stringify({ reloadCount: 0 }));
        var roomData = JSON.parse(messageData[1]);
        if (this.roomData) {
          if (roomData.RoomId > 0 && this.roomData.RoomName.toLowerCase() !== roomData.RoomName.toLowerCase()) {
            if (this.fwRoom) { // in case user is connected.
              this.fwRoom.leaveAllClients().then(() => {
                this.moveAttendeeToAnotherRoom(roomData.RoomType, roomData.RoomName, roomData.RoomId, true);
              }, (reason: any) => {
                this.messageService.showErrorMessage("Please refresh and join again as there was an issue.")
              });
            } else {
              this.moveAttendeeToAnotherRoom(roomData.RoomType, roomData.RoomName, roomData.RoomId, false);
            }
          }
        } else {
          this.moveAttendeeToAnotherRoom(roomData.RoomType, roomData.RoomName, roomData.RoomId, false);
        }
      }
    })

    // this.sharedService.onMoveAttendeeList.pipe(takeUntil(this.unsubscribeAll)).subscribe((moveAttendee: any) => {
    //   if (this.roomData) {
    //     if (moveAttendee.RoomId > 0 && this.roomData.RoomName.toLowerCase() !== moveAttendee.RoomName.toLowerCase()) {
    //       if (this.fwRoom) { // in case user is connected.
    //         this.fwRoom.leaveAllClients().then(() => {
    //           this.moveAttendeeToAnotherRoom(moveAttendee.RoomType, moveAttendee.RoomName, moveAttendee.RoomId,
    //             this.sharedService.roomClientConnected);
    //         }, (reason: any) => {
    //           this.messageService.showErrorMessage("Please refresh and join again as there was an issue.")
    //         });
    //       } else {
    //         this.moveAttendeeToAnotherRoom(moveAttendee.RoomType, moveAttendee.RoomName, moveAttendee.RoomId,
    //           this.sharedService.roomClientConnected);
    //       }
    //     }
    //   } else {
    //     this.moveAttendeeToAnotherRoom(moveAttendee.RoomType, moveAttendee.RoomName, moveAttendee.RoomId,
    //       this.sharedService.roomClientConnected);
    //   }
    // });

    this.sharedService.onMessageBroadcastToRooms.pipe(takeUntil(this.unsubscribeAll)).subscribe((data: any) => {
      if (data) {
        if (data.MessageType === 'event') {
          this.messageService.showSuccessMessage(data.Notification);
          this.sharedService.refreshNotificationsData(true);
        } else if (data.RoomIds.indexOf(this.roomData.VirtualEventRoomId) !== -1) {
          this.messageService.showSuccessMessage(data.Notification);
          const notification = {
            NotificationContent: data.Notification,
            NotificationSentByUserId: data.NotificationSentByUserId,
            NotificationSentForUserId: this.sharedService.virtualEventUser.VirtualEventUserId,
            NotificationType: 'publicmessage',
            VirtualEventId: data.VirtualEventId
          } as UserNotificationModel;
          this.virtualEventService.addUserNotification(notification).subscribe(res => {
            if (res.Data) {
              this.sharedService.refreshNotificationsData(true);
            }
          });
        }
      }
    });
  }

  domainUrl = environment.domainUrl;
  roomData: VirtualEventRoomModel;
  rtmClient: RtmClient;
  signalingClientChannel: RtmChannel;
  resourcesLoading: boolean;
  userAllowed = true;
  roomId = 0;
  noRoomAccess: boolean;
  errorWhileRoomDataLoading = false;
  roomCountdown = 0;
  roomCountdownFormat = 'h\'h\':m\'m\':s\'s\'';

  @ViewChild(FwRoomComponent) fwRoom: FwRoomComponent;

  navigateToBreakoutRoom(breakoutRoom: VirtualEventPrivateRoomModel): void {
    if (this.roomData) {
      if (this.roomData.RoomType === RoomType.Breakout
        && this.roomData.VirtualEventRoomId === breakoutRoom.VirtualEventPrivateRoomId) {
        return;
      }
      if (this.fwRoom) {
        this.sharedService.autoJoin = this.sharedService.roomClientConnected;
        this.sharedService.roomClientConnected = false;
      }
      const url = `/fireworks/${this.sharedService.virtualEventUser.VirtualEvent.EventId}/${this.sharedService.virtualEventUser.EventAccessToken}/breakout/${this.roomData.VirtualEventRoomId}/${breakoutRoom.RoomName.toLowerCase().replace(/ /g, '-')}/${breakoutRoom.VirtualEventPrivateRoomId}`;
      this.router.navigate([url]);
    }
  }

  abstract ngOnInit(): void;

  ngOnDestroy(): void {
    if (this.fwRoom) {
      this.fwRoom.leaveAllClients().then(() => {
        this.sharedService.roomClientConnected = false;
      }, (reason: any) => {
        this.messageService.showErrorMessage("Please refresh and join again as there was an issue.")
      });
    }
    // Unsubscribe from all subscriptions
    if (this.unsubscribeAll) {
      this.unsubscribeAll.next();
      this.unsubscribeAll.complete();
    }
  }

  validatePermissionAndInitializeData(): boolean {

    try {

      if (this.sharedService.virtualEventUser) {

        if (this.sharedService.virtualEventUser.VirtualEvent) {

          if (!this.sharedService.virtualEventUser.VirtualEvent.Rooms
            || this.sharedService.virtualEventUser.VirtualEvent.Rooms.length === 0) {
            this.messageService.showErrorMessage('Sorry! No Rooms available.');
            return;
          }
          return true;
        }
      }
    } catch (e) { }
  }

  getRoomData(roomId: number, callback: Function): void {

    this.errorWhileRoomDataLoading = false;
    this.resourcesLoading = true;
    this.sharedService.roomIdForPageReloadComparision = roomId;

    //auto join user after move.
    var reload = localStorage.getItem(autoJoin);
    if (reload) {
      let reloadCount = JSON.parse(reload).reloadCount;
      if (reloadCount == 0) {
        localStorage.setItem(autoJoin, JSON.stringify({ reloadCount: 1 }));
      } else {
        this.sharedService.autoJoin = true;
        localStorage.removeItem(autoJoin);
      }
    }

    this.virtualEventService.getEventRoomDetail(this.sharedService.virtualEventUser.VirtualEvent.EventId, roomId)
      .pipe(takeUntil(this.unsubscribeAll)).subscribe(rd => {
        if (rd && rd.Data) {
          this.roomData = rd.Data;
          // Notify to all user
          this.setMemberRoomName();
          document.documentElement.style.setProperty('--theme-color', this.roomData.BoardBackgroundColor ? this.roomData.BoardBackgroundColor : this.sharedService.virtualEventUser.VirtualEvent.BoardBackgroundColor);
          this.themeService.setColorTheme(this.roomData.BoardBackgroundColor
            ? this.roomData.BoardBackgroundColor : this.sharedService.virtualEventUser.VirtualEvent.BoardBackgroundColor);

          if (this.roomData.RoomType !== RoomType.Breakout
            && !this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)) {
            this.checkAndGetUserBreakoutRoom();
          }

          this.roomId = this.roomData.VirtualEventRoomId;

          const eventMember = this.sharedService.eventMembers
            .find(x => x.VirtualEventUserId === this.sharedService.virtualEventUser.VirtualEventUserId.toString());
          if (eventMember) {
            eventMember.CurrentRoom = this.roomData.RoomName;
          }

          if (this.roomData.VirtualEventPolls && this.roomData.VirtualEventPolls.length > 0) {

            this.roomData.VirtualEventPolls.forEach(poll => {
              const startDateTimestamp = Date.parse(moment.utc(poll.StartDateUtc).local().format());
              const duration = (new Date(startDateTimestamp)).valueOf() - (new Date()).valueOf();
              poll.UserId = this.sharedService.virtualEventUser.VirtualEventUserId;
              if (poll.DisplayNow === true) {
                this.openPollDialog(poll);
              } else {
                setTimeout(() => this.openPollDialog(poll), duration);
              }
            });
          }

          this.roomData.RoomChannelName = 'fireworks.room.' + this.roomData.StreamId;
          this.sharedService.setRoomData(this.roomData);

          if (this.roomData.FirstScheduleStartDateUtc
            && !this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)) {

            // Check if schedule started
            var countdownData = this.sharedService.getScheduleCountDown(this.roomData.FirstScheduleStartDateUtc);
            this.roomCountdownFormat = countdownData.format;
            this.roomCountdown = countdownData.countdown;

            if (this.roomCountdown > 0) {
              if (this.fwRoom) {
                this.fwRoom.leaveAllClients().then(() => {
                  this.sharedService.roomClientConnected = false;
                }, (reason: any) => {
                  this.messageService.showErrorMessage("Please refresh and join again as there was an issue.")
                });
              }
              this.resourcesLoading = false;
              callback(this);
              return true;
            }
          } else {
            this.roomCountdown = 0;
          }

          if (this.roomData.VideoSource && this.roomData.VideoSource.toLowerCase() !== VideoSource.Eventcombo && this.roomData.MediaType.toLowerCase() != 'image') {
            this.sharedService.enableChatRoom = true;
            this.sharedService.selectedTab = 'Chat';
          } else if (!this.sharedService.autoJoin && !this.sharedService.roomClientConnected) {
            if (this.fwRoom) {
              this.fwRoom.leaveAllClients().then(() => {
                this.sharedService.roomClientConnected = false;
              }, (reason: any) => {
                this.messageService.showErrorMessage("Please refresh and join again as there was an issue.")
              });
            }
            this.sharedService.enableChatRoom = false;
            this.sharedService.selectedTab = 'Schedule';
          }

          // this code will run when we change the video source from backend.
          if ((this.roomData.VideoSource && this.roomData.VideoSource.toLowerCase() !== VideoSource.Eventcombo
            || this.roomData.MediaType && this.roomData.MediaType.toLowerCase() === 'image')
            && this.fwRoom && this.sharedService.roomClientConnected) {
            if (this.sharedService.roomClientConnected) {
              this.sharedService.autoJoin = true;
            } else {
              this.sharedService.autoJoin = false;
            }
            this.fwRoom.leaveAllClients(true).then(() => {
              this.sharedService.roomClientConnected = false;
            }, (reason: any) => {
              this.messageService.showErrorMessage("Please refresh and join again as there was an issue.")
            });
          } else if (this.roomData.VideoSource && this.roomData.VideoSource.toLowerCase() === VideoSource.Eventcombo
            && this.roomData.MediaType && this.roomData.MediaType.toLowerCase() === MediaType.Video && this.fwRoom) {
            if (this.sharedService.autoJoin && !this.sharedService.roomClientConnected && (this.fwRoom.currentSchedule || this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser))) {
              this.fwRoom.enableToJoinRTMChannel();
            }
          }

          this.resourcesLoading = false;

          callback(this);
        } else {
          this.resourcesLoading = false;
          this.roomData = null;
          this.sharedService.currentRoomData = null;
          this.noRoomAccess = true;
          this.sharedService.clearPeopleDataWhenNoRoomAccess();
          this.sharedService.setRoomData(this.roomData);
          this.fwRoom?.leaveAllClients().then(() => {
            this.sharedService.roomClientConnected = false;
          }, (reason: any) => {
            this.messageService.showErrorMessage("Please refresh and join again as there was an issue.")
          });
        }
      }, error => {
        this.resourcesLoading = false;
        this.errorWhileRoomDataLoading = true;
        this.roomData = null;
        this.sharedService.currentRoomData = null;
        this.sharedService.setRoomData(this.roomData);
      });
  }

  openPollDialog(obj: any): void {
    const dialogRef = this.dialog.open(PollDialogComponent, {
      width: '450px',
      data: obj,
      hasBackdrop: true,
      disableClose: obj.IsRequired ? true : false,
    });
  }

  subscribeRoomUpdate(virtualEventRoom: VirtualEventRoomModel = null): void {

    const roomIdForComparision = this.sharedService.roomIdForPageReloadComparision;
    this.sharedService.onRoomDataUpdate.pipe(takeUntil(this.unsubscribeAll)).subscribe(rmd => {

      if (roomIdForComparision === rmd.VirtualEventRoomId) {
        this.getRoomData(rmd.VirtualEventRoomId, () => {
          if(this.roomData && this.roomData.RoomType == RoomType.Reception){
            this.sharedService.enableChatRoom = true;
          }
        });
      }
    });
  }

  subscribeSurveyUpdate(virtualEventRoom: VirtualEventRoomModel = null): void {

    if (!virtualEventRoom || !this.sharedService) {
      return;
    }

    const roomIdForComparision = this.sharedService.roomIdForPageReloadComparision;

    this.sharedService.onSurveyAdd.pipe(takeUntil(this.unsubscribeAll)).subscribe(res => {

      if (res && res.Question && res.VirtualEventRoomId && res.VirtualEventRoomId === roomIdForComparision && res.ExpiryDate) {
        const expireDateTimestamp = Date.parse(moment.utc(res.ExpiryDate).local().format());
        const currentDateTimestamp = Date.parse((new Date()).toString());
        if (expireDateTimestamp > currentDateTimestamp || res.PushResult) {
          res.VirtualEventUserId = this.sharedService.virtualEventUser.VirtualEventUserId;
          this.virtualEventService
            .getEventPollDetail(res.VirtualEventPollId, res.VirtualEventRoomId, res.VirtualEventUserId, res.PushResult)
            .pipe(takeUntil(this.unsubscribeAll)).subscribe(poll => {
              if (poll && poll.Data) {
                if (res.PushResult || res.DisplayNow === true) {
                  this.openPollDialog(res);
                } else {
                  const duration = (new Date(res.StartDateUtc)).valueOf() - (new Date()).valueOf();
                  setTimeout(() => this.openPollDialog(res), duration);
                }
              }
            });
        }
      }
    });
  }

  sendAttendeeRoomName(requestedBy: number): void {
    const data = new BroadcastDataModel();
    data.UserIds = [requestedBy];
    data.VirtualEventId = this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId;
    data.DataType = RoomBaseAction.SetRoomName;
    data.Data = {
      RoomName: this.roomData.RoomName,
      ActionName: RoomBaseAction.SetRoomName,
      MemberId: this.sharedService.virtualEventUser.VirtualEventUserId
    };
    this.virtualEventService.broadcastClientDataToEventClients(data).pipe(takeUntil(this.unsubscribeAll)).subscribe(res => {

    });
  }

  moveAttendeeToAnotherRoom(roomType: string, roomName: string, roomId: number, lastRoomJoined: boolean): void {
    let url = this.sharedService.getJoinRoomUrl(roomType, roomName, roomId);
    if (lastRoomJoined) {
      this.sharedService.autoJoin = true;
    }
    else {
      this.sharedService.autoJoin = false;
    }
    this.sharedService.roomClientConnected = false;
    this.router.navigate([url]).then(() => {
      window.location.reload();
    });
  }

  checkAndGetUserBreakoutRoom(): void {
    this.virtualEventService.checkAndGetUserBreakoutRoom(this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId)
      .pipe(takeUntil(this.unsubscribeAll)).subscribe(breakoutRoom => {
        if (breakoutRoom.Data) {
          this.navigateToBreakoutRoom(breakoutRoom.Data);
        }
      });
  }

  // Sent the notification to all user regarding the room
  setMemberRoomName(): void {
    try {
      if (this.roomData.RoomType !== RoomType.Handouts) {
        const memberIds = this.sharedService.eventMembers
          .filter(z => z.VirtualEventUserId !== this.sharedService.virtualEventUser.VirtualEventUserId.toString()
            && this.sharedService.isHostOrCoHost(z)).map(x => parseInt(x.VirtualEventUserId, 10));
        const data = new BroadcastDataModel();
        data.UserIds = memberIds;
        data.VirtualEventId = this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId;
        data.DataType = RoomBaseAction.SetRoomName;
        data.Data = {
          RoomName: this.roomData.RoomName,
          ActionName: RoomBaseAction.GetRoomName,
          MemberId: this.sharedService.virtualEventUser.VirtualEventUserId
        };
        if (memberIds.length > 0) {
          this.virtualEventService.broadcastClientDataToEventClients(data).pipe(takeUntil(this.unsubscribeAll)).subscribe(() => {
          });
        }
      }
    } catch (e) {
      console.error('Set room name: -', e);
    }
  }

}
