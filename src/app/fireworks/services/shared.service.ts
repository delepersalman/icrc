import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { BreakoutRoomModel, RoomBaseAction, RoomType, VirtualEventRoomModel } from '../models/virtualevent.room.model';
import { EnumerationUserRole, FireworksFeatures, ManageUserRoleModel, UserRole, VirtualEventUserModel } from '../models/virtualevent.user.model';

import { environment } from '../../../environments/environment';
import { UserNotificationModel, DialogAudioVideoData, ConfirmDialogComponentData, SaveFireworksActivityModel } from '../models/common.model';
import { MemberAttributes, RtmClient, RtmMessage, ChatMessage, RtmChannel, RtmTextMessage } from '../models/rtm.model';
import { Validator } from './validator';
import { HttpParams } from '@angular/common/http';
import { MessageService } from '../../shared/services/message.service';
import { EventScheduleModel, EventSpeakerModel, EventSponsorModel } from '../models/virtualevent.model';
import * as moment from 'moment';
import { FwRoomComponent } from '../shared/fw-room/fw-room.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { VirtualEventService } from './virtualevent.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { sleep } from '../constants/fireworks-constants';
import { HandoutsDataModel } from '../models/handouts.model';

@Injectable()
export class SharedFireworksComponentService {
  domainUrl = environment.domainUrl;
  virtualEventUser: VirtualEventUserModel;
  roomClientConnected: boolean = false;
  temporaryConnect: boolean = false;
  raiseHandMemberList: MemberAttributes[] = [];
  selectedTab = 'Schedule';
  onSurveyAdd: Subject<any> = new Subject<any>();
  onRoleChange: Subject<any> = new Subject<any>();
  onRoomDataUpdate: Subject<any> = new Subject<any>();
  onBoothUpdate: Subject<any> = new Subject<any>();
  onTicketPurchase: Subject<any> = new Subject<any>();
  onChangeSelfViewSetting: Subject<any> = new Subject<any>();
  onScheduleUpdate: Subject<any> = new Subject<any>();
  headerRightBoxHeight = 0;
  enableChatRoom: boolean = false;
  onEventMembersUpdated: Subject<any> = new Subject<any>();
  onBreakoutRoomOpen: Subject<any> = new Subject<any>();
  onMessageBroadcastToBreakoutRoom: Subject<any> = new Subject<any>();
  onBreakoutRoomClose: Subject<any> = new Subject<any>();
  onEventInfoUpdate: Subject<any> = new Subject<any>();
  onMessageBroadcastToRooms: Subject<any> = new Subject<any>();
  onUpdateEventMembersOnlineCommand: Subject<any> = new Subject<any>();
  eventSchedules: EventScheduleModel[];
  onlayoutResize: Subject<any> = new Subject<any>();
  allowUnmuteMyself: boolean = true;
  currentView = 'room';

  enableAlertNotificationSound: boolean = true;
  enableSelfView: boolean = false;
  enableAudioVideo: boolean = true;
  autoJoin: boolean = false;
  //end user settings
  fireworksFeatures: Array<FireworksFeatures>;

  rtmRoomChannelDictionary: { [id: string]: RtmChannel; } = {};
  rtmRoomChannel: RtmChannel;

  displayattendeeInfoOverlay = false;
  attendeeInfoOverlay: VirtualEventUserModel;
  roomIdForPageReloadComparision: number;

  onRemoteUsersJoinRoom: Subject<any> = new Subject<any>();
  onRequestToBroadcastMyJoinStatus: Subject<any> = new Subject<any>();
  fwRoom: FwRoomComponent;
  rightSidebarExpended: boolean;
  onHandoutsDocumentLoaded = new Subject<any>();
  onEventSpeakerLoaded = new Subject<any>();
  onEventSponsorLoaded = new Subject<any>();
  boothLoaded = false;

  filterAttendeeValue = 'All';
  scheduleStatus = {
    1: 'In progress',
    2: 'Upcoming',
    3: 'Closed'
  }

  destroy$ = new Subject();

  eventSponsors: EventSponsorModel[];
  eventSpeakers: EventSpeakerModel[];
  handoutDocuments: HandoutsDataModel[];

