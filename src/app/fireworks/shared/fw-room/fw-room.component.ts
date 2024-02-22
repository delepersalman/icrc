// tslint:disable: triple-equals
import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, Renderer2, HostListener, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import * as moment from 'moment';
import { CalendarPipe } from 'ngx-moment';
import { MessageService } from 'src/app/shared/services/message.service';
import { environment } from 'src/environments/environment';
import { DialogAudioVideoData, UserNotificationModel, ConfirmDialogComponentData, BroadcastDataModel, EnumerationTrackingActivityType } from '../../models/common.model';
import { AttributesMap, ChatMessage, MemberAttributes, RtmChannel, RtmClient, RtmMessage, RtmTextMessage } from '../../models/rtm.model';
import {
  RoomType, VideoSource, VirtualEventRoomModel, VirtualEventPrivateRoomModel,
  MediaType, RoomBaseAction
} from '../../models/virtualevent.room.model';
import { EnumerationUserRole, ManageUserRoleModel, UserRole, VirtualEventUserModel } from '../../models/virtualevent.user.model';
import { SharedFireworksComponentService } from '../../services/shared.service';
import { VirtualEventService } from '../../services/virtualevent.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ComponentRegistryService } from '../../services/component.registry.service';

import AgoraRTC, {
  IAgoraRTCClient,
  ILocalVideoTrack,
  IAgoraRTCRemoteUser,
  ClientRole,
  RemoteStreamType,
  ConnectionState,
  ConnectionDisconnectedReason,
  NetworkQuality,
  UID
} from 'agora-rtc-sdk-ng';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Platform } from '@angular/cdk/platform';
import { FireworksLoggerMonitor } from '../../services/log.service';
import { NGXLogger } from 'ngx-logger';
import { MediaInfoService } from '../../services/media-info-service';
import { EventScheduleModel } from '../../models/virtualevent.model';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'fw-room',
  templateUrl: './fw-room.component.html',
  styleUrls: ['./fw-room.component.scss']
})
export class FwRoomComponent implements OnInit, AfterViewInit, OnDestroy {
  muteUnmuteText = 'Mute';
  fillScreenText = 'Fit Screen';
  destroy$ = new Subject();
  showRaiseHandList = false;
  roomUserCount = 0;
  @Input() countdown = 0;
  @Input() roomCountdownFormat = 'h\'h\':m\'m\':s\'s\'';
  roomCloseFormat = 'h\'h\':m\'m\':s\'s\'';
  option = {
    enableNotificationToChannelMembers: true
  };
  showBreakoutLeaveButton: boolean = false;
  @ViewChild('joinRoomButton', { read: ElementRef }) joinRoomButton: ElementRef;
  constructor(
    public route: ActivatedRoute,
    public dialog: MatDialog,
    public platform: Platform,
    public titleService: Title,
    public sharedService: SharedFireworksComponentService,
    public virtualEventService: VirtualEventService,
    public messageService: MessageService,
    public amCalendar: CalendarPipe,
    public logger: NGXLogger,
    private router: Router,
    public mediaInfoService: MediaInfoService,
    private renderer: Renderer2,
    private registryService: ComponentRegistryService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params: Params) => {
      this.ngOnInit();
    });

    this.sharedService.onRoleChange.pipe(takeUntil(this.destroy$)).subscribe(async (data: any) => {
      let rMember = this.sharedService.roomMembers.find(x => x.VirtualEventUserId.toString() == data.userId);
      if (!rMember) {
        rMember = this.sharedService.eventMembers.find(x => x.VirtualEventUserId.toString() == data.userId);
      }
      if (data.isOfflineUser) {
        await this.sharedService.getMemberInfo(rMember);
      } else {
        if (this.sharedService.isSelfUser(rMember)) {
          rMember.PlayerId = this.mediaInfoService.getLocalPlayerId(rMember.VirtualEventUserId);
          this.showHideOnDisplay(rMember);
        } else {
          // when host show/remove display on screen for remote user.
          this.sharedService.getMemberInfo(rMember).then(async () => {
            if ((rMember.CurrentRoomId == this.roomData.VirtualEventRoomId)) {
              if (this.sharedService.isPresenter(rMember)) {
                if (!this.presenters.find(x => x.VirtualEventUserId.toString() == rMember.VirtualEventUserId.toString())) {
                  this.presenters.push(rMember);
                  if (!rMember.PlayerId) {
                    rMember.PlayerId = this.mediaInfoService.getRemotePlayerId(rMember.VirtualEventUserId);
                  }
                  this.sharedService.checkElement('#' + rMember.PlayerId).then(() => {
                    this.AdjustPresenterView();
                  });
                }
              } else {
                this.presenters = this.presenters.filter(x => x.VirtualEventUserId.toString() != rMember.VirtualEventUserId.toString());
                this.AdjustPresenterView();
              }
            }
          }).catch(err => {
            this.messageService.showErrorMessage('Some error has occurred. Please try to refresh and join again.');
          });
        }
      }
    });

    this.sharedService.onAttendeeRemove.pipe(takeUntil(this.destroy$)).subscribe((moveAttendee: any) => {
      this.leaveAllClients().then(() => {
        this.sharedService.roomClientConnected = false;
      }, (reason: any) => {
        this.messageService.showErrorMessage("We have some issue to leave this room. Please try to refresh and join again.")
      });
    });

    this.sharedService.onMuteUnMuteAllAttendees.pipe(takeUntil(this.destroy$)).subscribe((mute: boolean) => {
      if (mute) {
        this.muteMic();
      }
      else {
        this.unmuteMic();
      }
    });

    this.sharedService.onBreakoutRoomClose.pipe(takeUntil(this.destroy$)).subscribe((breakoutRoom: VirtualEventPrivateRoomModel) => {
      this.showBreakoutLeaveButton = true;
    });

    this.sharedService.onBreakoutRoomOpen.pipe(takeUntil(this.destroy$)).subscribe((breakoutRoom: VirtualEventPrivateRoomModel) => {
      this.showBreakoutLeaveButton = false;
    });

    this.sharedService.onScheduleUpdate.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.setRoomCloseCountDown();
    });

    this.sharedService.onlayoutResize.subscribe((panel: any) => {
      if (panel.open) {
        this.AdjustPresenterView(panel);
      } else {
        setTimeout(() => {
          this.AdjustPresenterView();
        }, 500);
      }
    })

    this.subscribeUpdateRoomMembersDetailsFromEventMembers();
    this.logger.registerMonitor(new FireworksLoggerMonitor());
  }

  ngAfterViewInit(): void {
    if (this.route.snapshot.queryParamMap.get('autojoin')) {
      this.router.navigate([], { queryParams: { 'autojoin': null }, queryParamsHandling: 'merge' });
      /* if (this.joinRoomButton && this.joinRoomButton.nativeElement) {
        this.joinRoomButton.nativeElement.click();
      } */
    }
  }

  @Input() roomData: VirtualEventRoomModel;
  @Output() onLeaveBreakout = new EventEmitter();
  domainURl = environment.domainUrl;
  dialogAudioVideoData: DialogAudioVideoData;
  presenters: MemberAttributes[] = [];
  resourcesLoading: boolean;
  videoClient: IAgoraRTCClient;
  screenClient: IAgoraRTCClient;
  rtmClient: RtmClient;
  screenClientConnected: boolean;
  remoteScreenClientConnected = false;
  time = 0;
  display: string;
  hasPinnedVideo: boolean;
  txtSearchPeople: string;
  enumerationUserRole = EnumerationUserRole;
  preCallDialogOpend = false;
  selfViewClass = 'maximized';
  attendeesMaximized = true;
  attendeeGridViewEnabled = true;
  attendeeViewClassName = 'gridview';
  timeout: any;
  previousPinnedVideoIndex = 0;
  clientRole: ClientRole = 'audience';
  roomCloseCountdown: number = 0;
  currentSchedule: EventScheduleModel;

  ngOnDestroy(): void {
    this.registryService.unregister('fw-room');
    this.destroy$.next();
    this.destroy$.unsubscribe();
    if (this.videoClient) {
      this.videoClient.removeAllListeners();
    }
    if (this.rtmClient) {
      this.rtmClient.removeAllListeners();
    }
    if (this.screenClient) {
      this.screenClient.removeAllListeners();
    }
    if (this.mediaInfoService.localTracks.screenTrack) {
      this.mediaInfoService.localTracks.screenTrack.removeAllListeners();
    }
  }

  async ngOnInit(): Promise<void> {
    if (this.roomData) {
      try {

        if (this.roomData.VideoSource != VideoSource.Eventcombo) {
          // capture time when video source is video like youtube, vimeo etc.
          this.sharedService.saveFireworksActivity(this.sharedService.currentRoomData.VirtualEventRoomId,
            this.sharedService.virtualEventUser.VirtualEventUserId, EnumerationTrackingActivityType.JoinFireworksRoom, this.sharedService.currentRoomData.RoomType);
        }

        this.sharedService.fwRoom = this;
        this.setRoomCloseCountDown();

        this.rtmClient = this.sharedService.rtmClient;
        if (this.sharedService.isPresenter(this.sharedService.virtualEventUser) || this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)) {
          this.clientRole = 'host';
        }

        this.videoClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8', role: this.clientRole });

        try { this.videoClient.enableAudioVolumeIndicator(); } catch { }

        await this.assignVideoClientHandlers();

        this.assignRoomSignalingHandlers(this.sharedService.rtmRoomChannel);
        this.assignUserSignalingHandlers(this.sharedService.rtmClient);

        this.sharedService.onRaiseHand.pipe(takeUntil(this.destroy$)).subscribe((memberdata: any) => {
          const member = this.sharedService.eventMembers.find(m => m.VirtualEventUserId == memberdata.memberId) as MemberAttributes;
          if (member) {
            member.CurrentRoom = memberdata.roomName;
            if (!this.sharedService.raiseHandMemberList.find(x => x.VirtualEventUserId == member.VirtualEventUserId)) {
              this.sharedService.raiseHandMemberList.push(member);
              let message = member.FullName + ' is raising their hand, please approve (their mic will turn on) or put into queue for approval later.';
              if (this.roomData.VirtualEventRoomId != memberdata.roomId) {
                message = member.FullName + " is raising their hand in " + memberdata.roomName + ", please approve (their mic will turn on) or put into queue for approval later.";
              }

              this.messageService.showSuccessMessage(message);
            }
          }
        });

        this.sharedService.onRaiseHandApproveReject.pipe(takeUntil(this.destroy$)).subscribe((responseData: any) => {
          this.sharedService.allowUnmuteMyself = responseData.approve;
          if (this.sharedService.allowUnmuteMyself) {
            this.videoClient.setClientRole('host').then(() => {
              this.messageService.showSuccessMessage('Your mic has been unmuted, please be courteous with your background noise.');
            });
          } else {
            this.videoClient.setClientRole('audience').then(() => {
              console.log('unmute not allowed');
            });
          }
        });

        this.subscribeRemoteUserJoinRoomStatus();

        this.requestOtherUserToBroadcastJoinedRoomStatus({
          VirtualEventRoomId: this.roomData.VirtualEventRoomId,
          VirtualEventUserId: this.sharedService.virtualEventUser.VirtualEventUserId
        });

        this.mediaInfoService.onJoinRoomChannel.pipe(takeUntil(this.destroy$)).subscribe(() => {
          if (this.roomData.VideoSource.toLowerCase() === VideoSource.Eventcombo) {
            this.joinRoom();
          }
        });

        this.registryService.register('fw-room', this);

        // join automatic if room is brakout
        if ((this.roomData.RoomType == RoomType.Breakout
          || (this.sharedService.autoJoin && this.countdown == 0 && this.currentSchedule)
          || this.roomData.RoomType == RoomType.PrivateRoom)
          && this.roomData.MediaType.toLowerCase() == MediaType.Video
          && this.roomData.VideoSource.toLowerCase() == VideoSource.Eventcombo) {
          this.resourcesLoading = true;
          setTimeout(() => {
            this.resourcesLoading = false;
            this.sharedService.enableChatRoom = false;
            this.enableToJoinRTMChannel();
          }, 2000);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  sizeChange(): void {
    setTimeout(() => {
      this.AdjustPresenterView();
    }, 300);
  }

  isPresenter(): boolean {
    if (this.sharedService.virtualEventUser) {
      return (this.sharedService.checkUserRole(EnumerationUserRole.Presenter, this.sharedService.virtualEventUser)
        || this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)
      );
    }
  }

  isAttendee(): boolean {
    if (this.sharedService.virtualEventUser) {
      return this.sharedService.checkUserRole(EnumerationUserRole.Attendee, this.sharedService.virtualEventUser);
    }
  }



  async canUserJoinRoom(member: any): Promise<boolean> {
    var maxPresenterLimit = environment.maxPresenter;
    var isPresenter = this.sharedService.isPresenter(member);
    var totalPresenters = this.sharedService.presenters?.length + this.sharedService.hostAndCohost?.length;
    if (this.sharedService.isHostOrCoHost(member)) {
      maxPresenterLimit += 2; // if limit already reached then atleast 2 host can join the room.
    }
    if (isPresenter && totalPresenters > maxPresenterLimit) {
      //change role to attendee
      if (!member.IsScreenClient && this.roomData.RoomType != RoomType.NetworkingBooth && this.roomData.RoomType != RoomType.PrivateRoom && this.roomData.RoomType != RoomType.Breakout) {
        await this.sharedService.changeUserRoleToAttendee();
        return true;
      } else {
        this.messageService.showErrorMessage('Maximum presenters limit has been reached!');
        return false;
      }
    } else {
      return true;
    }
  }

  enableToJoinRTMChannel() {
    this.resourcesLoading = true;
    if (this.sharedService.enableChatRoom) {
      this.joinRoom();
    } else {
      this.sharedService.enableChatRoom = true;
      this.sharedService.temporaryConnect = true;
    }
  }

  async joinRoom(): Promise<void> {
    try {
      var canUserJoin = await this.canUserJoinRoom(this.sharedService.virtualEventUser);
      if (this.maxParticipantsLimitStatus() && canUserJoin) {
        this.presenters = [];
        this.mediaInfoService.setMediaSettingFromLocalStorage();
        this.mediaInfoService.options.channel = this.roomData.RoomChannelName;
        this.mediaInfoService.options.uid = this.sharedService.virtualEventUser.VirtualEventUserId.toString();
        await this.mediaInfoService.createLocalTrack();
        this.videoClient.join(this.mediaInfoService.options.appid, this.roomData.RoomChannelName, this.mediaInfoService.options.token, this.mediaInfoService.options.uid).then(() => {
          this.resourcesLoading = false;
          this.sharedService.roomClientConnected = true;
          this.sharedService.selectedTab = 'People';
          this.setRoomCloseCountDown();
          this.messageService.playUserJoinEventTone();
          var roomMember = this.sharedService.roomMembers.find(x => x.VirtualEventUserId == this.sharedService.virtualEventUser.VirtualEventUserId.toString());
          if (roomMember) {
            roomMember.hasAudio = this.mediaInfoService.localTrackState.audioTrackEnabled;
            roomMember.hasVideo = this.mediaInfoService.localTrackState.videoTrackEnabled;
            roomMember.CurrentRoomId = this.roomData.VirtualEventRoomId;
            roomMember.CurrentRoom = this.roomData.RoomName;
            roomMember.PlayerId = this.mediaInfoService.getLocalPlayerId(roomMember.VirtualEventUserId);
            roomMember.FitScreenText = 'Fit';
            roomMember.PinText = 'Pin';
          }

          if (this.sharedService.isPresenter(this.sharedService.virtualEventUser)) {
            this.presenters.push(roomMember);
            this.changeDetectorRef.detectChanges();
            this.sharedService.checkElement('#' + roomMember.PlayerId).then(() => {
              this.AdjustPresenterView();
            });
            this.setRoleAndPublishAudioVideo();
          } else {
            this.muteVideo();
            if (this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)) {
              this.sharedService.allowUnmuteMyself = true;
              this.publishAudio().then(() => {
                if (!this.mediaInfoService.localTrackState.audioTrackEnabled) {
                  this.muteAudio();
                }
              });
            } else {
              this.muteAudio();
              this.sharedService.allowUnmuteMyself = false;
            }
          }
          this.sharedService.setPeoplesData();
          this.sharedService.saveFireworksActivity(this.sharedService.currentRoomData.VirtualEventRoomId,
            this.sharedService.virtualEventUser.VirtualEventUserId, EnumerationTrackingActivityType.JoinFireworksRoom, this.sharedService.currentRoomData.RoomType);
        }, err => {
          this.resourcesLoading = false;
          console.error(err);
          this.sharedService.confirmAndReload(this.dialog);
        });
      } else {
        this.resourcesLoading = false;
        await this.leaveAllClients();
      }
    } catch (e) {
      this.resourcesLoading = false;
      this.sharedService.confirmAndReload(this.dialog);
    }
  }

  muteAudio(): void {
    if (!this.mediaInfoService.localTracks.audioTrack) {
      this.mediaInfoService.localTrackState.audioTrackEnabled = false;
      return;
    }
    this.unPublishAudio().then(() => {
      this.mediaInfoService.localTrackState.audioTrackEnabled = false;
    });
  }

  unMuteAudio(): void {
    if (!this.mediaInfoService.localTracks.audioTrack) {
      this.mediaInfoService.createLocalAudioTrack();
    }

    if (!this.mediaInfoService.localTracks.audioTrack) {
      this.mediaInfoService.localTrackState.audioTrackEnabled = false;
      this.messageService.showErrorMessage("It appears your mic is being used by another application or not accessible, please provide permissions under settings.");
      return;
    }
    this.publishAudio().then(() => {
      this.mediaInfoService.localTracks.audioTrack.setEnabled(true).then(() => {
        this.mediaInfoService.localTrackState.audioTrackEnabled = true;
      });
    });
  }

  muteVideo() {
    if (!this.mediaInfoService.localTracks.videoTrack) {
      this.mediaInfoService.localTrackState.videoTrackEnabled = false;
      return;
    }
    this.unPublishVideo().then(() => {
      this.mediaInfoService.localTrackState.videoTrackEnabled = false;
    });
  }

  async unmuteVideo() {
    if (!this.mediaInfoService.localTracks.videoTrack) {
      await this.mediaInfoService.createLocalVideoTrack();
    }

    if (!this.mediaInfoService.localTracks.videoTrack) {
      this.mediaInfoService.localTrackState.videoTrackEnabled = false;
      this.messageService.showErrorMessage("It appears your camera is being used by another application or not accessible, please provide permissions under settings.");
      return;
    }

    var member = this.sharedService.roomMembers.find(m => m.VirtualEventUserId == this.sharedService.virtualEventUser.VirtualEventUserId.toString());
    if (!member) {
      this.sharedService.eventMembers.find(m => m.VirtualEventUserId == this.sharedService.virtualEventUser.VirtualEventUserId.toString());
    }
    if (this.sharedService.isHostOrCoHost(member) && this.sharedService.checkUserRole(EnumerationUserRole.Attendee, member)
      && this.roomData.RoomType != RoomType.NetworkingBooth && this.roomData.RoomType != RoomType.Breakout && RoomType.PrivateRoom) {
      this.messageService.showErrorMessage('Please click "Display on Screen" in your Attendee view.');
    } else {
      try {
        this.publishVideo().then(async () => {
          this.mediaInfoService.localTrackState.videoTrackEnabled = true;
          await this.playLocalVideo(member);
        });
      } catch (ex) {
        console.error(ex);
      }
    }
  }

  // mute attendee by host , co-host
  muteMic(): Promise<any> {
    const promise = new Promise((resolve: any, reject: any) => {
      if (!this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)) {
        this.sharedService.allowUnmuteMyself = false;
        if (this.mediaInfoService.localTracks.audioTrack) {
          this.muteAudio();
          this.messageService.showSuccessMessage('You are muted.');
          resolve(null);
        } else {
          reject(null);
        }
      } else {
        reject(null);
      }
    })
    return promise;
  }

  unmuteMic(): Promise<any> {
    const promise = new Promise((resolve: any, reject: any) => {
      if (!this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)) {
        this.sharedService.allowUnmuteMyself = true;
        if (this.mediaInfoService.localTracks.audioTrack) {
          this.unMuteAudio();
          resolve(null);
        } else {
          reject(null);
        }
      } else {
        reject(null);
      }
    });
    return promise;
  }

  leaveBreakoutRoom(): void {
    this.onLeaveBreakout.emit();
  }

  leaveChatRoom(): Promise<any> {
    const promise = new Promise((resolve: any, reject: any) => {
      if (this.sharedService.rtmRoomChannel) {
        this.sharedService.rtmRoomChannel.removeAllListeners();
        this.sharedService.rtmRoomChannel.leave().then(() => {
          this.sharedService.rtmRoomChannel = null;
          resolve(null);
        }).catch(err => {
          reject(null);
          console.error(err);
        });
      } else {
        resolve(null);
      }
    });
    return promise;
  }

  async leaveAllClients(leaveFromVideoSource: boolean = false): Promise<any> {
    const promise = new Promise((resolve: any, reject: any) => {
      if (this.sharedService.roomClientConnected || this.sharedService.enableChatRoom) {
        if (this.videoClient.connectionState == 'CONNECTED') {
          this.videoClient.leave().then(async () => {
            this.stopScreenShare();
            if (!leaveFromVideoSource) {
              await this.leaveChatRoom();
            }
            this.resetJoiningInformation(leaveFromVideoSource);
            resolve(null);
          }).catch(err => {
            console.error("error in leaving RTC channel: - ", err);
            reject(err);
          });
        } else if (this.sharedService.temporaryConnect || this.sharedService.enableChatRoom) {
          this.leaveChatRoom().then(() => {
            this.resetJoiningInformation(leaveFromVideoSource);
            resolve(null);
          });
        }
      } else {
        this.resetJoiningInformation(leaveFromVideoSource);
        resolve(null);
      }
    });
    return promise;
  }

  leaveClient(): void {
    try {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          Title: 'Please confirm',
          Message: 'Are you sure you want to leave?',
          CancelText: 'No, stay',
          OkText: 'Yes'
        } as ConfirmDialogComponentData
      });
      dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
        if (result) {
          this.leaveAllClients().then(() => {
            this.sharedService.roomClientConnected = false;
            this.sharedService.saveFireworksActivity(this.sharedService.currentRoomData.VirtualEventRoomId,
              this.sharedService.virtualEventUser.VirtualEventUserId, EnumerationTrackingActivityType.LeaveFireworksRoom, this.sharedService.currentRoomData.RoomType);
          }).catch(err => {
            console.error("error in leaving room click: - ", err);
          });
        }
      });
    } catch (e) {
      console.log(e);
      this.messageService.showErrorMessage('An error occurred while leaving the room, Please refresh the page.');
    }
  }

  async startScreenSharing(): Promise<void> {

    let canUserJoin = await this.canUserJoinRoom(this.sharedService.virtualEventUser);
    if (canUserJoin) {
      if (this.screenClientConnected) {
        this.stopScreenShare();
        return;
      }

      let previousScreenPresenterIndex = this.presenters.findIndex(r => r.IsScreenClient);

      var roomMember = this.sharedService.roomMembers.find(x => x.VirtualEventUserId == this.sharedService.virtualEventUser.VirtualEventUserId.toString());
      let screenUser = Object.assign({}, roomMember);
      screenUser.IsScreenClient = true;

      this.screenClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8', role: 'host' });
      AgoraRTC.createScreenVideoTrack({ encoderConfig: '720p', screenSourceType: 'screen' }, 'disable').then((localScreenTrack: ILocalVideoTrack) => {

        if (previousScreenPresenterIndex !== -1) {
          this.presenters.splice(previousScreenPresenterIndex, 1);
        }

        this.resourcesLoading = true;
        this.mediaInfoService.localTracks.screenTrack = localScreenTrack;
        this.mediaInfoService.localTracks.screenTrack.on('track-ended', () => {
          this.stopScreenShare();
        });
        let screenUserId = this.mediaInfoService.getLocalPlayerId(this.sharedService.virtualEventUser.VirtualEventUserId.toString(), 'screen');
        this.screenClient.join(environment.agora.appId, this.roomData.RoomChannelName, null, screenUserId).then((userId: UID) => {
          this.screenClientConnected = true;
          this.presenters.forEach(x => x.PinnedToMainView = false);
          screenUser.PinnedToMainView = true;
          screenUser.VirtualEventUserId = screenUserId;
          screenUser.PlayerId = screenUserId;
          screenUser.PinText = 'Unpin';
          screenUser.FitScreenText = 'Fill';
          this.presenters = [screenUser, ...this.presenters];
          this.screenClient.publish(this.mediaInfoService.localTracks.screenTrack).then(() => {
            this.hasPinnedVideo = true;
            this.resourcesLoading = false;
            this.sharedService.checkElement('#selfScreenSharePreview').then(el => {
              this.mediaInfoService.localTracks.screenTrack.play(el, { fit: 'contain' });
            });
          }).catch(err => {
            this.messageService.showErrorMessage('We have some issue to share your screen. Please try to refresh and try again.');
          });
        }).catch(err => {
          console.error(err);
          this.resourcesLoading = false;
          this.messageService.showErrorMessage('We have some issue to share your screen. Please try to refresh and try again.');
        });
      });

    }
  }

  stopScreenShare(): void {
    if (this.screenClientConnected && this.mediaInfoService.localTracks.screenTrack) {
      this.presenters = this.presenters.filter(item => item.VirtualEventUserId != this.mediaInfoService.getLocalPlayerId(this.sharedService.virtualEventUser.VirtualEventUserId.toString(), 'screen'));
      this.screenClient.unpublish(this.mediaInfoService.localTracks.screenTrack).then(() => {
        this.screenClient.leave().then(async () => {
          this.mediaInfoService.localTracks.screenTrack.stop(); // close the screen client stream
          this.mediaInfoService.localTracks.screenTrack.close();
          this.hasPinnedVideo = false;
          this.mediaInfoService.localTracks.screenTrack = null;
          this.screenClientConnected = false;
        }).catch(err => {
          console.error('screen client leave failed ', err); // error handling
        });
      }, (reason) => { });
    }
  }

  async assignVideoClientHandlers(): Promise<void> {
    this.videoClient.on('connection-state-change', (curState: ConnectionState, revState: ConnectionState, reason: ConnectionDisconnectedReason) => {
      switch (curState) {
        case "CONNECTED": {
          let roomName = this.roomData.RoomName;
          if (this.roomData.RoomType == RoomType.PrivateRoom) {
            roomName = 'Private Room'
          }
          if (this.sharedService.roomClientConnected) {
            this.broadcastLocalUserJoinRoomStatus({
              VirtualEventRoomId: this.roomData.VirtualEventRoomId,
              VirtualEventUserId: this.sharedService.virtualEventUser.VirtualEventUserId
            }, true);
          }
          this.messageService.showSuccessMessage("You've connected to " + roomName);
          return;
        }
        case "DISCONNECTING":
          if (reason && reason != 'LEAVE') {
            var message = reason ? 'You are disconnecting due to ' + reason + '' : 'You are disconnecting';
            this.messageService.showErrorMessage(message);
          }
          return;
        default:
          return;
      }
    });

    this.videoClient.on("network-quality", (networkQuality: NetworkQuality) => {
      // if (networkQuality.downlinkNetworkQuality == 5) {
      //   this.messageService.showErrorMessage("Your internet is weak. You'll experience poor quality or lose video/audio.");
      // }

      if (networkQuality.downlinkNetworkQuality == 6) {
        this.messageService.showErrorMessage("An error occurred while establishing connection with server. Please check your network connection.");
      }
    })

    this.videoClient.on('user-joined', (user: IAgoraRTCRemoteUser) => {
      const id = user.uid.toString();
      let streamMember = this.sharedService.eventMembers.find(x => x.VirtualEventUserId == id);
      if (streamMember) {
        if (!this.sharedService.isSelfUser(streamMember)) { // only for remote users
          let isPresenterAlready = this.presenters.find(x => x.VirtualEventUserId == id);
          if (!isPresenterAlready) {
            streamMember.FitScreenText = 'Fit';
            streamMember.PinText = 'Pin';
            streamMember.Online = true;
            streamMember.PlayerId = this.mediaInfoService.getRemotePlayerId(id);
            streamMember.hasAudio = user.hasAudio;
            var roomMember = this.sharedService.roomMembers.find(m => m.VirtualEventUserId.toString() == id);
            if (!roomMember) {
              roomMember = streamMember;
            }
            if (roomMember) {
              this.sharedService.getMemberInfo(roomMember).then(() => {
                streamMember.VirtualEventUserRoles = roomMember.VirtualEventUserRoles;
                if (this.sharedService.isPresenter(streamMember)) {
                  this.presenters.push(streamMember);
                  //if presenter is not in room array.
                  var roomAttendee = this.sharedService.roomMembers.find(m => m.VirtualEventUserId == streamMember.VirtualEventUserId);
                  if (!roomAttendee) {
                    this.sharedService.roomMembers.push(streamMember);
                    this.sharedService.setPeoplesData();
                  }
                  this.sharedService.checkElement('#' + streamMember.PlayerId).then(() => {
                    this.AdjustPresenterView();
                  });
                }
              }, err => {
                console.error(err);
              });
            }
          }
        }
      }
      else if (id.indexOf('screen') != -1) { // Screen sharing client

        let screenUserId = this.mediaInfoService.getIdOfScreenUser(id);
        streamMember = this.sharedService.roomMembers.find(x => x.VirtualEventUserId == screenUserId);
        if (streamMember && !this.sharedService.isSelfUser(streamMember)) {
          this.resourcesLoading = true;
          this.stopScreenShare();
          this.remoteScreenClientConnected = true;
          this.presenters.forEach(x => x.PinnedToMainView = false);
          let screenUser = Object.assign({}, streamMember);
          screenUser.Online = true;
          screenUser.VirtualEventUserId = id;

          screenUser.IsScreenClient = true;
          screenUser.PinnedToMainView = true;
          screenUser.PlayerId = this.mediaInfoService.getRemotePlayerId(id);
          screenUser.FullName = screenUser.FullName + ' is presenting';
          screenUser.FitScreenText = 'Fill';
          screenUser.PinText = "Unpin"
          this.presenters.unshift(screenUser);
          this.hasPinnedVideo = true;
          this.resourcesLoading = false;
        }
      }
    });

    this.videoClient.on('user-published', async (user, mediaType) => {
      let userId = user.uid as string;
      let uid = userId;
      if (userId.indexOf('screen') != -1) {
        uid = this.mediaInfoService.getIdOfScreenUser(userId);
      }

      if (uid != this.sharedService.virtualEventUser.VirtualEventUserId.toString()) {
        let remoteTrack = await this.videoClient.subscribe(user, mediaType);
        if (mediaType == 'audio') {
          user.audioTrack?.play();
        }
        if (mediaType == 'video') {
          var remoteVideoStats = remoteTrack.getStats();
          setTimeout(() => {
            let playerId = this.mediaInfoService.getRemotePlayerId(userId);
            this.playRemoteUserVideo(user, playerId);
          }, (remoteVideoStats.end2EndDelay * 60));
        }
        setTimeout(() => {
          this.updateRemoteUserInfo(user);
        }, 1000);
      }
    });

    this.videoClient.on('user-info-updated', (uid, msg) => {
      if (uid) {
        if (uid != this.sharedService.virtualEventUser.VirtualEventUserId) {
          const id = uid.toString();
          var streamMember = this.sharedService.roomMembers.find(x => x.VirtualEventUserId == id);

          var presenter = this.presenters.find(x => x.VirtualEventUserId == id);
          if (!streamMember) {
            streamMember = this.sharedService.eventMembers.find(x => x.VirtualEventUserId == id);
          }

          if (!streamMember) { // Its a screen client
            return;
          }
          streamMember.Online = true;
          switch (msg) {
            case 'mute-audio': {
              streamMember.hasAudio = false;
              if (presenter) {
                presenter.hasAudio = false;
              }
              break;
            }
            case 'unmute-audio': {
              streamMember.hasAudio = true;
              if (presenter) {
                presenter.hasAudio = true;
              }
              break;
            }
            case 'mute-video': {
              streamMember.hasVideo = false;
              if (presenter) {
                presenter.hasVideo = false;
              }
              break;
            }
            case 'unmute-video': {
              streamMember.hasVideo = true;
              if (presenter) {
                presenter.hasVideo = true;
              }
              break;
            }
            case 'disable-local-video': {
              break;
            }
            case 'enable-local-video': {
              break;
            }
          }
          this.sharedService.setPeoplesData();
        }
      }
    });

    this.videoClient.on('user-unpublished', async (user: IAgoraRTCRemoteUser, mediaType) => {
      await this.videoClient.unsubscribe(user, mediaType);
      if (mediaType == 'audio') {
        const audioTrack = user.audioTrack;
        // stop the audio
        audioTrack?.stop();
      }
      else {
        const videoTrack = user.videoTrack;
        // stop the video
        videoTrack?.stop();
      }

      const id = user.uid.toString();
      const streamMember = this.sharedService.presenters.find(x => x.VirtualEventUserId == id);
      if (streamMember) { // Its a screen client
        streamMember.hasAudio = user.hasAudio;
        streamMember.hasVideo = user.hasVideo;
        streamMember.audioTrack = user.audioTrack;
        streamMember.videoTrack = user.videoTrack;
      }
    });

    this.videoClient.on('user-left', user => {
      const id = user.uid.toString();
      this.presenters = this.presenters.filter(call => call.VirtualEventUserId != id);
      var roomMember = this.sharedService.roomMembers.find(m => m.VirtualEventUserId.toString() == id);
      if (roomMember) {
        this.sharedService.getMemberInfo(roomMember).then(() => {
          // user updated
        })
      }
      var isAnyScreenClientExists = this.presenters.find(x => x.IsScreenClient);
      if (isAnyScreenClientExists) {
        this.hasPinnedVideo = true;
      } else {
        this.remoteScreenClientConnected = false;
        this.hasPinnedVideo = false;
      }
      setTimeout(() => {
        this.AdjustPresenterView();
      }, 300);
    });

    this.videoClient.on('volume-indicator', (data: [{ level: number, uid: string }]) => {
      if (data && data.length) {
        var self = this.sharedService.roomMembers.find(x => x.VirtualEventUserId == this.sharedService.virtualEventUser.VirtualEventUserId.toString());
        if (self && !self.hasAudio) {
          this.turnOnOffVoiceIndicator(self, false, 0);
        }
        data.forEach(user => {
          var roomMember = this.sharedService.roomMembers.find(x => x.VirtualEventUserId == user.uid);
          if (roomMember) {
            this.turnOnOffVoiceIndicator(roomMember, (user.level > 0.6), user.level);
          }
        })
      } else {
        this.sharedService.roomMembers.forEach(rm => {
          if (rm.IsSpeaking) {
            this.turnOnOffVoiceIndicator(rm, false, 0);
          }
        })
      }
    });

    this.videoClient.on('stream-fallback', (uid, isFallbackOrRecover) => {
      const id = uid.toString();
      const member = this.sharedService.roomMembers.find((x) => x.VirtualEventUserId == id);
      if (!member) { return; }
      if (isFallbackOrRecover == 'fallback') {
        this.messageService.showErrorMessage(member.FullName + "'s internet is weak. You may experience poor video/audio.");
      }
      if (isFallbackOrRecover == 'recover') {
        this.messageService.showErrorMessage(member.FullName + " is back online.");
      }
    });

    this.videoClient.on('stream-type-changed', (uid, streamType: RemoteStreamType) => {
      const id = uid.toString();
      const member = this.sharedService.roomMembers.find((x) => x.VirtualEventUserId == id);
      if (!member) { return; }
      if (streamType == RemoteStreamType.LOW_STREAM) {
        this.messageService.showErrorMessage(member.FullName + "'s internet is weak. You may experience poor video/audio.");
      }
    });

    this.videoClient.on('exception', (error) => {
      console.log('Got error msg:', error.msg);
      const logMessage = this.createLogMessage('exception', error.uid, `error: ${error.msg} `, false, false);
    });
  }

  private maxParticipantsLimitStatus(): boolean {
    if (this.roomData.MaximumParticipants == 0) {
      return true;
    }

    let totalParticipants = this.roomData.MaximumParticipants + (this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser) ? 2 : 0); // if limit already reached atleast 2 host/co-host can join the room.

    var attendees = this.sharedService.presenters?.length ?? 0 + this.sharedService.attendees?.length ?? 0;

    if (totalParticipants > 0 && attendees > this.roomData.MaximumParticipants) {
      this.messageService.showErrorMessage('Maximum participant limit of ' + this.roomData.MaximumParticipants + ' has been reached!');
      return false;
    }
    return true;
  }

  private resetJoiningInformation(leaveFromVideoSource: boolean = false): void {
    this.screenClientConnected = false;
    this.sharedService.temporaryConnect = false;
    if (!leaveFromVideoSource) {
      this.sharedService.enableChatRoom = false;
      this.sharedService.roomMembers = [];
    }
    this.remoteScreenClientConnected = false;
    this.closeLocalClientStream();
    this.presenters = [];
    this.sharedService.selectedTab = 'Schedule';
  }

  private setRoomCloseCountDown(): void {
    var currentDateTimestamp = Date.parse(moment.utc().format());
    this.currentSchedule = this.sharedService.eventSchedules.filter(s => s.VirtualEventRoomId == this.roomData.VirtualEventRoomId
      && Date.parse(moment.utc(s.StartDateUtc).format()) <= currentDateTimestamp && Date.parse(moment.utc(s.EndDateUtc).format()) > currentDateTimestamp
    )[0];
    if (this.currentSchedule) {
      var endDateTimestamp = Date.parse(moment.utc(this.currentSchedule.EndDateUtc).format());
      var difference = (endDateTimestamp - currentDateTimestamp);
      this.roomCloseFormat = this.sharedService.getCountdownFormat(difference);
      this.roomCloseCountdown = parseInt((difference / 1000).toFixed(), 10);
      this.currentSchedule.ScheduleStatus = 1; // running
      this.countdown = 0;
    } else {
      this.roomCloseCountdown = 0;
    }
  }

  private turnOnOffVoiceIndicator(rm: MemberAttributes, turnOn: boolean, volumeLevel: number): void {
    const userDiv = document.getElementById('volumn-indicator-' + rm.VirtualEventUserId);
    if (turnOn) {
      rm.IsSpeaking = true;
      if (userDiv) {
        userDiv.classList.add('innerVoiceIndicator');
        userDiv.style.boxShadow = '0 0 0 ' + volumeLevel + 'px rgba(255,255,255,.1)';
      }
    } else {
      rm.IsSpeaking = false;
      if (userDiv) {
        userDiv.classList.remove('innerVoiceIndicator');
        userDiv.style.boxShadow = '0 0 0 ' + volumeLevel + 'px rgba(255,255,255,.1)';
      }
    }
  }

  private async setRoleAndPublishAudioVideo(): Promise<void> {
    this.sharedService.allowUnmuteMyself = true;
    if (this.mediaInfoService.localTrackState.audioTrackEnabled) {
      this.unMuteAudio();
    } else {
      this.muteAudio();
    }

    if (this.mediaInfoService.localTrackState.videoTrackEnabled) {
      this.unmuteVideo();
    } else {
      this.muteVideo();
    }
  }


  private updateRemoteUserInfo(user: IAgoraRTCRemoteUser): void {
    let roomMember = this.sharedService.roomMembers.find(x => x.VirtualEventUserId == user.uid);
    let presenter = this.presenters.find(x => x.VirtualEventUserId == user.uid);
    if (presenter) {
      presenter.PlayerId = this.mediaInfoService.getRemotePlayerId((user.uid as string));
      presenter.hasAudio = user.hasAudio;
      presenter.hasVideo = user.hasVideo;
      presenter.videoTrack = user.videoTrack;
      presenter.audioTrack = user.audioTrack;
    }
    if (roomMember) {
      roomMember.PlayerId = this.mediaInfoService.getRemotePlayerId((user.uid as string));
      roomMember.hasAudio = user.hasAudio;
      roomMember.hasVideo = user.hasVideo;
    }
  }

  private async playRemoteUserVideo(user: IAgoraRTCRemoteUser, playerId: string): Promise<void> {
    let el = await this.sharedService.checkElement('#' + playerId);
    let isScreenUser = (user.uid.toString().indexOf('screen') != -1);
    user.videoTrack?.play(el, { fit: (isScreenUser ? 'contain' : 'cover') });
    var presenter = this.presenters.find(x => x.VirtualEventUserId == user.uid);
    if (presenter && presenter.FitScreenText == 'Fill') {
      presenter.FitScreenText = 'Fit';
      this.changeScreenFit(presenter);
    }
  }

  async publishAudio(): Promise<any> {
    if (this.mediaInfoService.localTracks.audioTrack) {
      await this.videoClient.setClientRole('host');
      await this.mediaInfoService.localTracks.audioTrack.setEnabled(true).then(async () => {
        await this.videoClient.publish(this.mediaInfoService.localTracks.audioTrack);
      }).catch(ex => {
        this.mediaInfoService.localTracks.audioTrack = null;
        this.messageService.showErrorMessage("It appears your mic is being used by another application or not accessible, please provide permissions under settings.");
      });

    }
  }

  async unPublishAudio(): Promise<any> {
    if (this.mediaInfoService.localTracks.audioTrack) {
      await this.videoClient.unpublish(this.mediaInfoService.localTracks.audioTrack);
      await this.mediaInfoService.localTracks.audioTrack.setEnabled(false);
      var member = this.sharedService.roomMembers.find(x => x.VirtualEventUserId == this.sharedService.virtualEventUser.VirtualEventUserId.toString());
      if (this.sharedService.isAttendee(member) && !this.sharedService.isPresenter(member) && !this.sharedService.isHostOrCoHost(member)) {
        await this.videoClient.setClientRole('audience');
      }
    }
  }

  async publishVideo(): Promise<any> {
    await this.videoClient.setClientRole('host');
    this.mediaInfoService.localTracks.videoTrack.setEnabled(true).then(async () => {
      this.videoClient.publish(this.mediaInfoService.localTracks.videoTrack).then(async () => {
        await this.mediaInfoService.localTracks.videoTrack.setEncoderConfiguration(this.mediaInfoService.mediaInfo.selectedSendVideoResolution);
      }).catch(err => {
        console.error(err);
      });
    }).catch(ex => {
      this.mediaInfoService.localTracks.videoTrack = null;
      this.messageService.showErrorMessage("It appears your camera is being used by another application or not accessible, please provide permissions under settings.");
      console.error(ex);
    });
  }

  async unPublishVideo(): Promise<any> {
    if (this.mediaInfoService.localTracks.videoTrack) {
      await this.videoClient.unpublish(this.mediaInfoService.localTracks.videoTrack);
      await this.mediaInfoService.localTracks.videoTrack.setEnabled(false);
    }
  }


  private async playLocalVideo(member: MemberAttributes): Promise<any> {
    var playerId = this.mediaInfoService.getLocalPlayerId(this.sharedService.virtualEventUser.VirtualEventUserId.toString());
    let el = await this.sharedService.checkElement('#' + playerId);
    if (this.mediaInfoService.localTracks.videoTrack) {
      this.mediaInfoService.localTracks.videoTrack.play(el, { fit: 'cover' });
      if (member && member.FitScreenText == 'Fill') {
        member.FitScreenText = 'Fit';
        this.changeScreenFit(member);
      }
    }
  }

  closeLocalClientStream(): void {
    try {
      if (this.mediaInfoService.localTracks.videoTrack) {
        this.mediaInfoService.localTracks.videoTrack.stop();
        this.mediaInfoService.localTracks.videoTrack.close();
      }
      if (this.mediaInfoService.localTracks.audioTrack) {
        this.mediaInfoService.localTracks.audioTrack.stop();
        this.mediaInfoService.localTracks.audioTrack.close();
      }
    } catch (e) {

    }
    finally {
      this.mediaInfoService.localTracks.videoTrack = null;
      this.mediaInfoService.localTracks.audioTrack = null;
      this.dialogAudioVideoData = null;
    }
  }

  getFullName(userData: VirtualEventUserModel): string {
    if (!userData) {
      return '';
    }
    return userData.FirstName + ' ' + userData.LastName;
  }

  getCurrentTime(): Date {
    const now: Date = new Date();
    return now;
  }

  getFormatedTimeFromTimeStamp(ts: any): string {
    const now: Date = new Date(ts);
    const time = moment(now).format('hh:mm A');
    return time;
  }

  transform(value: number): string {
    const secnum = value;
    const hours = Math.floor(secnum / 3600);
    const minutes = Math.floor((secnum - (hours * 3600)) / 60);
    const seconds = secnum - (hours * 3600) - (minutes * 60);
    return this.pad(hours) + ':' + this.pad(minutes) + ':' + this.pad(seconds);
  }

  pad(n): any {
    return (n < 10) ? ('0' + n) : n;
  }

  sendVideoChatGroupInvite(member: MemberAttributes): any {

    if (member.VirtualEventUserId == this.sharedService.virtualEventUser.VirtualEventUserId.toString()) {
      return false;
    }
    if (!this.rtmClient) {
      return false;
    }
    if (member.IsBlocked && member.AllowUnblock) {
      // It means it is blocked by me
      this.messageService.showErrorMessage('You cannot send invite as this user is blocked!');
      return false;
    }
    // If member already connected then skip
    if (this.sharedService.roomMembers.filter(m => m.VirtualEventUserId == member.VirtualEventUserId).length > 0) {
      this.messageService.showErrorMessage(member.FullName + ' already connected!');
      return false;
    }

    // Create or update a private room and save in database
    const privateRoomData = {
      VirtualEventUserId: this.sharedService.virtualEventUser.VirtualEventUserId,
      VirtualEventId: this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId,
      ParticipantIds: member.VirtualEventUserId.toString(),
      StreamId: this.roomData.StreamId,
      RoomName: 'privateroom',
      AllowGuestInvite: true,
      AllowHandouts: true,
      AllowPollsAndSurvey: true,
      AllowRecording: true
    } as VirtualEventPrivateRoomModel;

    this.virtualEventService.addUpdateUserToPrivateRoom(privateRoomData).pipe(takeUntil(this.destroy$)).subscribe(d => {
      if (d && d.Data) {

        if (!d.Data.Status) {
          this.messageService.showErrorMessage('Failed to send invitation to ' + member.FirstName + ', Please try again.');
          return false;
        }

        if (d.Data.IsAlreadyAdded) {
          this.messageService.showErrorMessage('Invitation has already been sent.');
          return false;
        }

        // TODO UniqueId
        const href = `fireworks/${this.sharedService.virtualEventUser.VirtualEvent.EventId}/{0}/${this.roomData.RoomType}?token=${this.roomData.StreamId} `;
        const invitationMessage = `I would like to invite you to a private room. Please join using this <a class="routerlink" href="${href}"> link </a>`;
        const notification = {
          NotificationContent: invitationMessage,
          NotificationSentByUserId: this.sharedService.virtualEventUser.VirtualEventUserId,
          NotificationSentForUserId: Number.parseInt(member.VirtualEventUserId, 10),
          NotificationType: 'invitation',
          VirtualEventId: this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId
        } as UserNotificationModel;
        this.virtualEventService.addUserNotification(notification).pipe(takeUntil(this.destroy$)).subscribe(data => {
          if (!data || !data.Data || !data.Data) {
            this.messageService.showErrorMessage('Failed to send invitation to ' + member.FirstName);
            return;
          }

          const rtmMessage = { messageType: 'TEXT', text: invitationMessage } as RtmMessage;
          this.rtmClient.sendMessageToPeer(rtmMessage, member.VirtualEventUserId.toString(),
            { enableHistoricalMessaging: true, enableOfflineMessaging: true }).then(sendResult => {
              this.messageService.showSuccessMessage('An invitation has been sent to ' + member.FullName);
              const formatedTime = this.amCalendar.transform(new Date(), { sameDay: 'h:mm A' });
              const chatMessage = {
                senderId: this.sharedService.virtualEventUser.VirtualEventUserId.toString(),
                senderName: this.sharedService.virtualEventUser.FullName,
                time: formatedTime,
                rtmMessage,
                self: true,
                receiverId: member.VirtualEventUserId.toString(),
                receiverName: member.FullName
              } as ChatMessage;
              this.sharedService.setPrivateChatData(chatMessage);
              // Send another message to trigger notification
              const videoCallInvitationNotification = this.sharedService.videoCallInvitationNotificationPattern + member.VirtualEventUserId;
              const notificationMessage = { messageType: 'TEXT', text: videoCallInvitationNotification } as RtmMessage;
              this.sharedService.rtmClient.sendMessageToPeer(notificationMessage, member.VirtualEventUserId.toString(),
                { enableHistoricalMessaging: false, enableOfflineMessaging: true })
                .then((s) => { console.log(s); }).catch(error => {
                  console.error(error);
                });
            }).catch(error => {
              this.messageService.showErrorMessage('An error occurred while sending the message!');
              console.error(error);
            });
        });
      }
      else {
        this.messageService.showErrorMessage('Failed to send invitation to ' + member.FirstName + ', Please try again.');
        return false;
      }
    });
  }

  minimizeAttendeeView(): void {
    this.attendeesMaximized = false;
  }

  maximizeAttendeeView(): void {
    this.attendeesMaximized = true;
  }

  showAttendeeGridView(): void {
    this.attendeeViewClassName = 'listView';
    this.attendeeGridViewEnabled = true;
  }

  showAttendeeeListView(): void {
    this.attendeeViewClassName = 'gridView';
    this.attendeeGridViewEnabled = false;
  }

  onMouseOver(event): void {
    if (this.timeout != undefined) {
      window.clearTimeout(this.timeout);
    }
    const element = document.getElementById('autoHideMe');
    if (element) {
      element.classList.remove('hideActionButton');
      this.timeout = window.setTimeout(() => {
        element.classList.add('hideActionButton');
      }, 2000);
    }
  }

  pinUserToMainView(pinnedUser: MemberAttributes): void {

    if (this.presenters.length && this.presenters.length == 1) {
      return;
    }

    if (pinnedUser.PinnedToMainView) {
      pinnedUser.PinText = 'Pin';
      this.hasPinnedVideo = false;
      pinnedUser.PinnedToMainView = false;
      this.presenters = this.presenters.filter(call => call.VirtualEventUserId != pinnedUser.VirtualEventUserId);
      this.presenters.splice(this.previousPinnedVideoIndex, 0, pinnedUser);
      this.AdjustPresenterView();
    } else {
      this.presenters.forEach(x => { x.PinnedToMainView = false; x.PinText = 'Pin' });
      pinnedUser.PinText = 'Unpin';
      this.previousPinnedVideoIndex = this.presenters.indexOf(pinnedUser);
      this.presenters = this.presenters.filter(call => call.VirtualEventUserId != pinnedUser.VirtualEventUserId);
      this.hasPinnedVideo = true;
      pinnedUser.PinnedToMainView = true;
      this.presenters.unshift(pinnedUser);
    }
  }

  private createLogMessage(eventName: string, remoteUserId: any, message: any, hasAudio: boolean, hasVideo: boolean): string {
    const logMessage =
      `AudioEnabled : ${hasAudio ? 'Yes' : 'No'}, `
      + `VideoEnabled : ${hasVideo ? 'Yes' : 'No'}, `
      + `LocalUserId : ${this.sharedService.virtualEventUser.VirtualEventUserId}, `
      + `RemoteUserId : ${remoteUserId}, `
      + `EventChannelName : ${this.sharedService.virtualEventUser.VirtualEvent.EventChannelName}, `
      + `RoomChannel : ${this.roomData.RoomChannelName}, `
      + `EventName : ${eventName}, `
      + `Message : ${message}`;
    return logMessage;
  }

  onCountdownFinish(data: any): void {
    if (data.action == 'done') {
      this.countdown = 0;
      this.setRoomCloseCountDown();
    }
  }

  closeCurrentAndSetUpcomingSchedule(): void {
    this.currentSchedule.ScheduleStatus = 3; // closed       
    this.roomCloseCountdown = 0;

    var currentDateTimestamp = Date.parse(moment.utc().format());
    this.currentSchedule = this.sharedService.eventSchedules.filter(s => s.VirtualEventRoomId == this.roomData.VirtualEventRoomId
      && Date.parse(moment.utc(s.StartDateUtc).format()) > currentDateTimestamp
    )[0];
    if (this.currentSchedule) {
      var countdownData = this.sharedService.getScheduleCountDown(this.currentSchedule.StartDateUtc);
      this.countdown = countdownData.countdown;
      this.roomCountdownFormat = countdownData.format;
    }
  }

  onRoomCloseCountdownFinish(data: any): void {
    if (data) {
      this.sharedService.saveFireworksActivity(this.sharedService.currentRoomData.VirtualEventRoomId,
        this.sharedService.virtualEventUser.VirtualEventUserId, EnumerationTrackingActivityType.LeaveFireworksRoom, this.sharedService.currentRoomData.RoomType);
      this.closeCurrentAndSetUpcomingSchedule();
      this.leaveAllClients().then(() => {
        this.sharedService.roomClientConnected = false;
      }, (reason: any) => {
        this.messageService.showErrorMessage("We have some issue to leave this room. Please try to refresh and join again.")
      });
    }
  }

  // TODO
  CustomCountdownFormatFn(data): void {
    console.log(data);
  }

  assignRoomSignalingHandlers(channel: RtmChannel): void {
    if (channel) {
      channel.on('ChannelMessage', (message: RtmTextMessage, remoteUserId, messagePros) => {
        if (message.text && !this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)
          && !this.sharedService.isPresenter(this.sharedService.virtualEventUser)) {

          if (message.text === this.sharedService.muteUserCommand) {
            this.muteMic();
          }

          if (message.text === this.sharedService.unmuteUserCommand) {
            this.unmuteMic();
          }
        }
      });
    }
  }

  private getAllowedUserFeatures(member: MemberAttributes): void {
    if (!member) {
      return;
    }
    this.virtualEventService.getAllowedUserFeatures(member.VirtualEventUserId)
      .pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (res && res.Data) {
          this.sharedService.fireworksFeatures = res.Data;
        }
      });
  }

  private changeMemberRole(rMember: MemberAttributes): void {
    // for local user
    this.sharedService.getMemberInfo(rMember).then(() => {
      this.getAllowedUserFeatures(rMember);
      if (this.sharedService.isPresenter(rMember)) {
        this.changeRoleToPresenter(rMember);
      } else {
        this.changeRoleToAttendee(rMember);
      }
    });
  }

  private updateChannelAttribute(userId: string, role: string, showMessage: boolean = true) {
    var channelAttributes = {
      lastUpdateUserId: userId
    } as AttributesMap;
    this.sharedService.rtmClient.addOrUpdateChannelAttributes(this.sharedService.rtmRoomChannel.channelId, channelAttributes, this.option).then(() => {
      if (showMessage) {
        this.messageService.showSuccessMessage('You are a ' + role + ' now.');
      }
    });
  }

  private changeRoleToPresenter(member: MemberAttributes, showMessage: boolean = true): void {
    if (!this.presenters.find(x => x.VirtualEventUserId == member.VirtualEventUserId.toString())) {
      this.presenters = [...this.presenters, member];
      if (this.sharedService.isHostOrCoHost(member)) {
        //display on screen  
        this.publishVideo().then(() => {
          this.playLocalVideo(member).then(() => {
            this.mediaInfoService.localTrackState.videoTrackEnabled = true;
            this.updateChannelAttribute(member.VirtualEventUserId.toString(), 'presenter', showMessage);
          });
        });
      } else {
        if (this.sharedService.allowUnmuteMyself) {
          this.updateChannelAttribute(member.VirtualEventUserId.toString(), 'presenter');
        } else {
          this.videoClient.setClientRole('host').then(() => {
            var mediaSettings = this.mediaInfoService.getMediaSettingFromLocalStorage();
            this.mediaInfoService.localTrackState.audioTrackEnabled = mediaSettings.localAudioEnable;
            this.mediaInfoService.localTrackState.videoTrackEnabled = mediaSettings.localVideoEnable;
            this.setRoleAndPublishAudioVideo().then(() => {
              var msg = "You are a presenter now";
              this.messageService.showSuccessMessage(msg);
            });
          });
        }
      }
      if (!member.PlayerId) {
        member.PlayerId = this.mediaInfoService.getRemotePlayerId(member.VirtualEventUserId);
      }
      this.sharedService.checkElement('#' + member.PlayerId).then(() => {
        this.AdjustPresenterView();
      });
    } else {
      this.sharedService.getMemberInfo(member).then(() => {
        var role = this.sharedService.isHostOrCoHost(member) ? 'co-host' : 'presenter';
        this.updateChannelAttribute(member.VirtualEventUserId.toString(), role);
      });
    }
  }

  private changeRoleToAttendee(member: MemberAttributes, showMessage: boolean = true): void {
    this.presenters = this.presenters.filter(x => x.VirtualEventUserId != member.VirtualEventUserId.toString());
    if (this.sharedService.isHostOrCoHost(member)) {
      //remove from screen 
      this.unPublishVideo().then(() => {
        this.updateChannelAttribute(member.VirtualEventUserId.toString(), 'co-host', showMessage);
      });
    } else {
      this.sharedService.allowUnmuteMyself = false;
      this.stopScreenShare();
      this.muteVideo();
      this.muteAudio();
      var msg = "You are attendee now";
      this.messageService.showSuccessMessage(msg);
    }
    setTimeout(() => {
      this.AdjustPresenterView();
    }, 200);
  }

  private showHideOnDisplay(member: MemberAttributes): void {
    var data = new ManageUserRoleModel();
    data.VirtualEventId = this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId;
    data.VirtualEventUserId = parseInt(member.VirtualEventUserId);
    data.VirtualEventRoleId = this.enumerationUserRole.Attendee;
    data.IsEnabled = !this.sharedService.checkUserRole(this.enumerationUserRole.Attendee, member);
    data.MemberName = member.FullName;
    data.UserRole = EnumerationUserRole[this.enumerationUserRole.Attendee].replace("_", "-");
    data.VirtualEventRoomId = member.CurrentRoomId;
    data.RoomName = member.CurrentRoom;
    this.virtualEventService.manageUserRole(data).pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res) {
        this.sharedService.getMemberInfo(member).then(() => {
          if (this.sharedService.checkUserRole(this.enumerationUserRole.Attendee, member)) {
            this.muteVideo();
            this.changeRoleToAttendee(member, false);
          } else {
            this.changeRoleToPresenter(member, false);
          }
        });
      }
    });
  }

  assignUserSignalingHandlers(rtmClient: RtmClient): void {
    if (!rtmClient) {
      return;
    }

    rtmClient.on('MessageFromPeer', (message: RtmMessage, remoteUserId, messagePros) => {
      const rtmTextMessage = message as RtmTextMessage;
      if (rtmTextMessage.text && rtmTextMessage.text == this.sharedService.muteUserCommand) {
        if (this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)) {
          return;
        }
        this.muteMic();
      }
      else if (rtmTextMessage.text && rtmTextMessage.text == this.sharedService.unmuteUserCommand) {
        this.unmuteMic();
      } else if (rtmTextMessage.text == this.sharedService.roleChange) {
        var rMember = this.sharedService.roomMembers.find(m => m.VirtualEventUserId == this.sharedService.virtualEventUser.VirtualEventUserId.toString());
        if (!rMember) {
          rMember = this.sharedService.roomMembers.find(m => m.VirtualEventUserId == this.sharedService.virtualEventUser.VirtualEventUserId.toString());
        }
        this.changeMemberRole(rMember);
      }
    });

    rtmClient.on('ConnectionStateChanged', (newState: string, reason: string) => {
      if (newState == 'CONNECTED') {
        if (this.sharedService.roomClientConnected) {
          this.broadcastLocalUserJoinRoomStatus({
            VirtualEventRoomId: this.roomData.VirtualEventRoomId,
            VirtualEventUserId: this.sharedService.virtualEventUser.VirtualEventUserId
          }, true);
        }
      }
    })
  }

  // Update room members array
  subscribeUpdateRoomMembersDetailsFromEventMembers(): void {
    this.sharedService.onUpdateEventMembersOnlineCommand.pipe(takeUntil(this.destroy$)).subscribe(s => {
      this.sharedService.roomMembers.forEach(roomMember => {
        const member = this.sharedService.eventMembers.find(x => x.VirtualEventUserId == roomMember.VirtualEventUserId);
        if (member) {
          // Update presenters array
          const presenter = this.presenters.find(x => x.VirtualEventUserId == roomMember.VirtualEventUserId);
          if (presenter) {
            this.setPresenterOrAttendeeBasicDetails(presenter, roomMember, member);
          }
        }
      });
    });
  }

  private setPresenterOrAttendeeBasicDetails(presenterOrAttendee: MemberAttributes, roomMember: MemberAttributes, updatedOne: MemberAttributes): void {
    presenterOrAttendee.FirstName = updatedOne.FirstName;
    presenterOrAttendee.LastName = updatedOne.LastName;
    presenterOrAttendee.ProfileImageUrl = updatedOne.ProfileImageUrl;
    presenterOrAttendee.VirtualEventUserRoles = updatedOne.VirtualEventUserRoles;
    presenterOrAttendee.Alt = this.sharedService.getUserShortName(updatedOne.FullName);
    presenterOrAttendee.FullName = updatedOne.FullName;
    presenterOrAttendee.Title = updatedOne.Title;

    roomMember.FirstName = updatedOne.FirstName;
    roomMember.LastName = updatedOne.LastName;
    roomMember.ProfileImageUrl = updatedOne.ProfileImageUrl;
    roomMember.VirtualEventUserRoles = updatedOne.VirtualEventUserRoles;
    roomMember.Alt = this.sharedService.getUserShortName(updatedOne.FullName);
    roomMember.FullName = updatedOne.FullName;
    roomMember.Title = updatedOne.Title;
  }

  isAllowedToRejoinFromWaitRoom(): boolean {
    if (this.roomData && !this.roomData.IsAllowedToJoinRoom && this.roomData.WaitRoomRemoveBy > 0) {
      const data = new BroadcastDataModel();
      data.UserIds = [this.roomData.WaitRoomRemoveBy]; // broadcast to selected attendees only.
      data.VirtualEventId = this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId;
      data.DataType = RoomBaseAction.RejoinFromWaitRoom;
      data.Data = {
        RoomId: this.roomData.VirtualEventRoomId,
        RoomName: this.roomData.RoomName,
        MemberName: this.sharedService.virtualEventUser.FullName,
        ActionName: RoomBaseAction.RejoinFromWaitRoom,
        MemberId: this.sharedService.virtualEventUser.VirtualEventUserId
      };

      this.virtualEventService.broadcastClientDataToEventClients(data).pipe(takeUntil(this.destroy$)).subscribe(res => {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          data: {
            Title: 'Please wait',
            Message: 'Let Host/Co-host let you in.'
          } as ConfirmDialogComponentData
        });
      });
      return false;
    }
    return true;

  }

  changeScreenFit(member: MemberAttributes): void {
    let playerId: string = member.videoTrack?.getTrackId();
    if (!playerId) {
      if (member.VirtualEventUserId.toString().indexOf('screen') != -1) {
        let userId = this.mediaInfoService.getIdOfScreenUser(member.VirtualEventUserId);
        if (this.sharedService.virtualEventUser.VirtualEventUserId.toString() == userId) {
          playerId = this.mediaInfoService.localTracks.screenTrack.getTrackId();
        }
      } else {
        if (this.sharedService.isSelfUser(member)) {
          playerId = this.mediaInfoService.localTracks.videoTrack.getTrackId();
        }
      }
    }

    if (playerId) {
      const el = document.getElementById('video_' + playerId);
      if (member.FitScreenText == 'Fit') {
        member.FitScreenText = 'Fill';
        this.renderer.setStyle(el, 'object-fit', 'contain');
      } else {
        member.FitScreenText = 'Fit';
        this.renderer.setStyle(el, 'object-fit', 'cover');
      }
    }
  }

  removeUserFromRoom(member: MemberAttributes): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        Title: 'Please confirm',
        Message: 'Are you sure you want to remove?',
        CancelText: 'No',
        OkText: 'Yes'
      } as ConfirmDialogComponentData
    });
    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        const data = new BroadcastDataModel();
        data.UserIds = [parseInt(member.VirtualEventUserId, 10)]; // broadcast to selected attendees only.
        data.VirtualEventId = this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId;
        data.DataType = RoomBaseAction.Kickout;
        // todo: Move to waitroom functionality.
        data.UserIds.forEach((virtualEventUserId: any) => {
          this.sharedService.saveFireworksActivity(this.sharedService.currentRoomData.VirtualEventRoomId,
            virtualEventUserId, EnumerationTrackingActivityType.LeaveFireworksRoom, this.sharedService.currentRoomData.RoomType);
        });
        this.virtualEventService.broadcastClientDataToEventClients(data).pipe(takeUntil(this.destroy$)).subscribe(res => {
          this.messageService.showSuccessMessage('Selected user removed from room(s)');
        }, error => {
          console.log(error);
        });
      }
    });
  }

  checkIfPresenterJoined(): boolean {
    if (this.presenters && this.presenters.length > 0) {
      return true;
    } else {
      let isHostNotOnDisplay = this.sharedService.roomMembers.find(x => this.sharedService.isHostOrCoHost(x) && this.sharedService.checkUserRole(this.enumerationUserRole.Attendee, x));
      if (isHostNotOnDisplay) {
        return true;
      }
    }
    return false;
  }

  showVirtualBackground(): boolean {
    if (this.checkIfPresenterJoined()) {
      return true;
    } else {
      if (this.sharedService.checkUserRole(this.enumerationUserRole.Attendee, this.sharedService.virtualEventUser)
        && !this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)) {
        return false;
      } else {
        return true;
      }
    }
  }

  raiseHand(): void {
    if (this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)) {
      this.showRaiseHandList = true;
    } else {
      const hostAndCoHostIds = this.sharedService.eventMembers.filter(m => this.sharedService.isHostOrCoHost(m))
        .map(x => parseInt(x.VirtualEventUserId));

      const clientData = new BroadcastDataModel();
      clientData.DataType = RoomBaseAction.RaiseHand;
      clientData.VirtualEventId = this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId;
      clientData.UserIds = hostAndCoHostIds;
      clientData.Data = {
        memberId: this.sharedService.virtualEventUser.VirtualEventUserId,
        roomName: this.roomData.RoomName,
        roomId: this.roomData.VirtualEventRoomId
      };
      this.virtualEventService.broadcastClientDataToEventClients(clientData).pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.messageService.showSuccessMessage('We sent your unmute mic request to the host, please standby.');
      });
    }
  }

  approveOrRejectRaiseHandRequest(member: MemberAttributes, approve: boolean, allUsers: boolean): void {
    if (this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)) {
      let memberIds = this.sharedService.eventMembers.filter(x => x.VirtualEventUserId != this.sharedService.virtualEventUser.VirtualEventUserId.toString()
        && this.sharedService.isHostOrCoHost(x)).map(m => parseInt(m.VirtualEventUserId));

      if (allUsers) {
        memberIds = memberIds.concat(this.sharedService.raiseHandMemberList.map(m => parseInt(m.VirtualEventUserId)));
        this.sharedService.raiseHandMemberList.forEach(m => m.IsAllowedUmuting = true);
      }
      else {
        memberIds.push(parseInt(member.VirtualEventUserId));
        member.IsAllowedUmuting = true;
      }
      const clientData = new BroadcastDataModel();
      clientData.DataType = RoomBaseAction.ApproveRejectRaiseHand;
      clientData.VirtualEventId = this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId;
      clientData.UserIds = memberIds;
      clientData.Data = {
        approve: approve,
        roomName: allUsers ? '' : member.CurrentRoom,
        memberId: allUsers ? 0 : member.VirtualEventUserId,
        allUsers: allUsers
      };
      this.virtualEventService.broadcastClientDataToEventClients(clientData).pipe(takeUntil(this.destroy$)).subscribe(() => {
        if (allUsers) {
          this.sharedService.raiseHandMemberList = [];
        } else {
          var removeMember = this.sharedService.raiseHandMemberList.find(m => m.VirtualEventUserId == member.VirtualEventUserId);
          this.sharedService.raiseHandMemberList.splice(this.sharedService.raiseHandMemberList.indexOf(removeMember), 1);
        }
        this.messageService.showSuccessMessage('Raise hand request ' + (approve ? 'approved' : 'rejected') + ' successfully.');
      });
    }
  }

  broadcastLocalUserJoinRoomStatus(roomData: any, joined: boolean): void {
    const data = new BroadcastDataModel();
    data.VirtualEventId = this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId;
    data.DataType = joined ? RoomBaseAction.OnJoinRoom : RoomBaseAction.OnLeaveRoom;
    data.Data = roomData;
    this.virtualEventService.broadcastClientDataToEventClients(data).subscribe(() => { });
  }

  subscribeRemoteUserJoinRoomStatus(): void {
    this.sharedService.onRemoteUsersJoinRoom.pipe(takeUntil(this.destroy$)).subscribe(m => {
      if (m) {
        if (m.VirtualEventRoomId == this.roomData.VirtualEventRoomId) {
          var otherJoinedMemberInThisRoom = this.sharedService.eventMembers.find(x => x.VirtualEventUserId == m.VirtualEventUserId);
          if (otherJoinedMemberInThisRoom) {
            var clone = Object.assign({}, otherJoinedMemberInThisRoom);
            clone.Online = true;

            if (this.sharedService.roomClientConnected) {
              var isMemberExistInRoomView = this.sharedService.roomMembers.find(x => x.VirtualEventUserId.toString() == m.VirtualEventUserId.toString());
              if (!isMemberExistInRoomView) {
                this.sharedService.roomMembers.push(clone);
              }
            }
            this.sharedService.setPeoplesData();
          }
        }
      }
    });

    this.sharedService.onRequestToBroadcastMyJoinStatus.pipe(takeUntil(this.destroy$)).subscribe(m => {
      if (m) {
        if (m.VirtualEventRoomId == this.roomData.VirtualEventRoomId && this.sharedService.roomClientConnected) {
          this.broadcastLocalUserJoinRoomStatus({
            VirtualEventRoomId: this.roomData.VirtualEventRoomId,
            VirtualEventUserId: this.sharedService.virtualEventUser.VirtualEventUserId
          }, true);
        }
      }
    });
  }

  requestOtherUserToBroadcastJoinedRoomStatus(roomData: any): void {
    const data = new BroadcastDataModel();
    data.VirtualEventId = this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId;
    data.DataType = RoomBaseAction.OnRequestBroadcastRoomInfo;
    data.Data = roomData;
    this.virtualEventService.broadcastClientDataToEventClients(data).pipe(takeUntil(this.destroy$)).subscribe(res => { });
  }

  videoStatus(member: MemberAttributes): boolean {
    if (this.sharedService.isSelfUser(member) && this.mediaInfoService.localTracks.videoTrack) {
      member.hasVideo = this.mediaInfoService.localTracks.videoTrack.getMediaStreamTrack().readyState == 'live';
    }
    return member.hasVideo;
  }

  getInviteMembers(): MemberAttributes[] {
    return this.sharedService.eventMembers
      .filter(x => x.VirtualEventUserId != this.sharedService.virtualEventUser.VirtualEventUserId.toString() && x.Online);
  }

  Area(Increment: number, Count: any, Width: number, Height: number, Margin = 50) {
    let i = 0, w = 0;
    let h = Increment * 0.75 + (Margin * 2);
    while (i < (Count)) {
      if ((w + Increment) > Width) {
        w = 0;
        h = h + (Increment * 0.75) + (Margin * 2);
      }
      w = w + Increment + (Margin * 2);
      i++;
    }
    if (h > Height) return false;
    else return Increment;
  }

  setWidth(width: number, margin: number) {
    let presenterViews = document.getElementsByClassName('videoBox');
    for (var s = 0; s < presenterViews.length; s++) {
      this.renderer.setStyle(presenterViews[s], 'width', width + "px");
      this.renderer.setStyle(presenterViews[s], 'margin', margin + "px");
      this.renderer.setStyle(presenterViews[s], 'height', (width * 0.75) + "px");
    }
  }

  AdjustPresenterView(panelData: any = null) {
    if (this.roomData && this.roomData.MediaType.toLowerCase() == 'video' && this.roomData.VideoSource.toLowerCase() == 'eventcombo') {
      // variables:
      let Margin = 2;
      let Scenary = document.getElementById('conferenceLayout');
      if (Scenary) {
        let Width = Scenary.offsetWidth - (Margin * 2);
        let Height = Scenary.offsetHeight - (Margin * 2);

        if (panelData) {
          if (panelData.open) {
            Width = panelData.panel == 'right' ? Width - 400 : Width - 240;
          }
        }

        let videoBoxes = document.getElementsByClassName('videoBox');
        let max = 0;

        //loop (i recommend you optimize this)
        let i = 1;
        while (i < 5000) {
          let w = this.Area(i, videoBoxes.length, Width, Height, Margin);
          if (w === false) {
            max = i - 1;
            break;
          }
          i++;
        }

        // set styles
        max = max - (Margin * 2);
        this.setWidth(max, Margin);
      }
    }
  }

  virtualBackgroundUrl: string;
  hasBackgroundImage() {
    let hasBackground = false;
    if (this.roomData) {
      if (this.roomData.ShowBackgroundImage && this.roomData.BackgroundImage) {
        this.virtualBackgroundUrl = environment.domainUrl + this.roomData.BackgroundImage.ImagePath;
        hasBackground = true;
      } else {
        var ve = this.sharedService.virtualEventUser.VirtualEvent;
        if (ve && ve.ShowBackgroundImage && ve.BackgroundImagePath) {
          this.virtualBackgroundUrl = environment.domainUrl + ve.BackgroundImagePath;
          hasBackground = true;
        }
      }
    }
    return hasBackground;
  }
}
