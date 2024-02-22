// tslint:disable: triple-equals
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterEvent } from '@angular/router';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import AgoraRTC from 'agora-rtc-sdk-ng';
import * as RtmService from 'agora-rtm-sdk';
import { UserIdleService } from 'angular-user-idle';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../environments/environment';
import { StatusCode } from '../shared/models/api.response.model';
import { MessageService } from '../shared/services/message.service';
import { CreateBreakoutRoomComponent } from './breakout/create-breakout-room/create-breakout-room.component';
import { BroadcastDataModel, ConfirmDialogComponentData, DialogAudioVideoData, Entry, TimeSpan, UserNotificationModel, EnumerationTrackingActivityType } from './models/common.model';
import { MemberAttributes, RtmChannel, RtmClient } from './models/rtm.model';
import { BreakoutRoomModel, RoomBaseAction, RoomType, EventcomboAction } from './models/virtualevent.room.model';
import { SharedFireworksComponentService } from './services/shared.service';
import { VirtualEventService } from './services/virtualevent.service';
import { HandoutsDialogComponent } from './shared/handouts-dialog/handouts-dialog.component';
import { SilentAuctionComponent } from './shared/silent-auction/silent-auction.component';
import { NotificationsDialogComponent } from './shared/notifications-dialog/notifications-dialog.component';
import { UserinfoDialogComponent } from './shared/userinfo-dialog/userinfo-dialog.component';
import { UserIdleDialogComponent } from './shared/user-idle-dialog/user-idle-dialog.component';
import { ManageAttendeeComponent } from './manage-attendee/manage-attendee.component';
import { EnumerationFeatures, EnumerationUserRole, MoveWaitRoomModel } from './models/virtualevent.user.model';
import { MatMenuTrigger } from '@angular/material/menu';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';
import { ThemingService } from './shared/_theme/theme.service';
import { MediaInfoService } from './services/media-info-service';
import { MediaSettingDialogComponent } from './shared/media-setting-dialog/media-setting-dialog.component';

@Component({
  selector: 'fireworks',
  templateUrl: './fireworks.component.html',
  styleUrls: ['./fireworks.component.scss']
})
export class FireworksComponent implements OnInit, AfterViewInit {
  constructor(
    public router: Router,
    public activeRoute: ActivatedRoute,
    public titleService: Title,
    public messageService: MessageService,
    public virtualEventService: VirtualEventService,
    public sharedService: SharedFireworksComponentService,
    public dialog: MatDialog,
    public userIdle: UserIdleService,
    public renderer: Renderer2, public mediaInfoService: MediaInfoService
  ) {
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((e: RouterEvent) => {
      this.navigationInterceptor(e);
    });

    const routeName = this.router.url.split('/').pop();
    const lobby = routeName == 'reception' || routeName == 'lobby';
    if (lobby) {
      this.loadBoothData = true;
      this.sharedService.boothLoaded = true;
    }
  }
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  domainURl = environment.domainUrl;
  destroy$ = new Subject();
  resourcesLoading = true;
  customRoomFilterargs = { roomType: 'customroom' };
  eventId: number;
  eventAccessToken: string;
  userAllowed: boolean = null;
  notificationMessages: UserNotificationModel[] = [];
  rtmClient: RtmClient;
  rtmChannel: RtmChannel;

  showAlertBox = false;
  rightSidebarTabIndex = 0;
  hubConnection: HubConnection;
  totalNotifications: number;
  privateMessageMembers = [];
  idealTimeoutInterval: any;

  enumerationFeatures: any = EnumerationFeatures;
  adminRoomName = 'War Room';

  userIdealDialogDisplaying = false;
  chatToggle: boolean;
  sidebarExpended: boolean;