  constructor(private messageService: MessageService, private virtualEventService: VirtualEventService) {

  }

  resizeLayout(panel: any) {
    this.onlayoutResize.next(panel);
  }

  broadcastMessageToRooms(data: any) {
    this.onMessageBroadcastToRooms.next(data);
  }

  updateEventInfo() {
    this.onEventInfoUpdate.next();
    this.setRightSideBarVisibility();
  }

  addNewSurvey(data: any) {
    this.onSurveyAdd.next(data);
  }

  openBreakoutRooms(data: any) {
    this.onBreakoutRoomOpen.next(data);
  }

  broadcastMessageToBreakoutRooms(message: string) {
    this.onMessageBroadcastToBreakoutRoom.next(message);
  }

  closeBreakoutRooms(data: BreakoutRoomModel) {
    this.onBreakoutRoomClose.next(data);
  }

  changeUserRole(userId: string, isOfflineUser: boolean = false) {
    this.onRoleChange.next({ userId: userId, isOfflineUser: isOfflineUser });
  }

  purchaseTicket(data: MemberAttributes[]) {
    this.onTicketPurchase.next(data);
  }

  updateRoomInfo(data: { VirtualEventRoomId: any; }) {
    this.onRoomDataUpdate.next(data);
    this.setRightSideBarVisibility();
  }

  updateBoothInfo(data: any) {
    this.onBoothUpdate.next(data);
  }

  updateEventMember(member: MemberAttributes) {
    this.onEventMembersUpdated.next(member);
  }

  eventMembers: MemberAttributes[];
  roomMembers: MemberAttributes[] = [];
  rtmClient: RtmClient;
  rtmEventChannel: RtmChannel;
  rtmEventSignalingChannel: RtmChannel;
  attendees: MemberAttributes[];
  presenters: MemberAttributes[];
  hostAndCohost: MemberAttributes[];

  private roomData = new BehaviorSubject<VirtualEventRoomModel>(null);
  roomData$ = this.roomData.asObservable();

  private userNotificationsData = new BehaviorSubject<UserNotificationModel>(null);
  notificationData$ = this.userNotificationsData.asObservable();

  private privateChatData = new BehaviorSubject<ChatMessage>(null);
  privateChatData$ = this.privateChatData.asObservable();

  private refreshNotificationData = new BehaviorSubject<boolean>(false);
  refreshNotificationData$ = this.refreshNotificationData.asObservable();

  private dialogAudioVideoData = new BehaviorSubject<DialogAudioVideoData>(null);
  dialogAudioVideoData$ = this.dialogAudioVideoData.asObservable();

  setRoomData(roomData: VirtualEventRoomModel) {
    if (roomData && roomData.RoomType == RoomType.Handouts) {
      return;
    }
    // These lines of code still should be executed if roomData got undefined
    this.roomData.next(roomData);
    this.currentRoomData = roomData;
  }

  addNotificationData(data: UserNotificationModel) {
    this.userNotificationsData.next(data);
  }

  setPrivateChatData(message: ChatMessage) {
    this.privateChatData.next(message);
  }

  refreshNotificationsData(refresh: boolean) {
    this.refreshNotificationData.next(refresh);
  }

  setDialogAudioVideoData(data: DialogAudioVideoData) {
    this.dialogAudioVideoData.next(data);
  }

  // currentUser: MemberAttributes;

  getUserShortName(fullName: string) {
    if (fullName) {
      return fullName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'UU';
  }

  userUniqueAccessToken: string;
  userUniqueSessionId: string;

  //TODO Improvement
  getBrowserName() {
    const agent = window.navigator.userAgent.toLowerCase();
    switch (true) {
      case agent.indexOf('edge') > -1:
        return 'edge';
      case agent.indexOf('opr') > -1 && !!(<any>window).opr:
        return 'opera';
      case agent.indexOf('chrome') > -1 && !!(<any>window).chrome:
        return 'chrome';
      case agent.indexOf('trident') > -1:
        return 'ie';
      case agent.indexOf('firefox') > -1:
        return 'firefox';
      case agent.indexOf('safari') > -1:
        return 'safari';
      default:
        return 'other';
    }
  }

  private validateChannelName(channelName: string) {
    if (Validator.isNonEmpty(channelName)) {
      return 'Cannot be empty!';
    }
    if (Validator.minLength(channelName, 1)) {
      return 'No shorter than 1!';
    }
    if (Validator.maxLength(channelName, 16)) {
      return 'No longer than 16!';
    }
    if (Validator.validChar(channelName)) {
      return 'Only capital or lower-case letter, number and "_" are permitted!';
    }
    return '';
  };

  //TODO add more pattern
  videoCallInvitationNotificationPattern = 'ec.fireworks.user.action.sendvideolink.';
  blockUserNotificationPattern = 'ec.fireworks.user.action.block.';
  unblockUserNotificationPattern = 'ec.fireworks.user.action.unblock.';
  kickOutUserFromRoom = 'ec.fireworks.user.action.kickoff.';
  muteUserCommand = 'ec.fireworks.user.action.mute.';
  unmuteUserCommand = 'ec.fireworks.user.action.unmute.';

  allowUnmuteUserCommand = 'ec.fireworks.user.unmute.allow';
  deniedUnmuteUserCommand = 'ec.fireworks.user.unmute.denied';

  getUserDataPattern = 'ec.fireworks.user.action.get.userdata__';
  sendUserDataPattern = 'ec.fireworks.user.action.send.userdata__';

  applicableUserDataActions = <'roomname' | 'kickoff' | 'movetoroom'>'';
  moveAttendee = 'ec.fireworks.user.action.movetoroom';
  roleChange = 'ec.fireworks.user.action.rolechange';
  selfRoleChange = 'ec.fireworks.user.action.selfRolechange';
  systemSignalingCommands: string[] = [
    this.videoCallInvitationNotificationPattern,
    this.blockUserNotificationPattern,
    this.unblockUserNotificationPattern,
    this.videoCallInvitationNotificationPattern,
    this.kickOutUserFromRoom,
    this.muteUserCommand,
    this.unmuteUserCommand,
    this.allowUnmuteUserCommand,
    this.deniedUnmuteUserCommand,
    this.getUserDataPattern,
    this.sendUserDataPattern
  ]

  currentRoomData: VirtualEventRoomModel;

  setRoomChannelName(roomData: VirtualEventRoomModel) {
    if (!roomData) {
      return;
    }
    roomData.RoomChannelName = 'fireworks.room.' + roomData.StreamId;
  }

  changeSelfViewSetting(data: boolean) {
    this.onChangeSelfViewSetting.next(data);
  }

  onSendUserData: Subject<any> = new Subject<any>();
  onGetUserData: Subject<any> = new Subject<any>();
  //Move Attendee
  onMoveAttendeeList: Subject<any> = new Subject<any>();
  onUpdateManageAttendeeRoom: Subject<any> = new Subject<any>();
  onAttendeeRemove: Subject<any> = new Subject<any>();
  onMuteUnMuteAllAttendees: Subject<any> = new Subject<any>();
  onRaiseHand: Subject<any> = new Subject<any>();
  onRaiseHandApproveReject: Subject<any> = new Subject<any>();

  pushToRaiseHandList(memberData: any): void {
    this.onRaiseHand.next(memberData);
  }

  approveOrRejectRaiseHand(responseData: any): void {
    this.onRaiseHandApproveReject.next(responseData);
  }

  muteUnMuteAll(mute: boolean) {
    this.onMuteUnMuteAllAttendees.next(mute);
  }

  setMoveAttendee(data) {
    if (data.ActionName == RoomBaseAction.GetRoomName) {
      this.onUpdateManageAttendeeRoom.next(data);
    }
    else {
      this.onMoveAttendeeList.next(data);
    }
  }

  removeFromRoom(data: any) {
    this.onAttendeeRemove.next(data);
  }

  onSetAttendeeRoomName: Subject<any> = new Subject<any>();
  setAttendeeRoomName(data) {
    this.onSetAttendeeRoomName.next(data);
  }

  onGetAttendeeRoomName: Subject<any> = new Subject<any>();
  getAttendeeRoom(data) {
    this.onGetAttendeeRoomName.next(data);
  }
  //Wait Room
  onRejoinFromWaitRoom: Subject<any> = new Subject<any>();
  setRejoinFromWaitRoom(data) {
    this.onRejoinFromWaitRoom.next(data);
  }

  //End Event Signaling
  isFeatureEnabled(featureCode: string): boolean {
    if (this.fireworksFeatures && this.fireworksFeatures.length > 0
      && this.fireworksFeatures.filter(x => x.FeatureCode == featureCode).length > 0) {
      return true;
    }
    else { return false; }
  }

  checkUserRole(enumerationUserRole: EnumerationUserRole, members: any): boolean {
    if (members.VirtualEventUserRoles
      .find((x: { VirtualEventRoleId: EnumerationUserRole; }) => x.VirtualEventRoleId == enumerationUserRole)) {
      return true;
    }
    else { return false; }
  }

  isAttendee(member: MemberAttributes): boolean {
    return (this.checkUserRole(EnumerationUserRole.Attendee, member)
      && !this.isHostOrCoHost(member))
  }

  isHostOrCoHost(members: any): boolean {
    if (members.VirtualEventUserRoles
      .find((x: { VirtualEventRoleId: EnumerationUserRole; }) => x.VirtualEventRoleId == EnumerationUserRole.Host
        || x.VirtualEventRoleId == EnumerationUserRole.Co_Host)) {
      return true;
    }
    else { return false; }
  }

  isPresenter(member: any): boolean {
    if (this.currentRoomData && (this.currentRoomData.RoomType == RoomType.Breakout || this.currentRoomData.RoomType == RoomType.PrivateRoom || this.currentRoomData.RoomType == RoomType.NetworkingBooth)) {
      return true;
    }

    if (!this.checkUserRole(EnumerationUserRole.Attendee, member)
      && (this.checkUserRole(EnumerationUserRole.Presenter, member)
        || this.isHostOrCoHost(member))) {
      return true;
    } else {
      return false;
    }
  }


  getHighestRole(members: any): string {
    if (this.checkUserRole(EnumerationUserRole.Host, members)) {
      return EnumerationUserRole[EnumerationUserRole.Host];
    }
    else if (this.checkUserRole(EnumerationUserRole.Co_Host, members)) {
      return EnumerationUserRole[EnumerationUserRole.Co_Host].replace("_", "-");
    }
    else if (this.checkUserRole(EnumerationUserRole.Presenter, members)) {
      return EnumerationUserRole[EnumerationUserRole.Presenter];
    }
    else if (this.checkUserRole(EnumerationUserRole.Attendee, members)) {
      return EnumerationUserRole[EnumerationUserRole.Attendee];
    }
  }

  isMuteAllByHost: boolean = true;
  isUnmuteAllowedByHost: boolean = true;
  broadcastMuteUnmuteCommand(mute: boolean, userId: string = null) {
    if (this.isHostOrCoHost(this.virtualEventUser)) {

      //Host itself
      if (userId == this.virtualEventUser.VirtualEventUserId.toString()) {
        return;
      }
      var member = this.roomMembers.find(x => x.VirtualEventUserId == userId);
      if (this.isHostOrCoHost(member)) {
        this.messageService.showErrorMessage('You cannot mute/unmute host or co-host.');
        return;
      }

      let muteMessagePattern = mute ? this.muteUserCommand : this.unmuteUserCommand;
      let rtmMessage = { messageType: 'TEXT', text: muteMessagePattern } as RtmMessage;
      member.IsAllowedUmuting = !mute;
      member.hasAudio = !mute;
      if (userId) {
        this.rtmClient.sendMessageToPeer(rtmMessage, userId.toString(), { enableHistoricalMessaging: false, enableOfflineMessaging: true })
          .then(sendResult => {
            console.log('muteMessagePattern:sendMessageToPeer: sendResult', sendResult);
          }).catch(error => {
            console.error(error)
          });
      } else {
        this.isMuteAllByHost = mute;
        this.rtmRoomChannel.sendMessage(rtmMessage, { enableHistoricalMessaging: false, enableOfflineMessaging: true }).then(sendResult => {
          console.log('muteMessagePattern:sendMessage: sendResult', sendResult)
        }).catch(error => {
          console.error(error)
        });
      }
    }
  }

  broadcastAllowMuteUnMuteCommand(allowUnmute: boolean, userId: number = null) {
    this.isUnmuteAllowedByHost = allowUnmute;
    let muteMessagePattern = allowUnmute ? this.allowUnmuteUserCommand : this.deniedUnmuteUserCommand;
    let rtmMessage = { messageType: 'TEXT', text: muteMessagePattern } as RtmMessage;
    this.rtmRoomChannel.sendMessage(rtmMessage, { enableHistoricalMessaging: false, enableOfflineMessaging: false }).then(sendResult => {
    }).catch(error => {
      console.error(error)
    });
  }

  updateAllEventMembersOnlineStatus() {
    this.onUpdateEventMembersOnlineCommand.next(true);
  }

  setPeoplesData(): void {
    var members = this.roomMembers;
    if (this.currentView == 'event') {
      if (this.filterAttendeeValue != 'All') {
        members = this.eventMembers.filter(a => (this.filterAttendeeValue == 'online' ? a.Online : !a.Online));
      } else {
        members = this.eventMembers;
      }
    }
    if (this.currentRoomData && this.currentRoomData.RoomType == RoomType.NetworkingBooth) {
      this.presenters = members.filter(a => !this.isHostOrCoHost(a));
      this.attendees = null;
    } else {
      this.attendees = members.filter(a => this.checkUserRole(EnumerationUserRole.Attendee, a) && !this.isHostOrCoHost(a));
      this.presenters = members.filter(a => this.checkUserRole(EnumerationUserRole.Presenter, a) && !this.isHostOrCoHost(a));
    }
    this.hostAndCohost = members.filter(a => this.isHostOrCoHost(a));
  }


  getParamValueQueryString(url: string, paramName: string): any {
    let paramValue;
    if (url.includes('?')) {
      const httpParams = new HttpParams({ fromString: url.split('?')[1] });
      paramValue = httpParams.get(paramName);
    }
    return paramValue;
  }

  getJoinRoomUrl(roomType: string, roomName: string, roomId: number): string {
    switch (roomType) {
      case RoomType.SessionBooth:
        roomType = RoomType.Session;
        break;
      case RoomType.ExpoBooth:
        roomType = RoomType.ExpoBooth;
        break;
      case RoomType.NetworkingBooth:
        roomType = RoomType.Networking;
        break;
    }
    let url = '';
    if (roomType === RoomType.Session || roomType === RoomType.CustomRoom || roomType === RoomType.Expo || roomType === RoomType.Networking) {
      url = `/fireworks/${this.virtualEventUser.VirtualEvent.EventId}/${this.virtualEventUser.EventAccessToken}/${roomType}/${roomName.replace(/ /g, '-')}/${roomId}/join`;
    }
    else {
      url = `/fireworks/${this.virtualEventUser.VirtualEvent.EventId}/${this.virtualEventUser.EventAccessToken}/${roomType.replace(/ /g, '-')}`;
    }
    return url;
  }

  clearPeopleDataWhenNoRoomAccess(): void {
    this.roomMembers = [];
    this.setPeoplesData();
  }

  isSelfUser(member: any): boolean {
    return member.VirtualEventUserId.toString() == this.virtualEventUser.VirtualEventUserId.toString()
  }

  checkElement = async (selector: any) => {
    while (document.querySelector(selector) === null) {
      await new Promise(resolve => requestAnimationFrame(resolve))
    }
    return document.querySelector(selector);
  };

  getCountdownFormat(difference: number): string {
    if (difference > (24 * 60 * 60 * 1000)) { // Greater than a day
      return 'd\'d\':h\'h\':m\'m\':s\'s\'';
    } else if (difference > (60 * 60 * 1000)) { // Greater than an hour
      return 'h\'h\':m\'m\':s\'s\'';
    }
    else if (difference > 60 * 1000) { // Greater than a minute
      return 'm\'m\':s\'s\'';
    }
    return 'm\'m\':s\'s\'';
  }

  getScheduleCountDown(scheduleDate: Date): { countdown: number, format: string } {
    var countdown = 0;
    var format = 'm\'m\':s\'s\'';
    var startDateTimestamp = Date.parse(moment.utc(scheduleDate).format());
    var currentDateTimestamp = Date.parse(moment.utc().format());
    if (startDateTimestamp > currentDateTimestamp) {
      if (startDateTimestamp > currentDateTimestamp) {
        var difference = (startDateTimestamp - currentDateTimestamp);
        countdown = parseInt((difference / 1000).toFixed(), 10);
        format = this.getCountdownFormat(difference)
      }
    }
    return {
      countdown: countdown,
      format: format
    };
  }

  getTotalPresenters(): number {
    var totalPresenters = this.roomMembers.filter(m => this.checkUserRole(EnumerationUserRole.Presenter, m) && !this.isHostOrCoHost(m)).length
    return totalPresenters;
  }

  confirmAndReload(dialog: MatDialog): void {
    const dialogRef = dialog.open(ConfirmDialogComponent, {
      data: {
        Title: 'Please confirm',
        Message: 'Please refresh and join again as there was an issue.',
        CancelText: 'No, stay',
        OkText: 'Ok'
      } as ConfirmDialogComponentData
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        window.location.reload();
      }
    });
  }