  disableDuringAction = false;
  showChat: boolean = false;
  enumerationUserRole = EnumerationUserRole;
  loadBoothData = false;

  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: Event): boolean {
    if (this.rtmClient) {
      this.rtmClient.logout();
    }
    return true;
  }

  checkToOpenMediaTestPopupBeforeJoin(): void {
    var mediaSettings = this.mediaInfoService.getMediaSettingFromLocalStorage();
    if (!mediaSettings) {
      this.openAudioVideoSettingPopup();
    }
  }

  ngOnInit(): void {
    this.chatToggle = true;
    window.ononline = () => { this.messageService.showSuccessMessage('Back Online'); };

    this.resourcesLoading = true;
    setTimeout(() => {
      this.resourcesLoading = false;
    }, 15000);


    setTimeout(() => {
      if (this.rtmClient) {
        this.rtmClient.logout();
        window.location.reload();
      }
    }, 1000 * 60 * 400); // Max 400 Minutes

    this.handleUserIdeal();

    this.eventId = parseInt(this.activeRoute.snapshot.paramMap.get('{eventId}'), 10);
    this.eventAccessToken = this.activeRoute.snapshot.paramMap.get('{eventAccessToken}');
    if (this.eventId && this.eventAccessToken) {
      let browserSessionId = window.sessionStorage.getItem('browserSessionId');
      if (!browserSessionId) {
        browserSessionId = uuidv4();
        window.sessionStorage.setItem('browserSessionId', browserSessionId);
      }
      this.virtualEventService.setEventAccessToken(this.eventAccessToken);
      this.virtualEventService.setBrowserSessionId(browserSessionId);
      this.sharedService.userUniqueAccessToken = this.eventAccessToken;
      this.sharedService.userUniqueSessionId = browserSessionId;
      this.notifyServerAboutClientLoginAndHubDataUpdate(
        this.eventAccessToken,
        browserSessionId
      );
    } else {
      this.messageService.showErrorMessage('invalid link');
    }

    this.sharedService.onRejoinFromWaitRoom.pipe(takeUntil(this.destroy$)).subscribe((waitRoomData: any) => {
      if (waitRoomData.IsAllowedToJoinRoom != null && !waitRoomData.IsAllowedToJoinRoom) {
        this.messageService.showErrorMessage('Host/Cohost reject your request');
        return;
      }
      if (waitRoomData) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          data: {
            Title: 'Please confirm',
            Message: waitRoomData.MemberName + ' want\'s to join ' + waitRoomData.RoomName,
            CancelText: 'Decline',
            OkText: 'Accept'
          } as ConfirmDialogComponentData
        });

        dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
          if (result) {
            if (waitRoomData.MemberId > 0) {
              const data = new MoveWaitRoomModel();
              data.VirtualEventUserId = [waitRoomData.MemberId];
              data.RemoveBy = this.sharedService.virtualEventUser.VirtualEventUserId;
              data.RoomId = waitRoomData.RoomId;
              data.RoomName = waitRoomData.RoomName;
              data.IsAllowedToJoinRoom = true;
              data.VirtualEventId = this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId;
              this.virtualEventService.moveToWaitRoom(data).pipe(takeUntil(this.destroy$)).subscribe(res => {

              }, error => {
                console.log(error);
              });
            }
          }
          else {
            if (waitRoomData.MemberId > 0) {
              const data1 = new BroadcastDataModel();
              data1.UserIds = [waitRoomData.MemberId]; // broadcast to selected attendees only.
              data1.VirtualEventId = this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId;
              data1.DataType = RoomBaseAction.RejoinFromWaitRoom;
              data1.Data = {
                IsAllowedToJoinRoom: false, ActionName: RoomBaseAction.RejoinFromWaitRoom
              };

              this.virtualEventService.broadcastClientDataToEventClients(data1).pipe(takeUntil(this.destroy$)).subscribe(res => {

              });
            }
          }
        });
      }
    });
  }

  ngAfterViewInit(): void {
    this.openRightPannel();
  }

  getEventDetails(): void {

    this.virtualEventService.getEventUserDetail(this.eventId, this.loadBoothData).pipe(takeUntil(this.destroy$)).subscribe((d) => {
      if (!d || d.StatusCode == StatusCode.Error || d.StatusCode == StatusCode.BadRequest) {
        this.messageService.showErrorMessage(
          'An error occurred while fetching the event data'
        );
        return;
      }
      if (d.StatusCode == StatusCode.Ok) {
        const data = d.Data;
        if (data.VirtualEvent) {
          this.titleService.setTitle(
            'Fireworks - ' + data.VirtualEvent.EventTitle
          );
          if (
            !data.VirtualEvent.Rooms ||
            data.VirtualEvent.Rooms.length == 0
          ) {
            this.messageService.showErrorMessage('Sorry! No Rooms available.');
            this.resourcesLoading = false;
            return;
          }
          this.userAllowed = true;
          this.sharedService.virtualEventUser = data;
          const eventId = this.sharedService.virtualEventUser.VirtualEvent.EventId.toString();
          const virtualEventId = this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId;
          this.sharedService.virtualEventUser.VirtualEvent.EventChannelName = 'fireworks.' + eventId;
          this.getEventMembers();
          this.getAllowedUserFeatures();
          this.setLogUploadAgora();

          const rtmClient = RtmService.createInstance(environment.agora.appId, { enableLogUpload: false });
          rtmClient.login({ uid: this.sharedService.virtualEventUser.VirtualEventUserId.toString(), token: null })
            .then(() => {
              this.rtmClient = rtmClient;
              this.sharedService.rtmClient = rtmClient;
            }, (err) => {
              console.error(err);
              this.messageService.showErrorMessage('An error occurred while establishing connection with server. Please check your network connection.');
            });

          this.virtualEventService.getUserNotifications(virtualEventId, null, 0, 10, false)
            .pipe(takeUntil(this.destroy$))
            .subscribe((dt) => {
              if (dt && dt.Data) {
                this.notificationMessages = dt.Data.Data;
                this.totalNotifications =
                  dt.Data.Meta.TotalRecords;
              }
            });

          this.sharedService.refreshNotificationData$
            .pipe(takeUntil(this.destroy$))
            .subscribe((refresh) => {
              if (refresh) {
                this.virtualEventService.getUserNotifications(virtualEventId, null, 0, 10, false)
                  .pipe(takeUntil(this.destroy$))
                  .subscribe((dt) => {
                    if (dt && dt.Data) {
                      this.notificationMessages = dt.Data.Data;
                      this.totalNotifications =
                        dt.Data.Meta.TotalRecords;
                    }
                  });
              }
            });

          this.checkToOpenMediaTestPopupBeforeJoin();

          this.resourcesLoading = false;
          this.sharedService.saveFireworksActivity(this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId,
            this.sharedService.virtualEventUser.VirtualEventUserId, EnumerationTrackingActivityType.FireworksLogin, EnumerationTrackingActivityType.EntityNameVirtualEvent);
        }
      }
    },
      (error) => {
        this.userAllowed = false;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.rtmClient) {
      this.rtmClient.logout();
    }
    if (this.idealTimeoutInterval) {
      clearInterval(this.idealTimeoutInterval);
    }
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.resourcesLoading = true;
    }
    if (event instanceof NavigationEnd) {
      this.resourcesLoading = false;
    }
    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      this.resourcesLoading = false;
    }
    if (event instanceof NavigationError) {
      this.resourcesLoading = false;
    }
  }

  getRoomIconFromRoomType(roomType: RoomType): string {
    switch (roomType) {
      case RoomType.Reception: {
        return 'icon-Reception';
      }
      case RoomType.Stage: {
        return 'icon-Stage';
      }
      case RoomType.Networking: {
        return 'icon-Networking';
      }
      case RoomType.Session: {
        return 'icon-Sessions';
      }
      case RoomType.Expo: {
        return 'icon-Expo';
      }
      case RoomType.Keynote: {
        return 'icon-Keynote';
      }
      case RoomType.CustomRoom: {
        return 'icon-Custom-Room';
      }
      case RoomType.Handouts: {
        return 'icon-Handouts';
      }
      case RoomType.GreenRoom: {
        return 'icon-Green-Room';
      }
      default:
    }
  }


  getElapsedTime(entry: Entry): TimeSpan {
    let totalSeconds = Math.floor((entry.end.getTime() - entry.created.getTime()) / 1000);
    let days = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    if (totalSeconds >= 86400) {
      days = Math.floor(totalSeconds / 86400);
      totalSeconds -= 86400 * days;
    }
    if (totalSeconds >= 3600) {
      hours = Math.floor(totalSeconds / 3600);
      totalSeconds -= 3600 * hours;
    }
    if (totalSeconds >= 60) {
      minutes = Math.floor(totalSeconds / 60);
      totalSeconds -= 60 * minutes;
    }
    seconds = totalSeconds;
    return {
      days,
      hours,
      minutes,
      seconds
    };
  }

  checkCustomRoomExist(): boolean {
    const room = this.sharedService.virtualEventUser.VirtualEvent.Rooms
      .filter(r => r.RoomType.toLowerCase() == 'customroom' && r.IsEnabled);
    if (room.length > 0) {
      return true;
    }
    return false;
  }

  joinRoom(roomData): void {
    const url = `/fireworks/${this.sharedService.virtualEventUser.VirtualEvent.EventId}/${this.sharedService.virtualEventUser.EventAccessToken}/customroom/${roomData.RoomName.replace(/ /g, '-')}/${roomData.VirtualEventRoomId}/join`;
    this.router.navigate([url]);
  }

  notificationItemClick(notificatoin: UserNotificationModel): boolean {
    if (!notificatoin) {
      return false;
    }

    this.openNotificationsDialog();
  }

  private notifyServerAboutClientLoginAndHubDataUpdate = (accessToken: string, browserSessionId: string) => {

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(environment.apiBaseUrl + 'OnlineClientHub?accessToken=' + accessToken + '&browserSessionId=' + browserSessionId)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    if (this.hubConnection.state == HubConnectionState.Connected) {
      this.getEventDetails();
      return;
    }

    Object.defineProperty(WebSocket, 'OPEN', { value: 1 });

    this.hubConnection.start().then((d) => {
      this.getEventDetails();
    }).catch(error => console.log('signalR-error', error));

    this.hubConnection.on(EventcomboAction.PollData, (res) => {
      const surveyData = JSON.parse(res.toString());
      this.sharedService.addNewSurvey(surveyData);
    });

    this.hubConnection.on(EventcomboAction.BoothData, (rmd) => {
      const boothData = JSON.parse(rmd.toString());
      this.sharedService.updateBoothInfo(boothData);
    });

    this.hubConnection.on(EventcomboAction.RoomData, (res) => {
      const roomData = JSON.parse(res.toString());
      this.virtualEventService.getEventUserDetail(this.eventId, this.loadBoothData).pipe(takeUntil(this.destroy$)).subscribe(d => {
        this.sharedService.virtualEventUser = d.Data;
        this.sharedService.updateRoomInfo({ VirtualEventRoomId: roomData.VirtualEventRoomId });
      });
    });

    let lastClick = 0;
    const delay = 1500;
    this.hubConnection.on(EventcomboAction.EventConfig, (res) => {
      if (lastClick >= (Date.now() - delay)) {
        return;
      }
      lastClick = Date.now();
      console.log('EventConfig', res, new Date());
      const roomIds = JSON.parse(res.toString());
      this.virtualEventService.getEventUserDetail(this.eventId, this.loadBoothData).pipe(takeUntil(this.destroy$)).subscribe(d => {
        if (d.StatusCode == StatusCode.Ok) {
          this.sharedService.virtualEventUser = d.Data;
          localStorage.removeItem('autoJoin');
          if (roomIds) {
            roomIds.forEach((id: any) => {
              this.sharedService.updateRoomInfo({ VirtualEventRoomId: id });
            });
          }
          this.sharedService.updateEventInfo();
        }
      });
    });

    this.hubConnection.on(EventcomboAction.PurchaseTicket, (res) => {
      const attendeeList = JSON.parse(res.toString());
      if (attendeeList) {
        attendeeList.forEach(m => {
          const member = {
            VirtualEventUserId: m.VirtualEventUserId,
            FirstName: m.FirstName,
            LastName: m.LastName,
            // UserRole: m.UserRole,
            FullName: m.FirstName + ' ' + m.LastName,
            Alt: this.sharedService.getUserShortName(m.FirstName + ' ' + m.LastName),
            VirtualEventUserRoles: m.VirtualEventUserRoles
          } as MemberAttributes;
          this.sharedService.eventMembers.push(member);
        });
        this.sharedService.purchaseTicket(this.sharedService.eventMembers);
        this.sharedService.setPeoplesData();
      }
    });

    this.hubConnection.on(RoomBaseAction.OpenBreakoutRooms, (res) => {
      const breakout: BreakoutRoomModel = JSON.parse(res);
      this.sharedService.openBreakoutRooms(breakout);
    });

    this.hubConnection.on(RoomBaseAction.CloseBreakoutRooms, (res) => {
      const breakout: BreakoutRoomModel = JSON.parse(res);
      this.sharedService.closeBreakoutRooms(breakout);
    });

    this.hubConnection.on(RoomBaseAction.BroadcastMessageToBreakout, (res) => {
      const data = JSON.parse(res.toString());
      this.sharedService.broadcastMessageToBreakoutRooms(data);
    });

    this.hubConnection.on(EventcomboAction.PeopleUpdate, (res) => {
      this.getEventMembers();
    });

    this.hubConnection.on(RoomBaseAction.MoveAttendee, (res) => {
      const moveAttendeeList = JSON.parse(res.toString()); 
      this.sharedService.setMoveAttendee(moveAttendeeList);
    });

    this.hubConnection.on(RoomBaseAction.Kickout, (res) => {
      const data = JSON.parse(res.toString());   
      this.sharedService.removeFromRoom(data);
    });

    this.hubConnection.on(RoomBaseAction.GetRoomName, (res) => {
      const attendeeRoomList = JSON.parse(res.toString());
      this.sharedService.getAttendeeRoom(attendeeRoomList);
    });

    this.hubConnection.on(RoomBaseAction.SetRoomName, (res) => {
      const data = JSON.parse(res.toString());
      this.sharedService.setAttendeeRoomName(data);
    });

    this.hubConnection.on(RoomBaseAction.BroadcastMessageToRooms, (res) => {
      const data = JSON.parse(res.toString());
      this.sharedService.broadcastMessageToRooms(data);
    });

    this.hubConnection.on(RoomBaseAction.RejoinFromWaitRoom, (res) => {
      const waitRoomRequest = JSON.parse(res.toString());
      this.sharedService.setRejoinFromWaitRoom(waitRoomRequest);
    });

    this.hubConnection.on(RoomBaseAction.MuteUnMuteAllAttendees, (res) => {
      if (!this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)) {
        const data = JSON.parse(res.toString());
        this.sharedService.muteUnMuteAll(data);
      } else {
        this.sharedService.isMuteAllByHost = (res == 'true' ? true : false);
      }
    });

    this.hubConnection.on(RoomBaseAction.RaiseHand, (res) => {
      if (this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)) {
        const memberData = JSON.parse(res.toString());
        this.sharedService.pushToRaiseHandList(memberData);
      }
    });

    this.hubConnection.on(RoomBaseAction.ApproveRejectRaiseHand, (res) => {
      const responseData = JSON.parse(res.toString());
      if (!this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)
        && !this.sharedService.checkUserRole(EnumerationUserRole.Presenter, this.sharedService.virtualEventUser)
        && this.sharedService.checkUserRole(EnumerationUserRole.Attendee, this.sharedService.virtualEventUser)) {
        this.sharedService.approveOrRejectRaiseHand(responseData);
      }

      if (this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)) {
        if (responseData.approve) {
          this.sharedService.isMuteAllByHost = false;
        }

        if (responseData.allUsers) {
          this.sharedService.raiseHandMemberList = [];
        } else {
          var member = this.sharedService.raiseHandMemberList.find(x => x.VirtualEventUserId == responseData.memberId);
          if (member) {
            var index = this.sharedService.raiseHandMemberList.indexOf(member);
            this.sharedService.raiseHandMemberList.splice(index, 1);
          }
        }
      }
    });

    this.hubConnection.on(RoomBaseAction.OnJoinRoom, (res) => {
      const memberInfo = JSON.parse(res.toString());
      this.sharedService.onRemoteUsersJoinRoom.next(memberInfo);
    });

    this.hubConnection.on(RoomBaseAction.OnRequestBroadcastRoomInfo, (res) => {
      const memberInfo = JSON.parse(res.toString());
      this.sharedService.onRequestToBroadcastMyJoinStatus.next(memberInfo);
    });
  }

  openAddBreakoutRoomsPopup(): void {
    this.trigger.closeMenu();
    this.dialog.open(CreateBreakoutRoomComponent, {
      width: '800px',
      disableClose: true
    });
  }

  openHandoutsDialog(): void {
    const dialogRef = this.dialog.open(HandoutsDialogComponent, {
      width: '80%',
      data: {},
      hasBackdrop: true,
    });
  }

  openSilentAuctionDialog(): void {
    const dialogRef = this.dialog.open(SilentAuctionComponent, {
      width: '80%',
      data: {},
      hasBackdrop: true,
    });
  }

  openNotificationsDialog(): void {
    this.showAlertBox = false;
    const dialogRef = this.dialog.open(NotificationsDialogComponent, {
      width: '80%',
      data: {},
      hasBackdrop: true,
    });
  }

  public openUserinfoDialog(): void {
    this.showAlertBox = false;
    const dialogRef = this.dialog.open(UserinfoDialogComponent, {
      width: '600px',
      data: {},
      hasBackdrop: true,
    });
  }

  private getEventMembers(): void {

    if (!this.sharedService.virtualEventUser) {
      return;
    }

    this.virtualEventService.GetAllEventUsers(this.sharedService.virtualEventUser.VirtualEvent.EventId)
      .pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (res && res.Data) {
          try {
            let localEventMembers = [];
            res.Data.forEach(kv => {
              localEventMembers = [...localEventMembers, {
                VirtualEventUserId: kv.VirtualEventUserId,
                FullName: kv.FullName,
                Alt: this.sharedService.getUserShortName(kv.FullName),
                Online: false,
                FirstName: kv.FirstName,
                LastName: kv.LastName,
                ProfileImageUrl: kv.ProfileImageUrl,
                InvitationMessage: undefined,
                PlayerId: undefined,
                IsBlocked: kv.IsBlocked,
                AllowUnblock: kv.AllowUnblock,
                Title: kv.Title,
                VirtualEventUserRoles: kv.VirtualEventUserRoles,
              } as MemberAttributes];
            });
            this.sharedService.eventMembers = localEventMembers;
            const myself = this.sharedService.eventMembers
              .find(x => x.VirtualEventUserId == this.sharedService.virtualEventUser.VirtualEventUserId.toString());
            if (myself) {
              myself.Online = true;
              this.sharedService.eventMembers = this.sharedService.eventMembers
                .filter(x => x.VirtualEventUserId != this.sharedService.virtualEventUser.VirtualEventUserId.toString());
              this.sharedService.eventMembers.unshift(myself);
            }

            this.sharedService.setPeoplesData();

          } catch (e) {
            console.log(e);
          }
          this.sharedService.updateAllEventMembersOnlineStatus();
        }
      });
  }

  showPrivateMessageIndicator(data: any): void {
    if (!data.openChat) {
      this.privateMessageMembers.push(data.virtualEventUserId);
    }
    else {
      this.privateMessageMembers = this.privateMessageMembers.filter(x => x != data.virtualEventUserId.toString());
    }
  }
  private handleUserIdeal(): void {
    if (this.userIdle) {
      this.userIdle.startWatching();
      this.userIdle.onTimerStart().pipe(takeUntil(this.destroy$)).subscribe(count => {
        if (count >= 1 && !this.userIdealDialogDisplaying) {

          this.userIdealDialogDisplaying = true;
          const dialogRef = this.dialog.open(UserIdleDialogComponent, {
            width: '450px',
            data: {},
            hasBackdrop: true,
            disableClose: true
          });

          dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
            if (result) {
              this.userIdle.resetTimer();
              this.userIdealDialogDisplaying = false;
            }
          });
        }
      });
      this.userIdle.onTimeout().pipe(takeUntil(this.destroy$)).subscribe(() => {
        console.log('Time is up!');
        this.rtmClient?.logout();
        window.location.reload();
      });
    }
  }

  private setLogUploadAgora(): void {
    AgoraRTC.enableLogUpload();
    AgoraRTC.setLogLevel(4);
  }

  openManageAttendeePopup(): void {
    this.dialog.open(ManageAttendeeComponent, {
      width: '80%',
      maxHeight: '80%',
      minHeight: '80%',
      data: { eventMembers: this.sharedService.eventMembers.filter(x => x.VirtualEventUserId != this.sharedService.virtualEventUser.VirtualEventUserId.toString()), callFor: 'ManageAttendee' }
    });
  }
  enableDisableGlobalMute(mute: boolean, userId: string): void {
    this.disableDuringAction = true;
    this.virtualEventService.EnableDisableGlobalMute(
      this.sharedService.currentRoomData.VirtualEventRoomId, mute, this.sharedService.currentRoomData.RoomType)
      .subscribe(res => {
        if (res.Data) {
          if (environment.enableMuteUsingSignalR) {
            if (this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)) {
              const data = new BroadcastDataModel();
              data.Data = mute;
              data.VirtualEventId = this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId;
              data.DataType = RoomBaseAction.MuteUnMuteAllAttendees;
              this.virtualEventService.broadcastClientDataToEventClients(data).pipe(takeUntil(this.destroy$)).subscribe(() => {
                this.sharedService.isMuteAllByHost = mute;
                let message = '';
                if (mute) {
                  message = 'All attendees muted successfully.'
                } else {
                  message = 'Attendees can unmute themselves now.';
                }
                this.messageService.showSuccessMessage(message, true);
                this.disableDuringAction = false;
              }, error => {
                this.disableDuringAction = false;
              });

            }
          } else {
            this.sharedService.broadcastMuteUnmuteCommand(mute, userId);
          }
          this.updateMuteUnMuteStatusTextInAttendeeSection(mute);
        }
        else {
          this.messageService.showErrorMessage('Some error has occurred. Please try again!!', true);
        }
      });
  }

  private updateMuteUnMuteStatusTextInAttendeeSection(isMuteAllowedByHost) {
    this.sharedService.roomMembers?.forEach(m => { m.IsAllowedUmuting = !isMuteAllowedByHost });
  }

  private getAllowedUserFeatures(): void {
    if (!this.sharedService.virtualEventUser) {
      return;
    }
    this.virtualEventService.getAllowedUserFeatures(this.sharedService.virtualEventUser.VirtualEventUserId.toString())
      .pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (res && res.Data) {
          this.sharedService.fireworksFeatures = res.Data;
        }
      });
  }


  getOnlineMembersCount(): number {
    if (this.sharedService.eventMembers) {
      return this.sharedService.eventMembers.filter(x => x.Online).length;
    }
  }

  changeTab(tab: string): void {
    this.sharedService.selectedTab = tab;
    if(this.chatToggle){
      this.openRightPannel();
    }
  }

  calculateStyles(tab: string): string {
    return (this.sharedService.selectedTab == tab) ? 'block' : 'none';
  }

  openAudioVideoSettingPopup(): void {
    this.dialog.open(MediaSettingDialogComponent, {
      width: '800px',
      hasBackdrop: true,
      disableClose: true,
      data: []
    });
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: Event): void {
    if (event.target instanceof HTMLAnchorElement) {
      const element = event.target as HTMLAnchorElement;
      if (element.className === 'routerlink') {
        event.preventDefault();
        this.navigateToInviteUrl(element);
        if (this.dialog) {
          this.dialog.closeAll();
        }
      }
    }
  }

  hasAudio(): boolean {
    return this.mediaInfoService.localTrackState.audioTrackEnabled;
  }


  openLeftPannel() {
    this.sidebarExpended = !this.sidebarExpended;
    this.sharedService.resizeLayout({ panel: 'left', open: this.sidebarExpended });
  }

  openRightPannel() {
    this.chatToggle = !this.chatToggle;
    this.sharedService.resizeLayout({ panel: 'right', open: !this.chatToggle });
  }

  private navigateToInviteUrl(element: HTMLAnchorElement): void {
    const route = element?.getAttribute('href');
    let decodedUrl = decodeURIComponent(route);
    if (decodedUrl) {
      decodedUrl = decodedUrl.replace('{0}', this.sharedService.userUniqueAccessToken);
      const token = this.sharedService.getParamValueQueryString(decodedUrl, 'token');
      if (token) {
        this.router.navigate([`${decodedUrl.split('?')[0]}`], { queryParams: { token }, replaceUrl: false });
      }
      else {
        this.router.navigate([`${decodedUrl.split('?')[0]}`], { replaceUrl: false });
      }
    }
  }
}