  public async getMembersFromRTMChannel(): Promise<string[]> {
    return
  }

  public async getRoomMembersFromAgoraChannel(): Promise<void> {
    var channelMembers = await this.rtmRoomChannel.getMembers();
    channelMembers.forEach(uid => {
      var eMember = this.eventMembers.find(x => x.VirtualEventUserId.toString() == uid);
      var rMember = this.roomMembers.find(m => m.VirtualEventUserId.toString() == uid);
      if (eMember && !rMember) {
        var clone = Object.assign({}, eMember);
        clone.Online = true;
        eMember.CurrentRoom = this.currentRoomData.RoomName;
        eMember.CurrentRoomId = this.currentRoomData.VirtualEventRoomId;
        clone.CurrentRoom = this.currentRoomData.RoomName;
        clone.CurrentRoomId = this.currentRoomData.VirtualEventRoomId;
        this.roomMembers.push(clone);
      }
    });
  }

  async changeUserRoleToAttendee(): Promise<any> {
    const promise = new Promise(async (resolve, reject) => {
      try {
        var data = new ManageUserRoleModel();
        data.VirtualEventId = this.virtualEventUser.VirtualEvent.VirtualEventId;
        data.VirtualEventUserId = this.virtualEventUser.VirtualEventUserId;
        data.VirtualEventRoleId = EnumerationUserRole.Attendee;
        data.UserRole = UserRole.Attendee;
        data.IsEnabled = true;
        var roleChangeMsg: RtmTextMessage = {
          text: this.selfRoleChange,
          messageType: 'TEXT'
        } as RtmTextMessage;
        var member = this.roomMembers.find(x => x.VirtualEventUserId == data.VirtualEventUserId.toString());
        await this.changeRoleAndsendMessageToAllRoomMembers(roleChangeMsg, data, member);
        resolve(null);
      } catch {
        reject(null);
      }
    });
    return promise;
  }

  async changeRoleAndsendMessageToAllRoomMembers(roleChangeMessage: RtmTextMessage, data: ManageUserRoleModel, member: MemberAttributes): Promise<boolean> {
    const promise = new Promise<boolean>((resolve, reject) => {
      this.virtualEventService.manageUserRole(data).pipe(takeUntil(this.destroy$)).subscribe(async (res) => {
        if (res) {
          this.rtmRoomChannel.sendMessage(roleChangeMessage).then(async () => {
            await this.getMemberInfo(member);
            resolve(true);
          }).catch(async (err) => {
            reject(false);
          });
        } else {
          reject(null);
        }
      });
    });
    return promise;
  }

  getMemberInfo(member: MemberAttributes): Promise<MemberAttributes> {
    const promise = new Promise<MemberAttributes>((resolve: any, reject: any) => {
      if (!member) {
        reject('member not found.');
      } else {
        var eventMember = this.eventMembers.find(em => em.VirtualEventUserId == member.VirtualEventUserId);
        var roomMember = this.roomMembers.find(em => em.VirtualEventUserId == member.VirtualEventUserId);
        this.virtualEventService.GetEventUserDetail(this.virtualEventUser.VirtualEvent.EventId, member.VirtualEventUserId)
          .pipe(takeUntil(this.destroy$)).subscribe(res => {
            if (res && res.Data) {
              var data = (res.Data[0] as MemberAttributes);
              if (data) {
                member.VirtualEventUserRoles = data.VirtualEventUserRoles;
                eventMember.VirtualEventUserRoles = member.VirtualEventUserRoles;
                if (roomMember) {
                  roomMember.VirtualEventUserRoles = member.VirtualEventUserRoles;
                }
                if (member.VirtualEventUserId == this.virtualEventUser.VirtualEventUserId.toString()) {
                  this.virtualEventUser.VirtualEventUserRoles = member.VirtualEventUserRoles;
                }
                this.setPeoplesData();
                resolve(member);
              } else {
                reject("no data get from API.");
              }
            }
          }, err => {
            reject(err);
          });
      }
    });
    return promise;
  }

  async sendRoleChangeMessage(roleChangeMsg: RtmTextMessage, member: MemberAttributes, userRole: string): Promise<boolean> {
    const promise = new Promise<boolean>((resolve, reject) => {
      this.rtmClient.sendMessageToPeer(roleChangeMsg, member.VirtualEventUserId.toString(),
        { enableHistoricalMessaging: false, enableOfflineMessaging: false }).then(res => {
          var message = member.FullName + "'s " + userRole + " role has been updated successfully.";
          this.messageService.showSuccessMessage(message);
          resolve(true);
        }).catch(async (err) => {
          reject(false);
        })
    });
    return promise;
  }

  async sendMessageToRoomMember(roleChangeMessage: RtmTextMessage, data: ManageUserRoleModel, member: MemberAttributes): Promise<boolean> {
    const promise = new Promise<boolean>((resolve, reject) => {
      this.virtualEventService.manageUserRole(data).pipe(takeUntil(this.destroy$)).subscribe(async (res) => {
        if (res) {
          if (res.Data.SingleRoleCouldNotBeRemoved) {
            var message = "You cannot remove " + member.FullName + "'s role.";
            this.messageService.showErrorMessage(message);
            return;
          }
          const updateItem = this.eventMembers.find(x => x.VirtualEventUserId == member.VirtualEventUserId);
          if (!updateItem || !res.Data.Status) {
            this.messageService.showErrorMessage('An error occurred while make cohost ' + member.FullName + '!');
            return;
          }
          if (!this.isSelfUser(member) && member.Online) {
            await this.sendRoleChangeMessage(roleChangeMessage, member, data.UserRole);
          }

          if (!member.Online) {
            this.changeUserRole(member.VirtualEventUserId, true);
          }

          resolve(true);
        } else {
          reject(null);
        }
      });
    });
    return promise;
  }


  setRightSideBarVisibility(): void {
    if (this.currentRoomData &&
      (this.currentRoomData.AllowGroupChat
        || this.virtualEventUser.VirtualEvent.DisplayPeopleSectionToAttendees
        || this.currentRoomData.AllowHandouts
        || this.virtualEventUser.VirtualEvent.ShowSpeakers
        || this.virtualEventUser.VirtualEvent.ShowSponsors
        || this.virtualEventUser.VirtualEvent.ShowSchedules)
    ) {
      this.rightSidebarExpended = true;
    } else {
      this.rightSidebarExpended = false;
    }
  }

  saveFireworksActivity(entityId: number, virtualEventUserId: number, activityTypeId: number, entityName: string){
    if(this.virtualEventUser.VirtualEvent.EnableFireworksActivity){
      let fireworksActivityData = new SaveFireworksActivityModel();
      fireworksActivityData.EntityId = entityId;
      fireworksActivityData.VirtualEventUserId = virtualEventUserId;
      fireworksActivityData.ActivityTypeId = activityTypeId;
      fireworksActivityData.EntityName = entityName;
      this.virtualEventService.SaveFireworksActivity(fireworksActivityData).subscribe(() => { });
    }
  }

}

