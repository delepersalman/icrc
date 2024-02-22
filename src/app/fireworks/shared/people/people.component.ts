import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CalendarPipe, FromUnixPipe, TimeAgoPipe } from 'ngx-moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { MessageService } from '../../../shared/services/message.service';
import { ConfirmDialogComponentData, UserNotificationModel } from '../../models/common.model';
import { ChatMessage, HistoricalMessageRequestModel, LocalInvitation, MemberAttributes, RemoteInvitation, RtmClient, RtmMessage, RtmTextMessage } from '../../models/rtm.model';
import { RoomType, VirtualEventPrivateRoomModel } from '../../models/virtualevent.room.model';
import { EnumerationFeatures, EnumerationUserRole, ManageUserRoleModel, VirtualEventUserModel } from '../../models/virtualevent.user.model';
import { SharedFireworksComponentService } from '../../services/shared.service';
import { VirtualEventService } from '../../services/virtualevent.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ComponentRegistryService } from '../../services/component.registry.service';
import { AttendeeAction, sleep } from '../../constants/fireworks-constants';

@Component({
  selector: 'fireworks-people',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss']
})
export class PeopleComponent implements OnInit, AfterViewInit, OnDestroy {

  destroy$ = new Subject();
  resourcesLoading: boolean;
  privateChatLoading: boolean;
  isUserLoggedIn: boolean;
  showPrivateChatContainer: boolean;
  disabledPrivateChatTextbox: boolean;
  activePrivateChatUser: MemberAttributes;
  txtPrivateMessage: string;
  peerMessages: ChatMessage[] = [];
  localInvitation: LocalInvitation;
  remoteInvitation: RemoteInvitation;
  newPrivateMessages = [];
  alertMessages: MemberAttributes[] = [];
  enumerationFeatures: any = EnumerationFeatures;
  enumerationUserRole: any = EnumerationUserRole;
  domainURl = environment.domainUrl;
  @Output() onPrivateMessage: EventEmitter<any> = new EventEmitter<any>();
  @Input() tabIndex: number = 0;
  messageCounter = 0;

  constructor(
    public router: Router,
    public dialog: MatDialog,
    public sharedService: SharedFireworksComponentService,
    public virtualEventService: VirtualEventService,
    public messageService: MessageService,
    public amTimeAgo: TimeAgoPipe,
    public amCalendar: CalendarPipe,
    public amFromUnix: FromUnixPipe,
    public renderer: Renderer2,
    private registryService: ComponentRegistryService
  ) {
  }

  @ViewChild("peerMessage") messageBox: ElementRef;
  @ViewChild("scrollMe") selectedTab: ElementRef;
  @ViewChild("scrollMeChat") chatTab: ElementRef;
  @ViewChild("attendeeInfoSec") attendeeInfoSec: ElementRef;
  @ViewChild("chatInputBox") chatInputBox: ElementRef;
  @ViewChild("roomMessageBox") roomMessageBox: ElementRef;

  updateScrollHeight(): void {
    if (this.selectedTab) {
      var roomButtonHeight = 50, searchHeight = 70, statusFilterHeight = 51;
      var rightTopHeader = document.getElementsByClassName('tabButtonOuter')[0] as any;
      var scrollHeight = window.innerHeight - (rightTopHeader.offsetHeight + roomButtonHeight + searchHeight);
      if (this.sharedService.currentView == 'event') {
        scrollHeight -= statusFilterHeight;
      }
      this.renderer.setStyle(this.selectedTab.nativeElement, 'height', scrollHeight + 'px');
    }
  }

  updateChatHeight() {
    if (this.chatTab) {
      var attendeeInfoSec = 102;
      var rightTopHeader = document.getElementsByClassName("tabButtonOuter")[0] as any;
      if (this.attendeeInfoSec)
        attendeeInfoSec = this.attendeeInfoSec.nativeElement.offsetHeight;
      var chatInputBoxHeight = this.chatInputBox.nativeElement.offsetHeight;
      if (this.chatInputBox.nativeElement.offsetHeight == 0)
        chatInputBoxHeight = 57;
      var chatHeight = window.innerHeight - (rightTopHeader.offsetHeight + chatInputBoxHeight + attendeeInfoSec);
      this.renderer.setStyle(this.chatTab.nativeElement, 'height', chatHeight + 'px');
    }
  }

  @HostListener('window:resize', ['$event'])
  sizeChange(event) {
    this.updateScrollHeight();
    this.updateChatHeight();
  }

  ngAfterViewInit() { this.updateChatHeight(); }

  ngOnInit(): void {
    this.resourcesLoading = true;
    setTimeout(() => {
      this.resourcesLoading = false;
    }, 10000);

    try {
      if (this.sharedService.virtualEventUser.VirtualEvent && this.sharedService.rtmClient) {
        this.assignPrivateChatHandlers(this.sharedService.rtmClient);
        this.isUserLoggedIn = true;
      }

      this.sharedService.privateChatData$.pipe(takeUntil(this.destroy$)).subscribe(message => {
        if (message) {
          if (message.receiverId == this.activePrivateChatUser?.VirtualEventUserId) {
            this.peerMessages = [...this.peerMessages, message];
          }
        }
      });

      this.sharedService.onEventInfoUpdate.pipe(takeUntil(this.destroy$)).subscribe(() => {
        setTimeout(() => {
          this.updateScrollHeight();
          this.updateChatHeight();
        }, 1000);
      });

      this.sharedService.roomData$.pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (res) {
          setTimeout(() => {
            this.updateScrollHeight();
            this.updateChatHeight();
          }, 1000);
        }
      });

    } catch (e) {
      this.resourcesLoading = false;
    }

  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  openPrivateChatWindow(memberData: MemberAttributes) {

    if (memberData.VirtualEventUserId == this.sharedService.virtualEventUser.VirtualEventUserId.toString())
      return;

    this.onPrivateMessage.emit({ virtualEventUserId: memberData.VirtualEventUserId, openChat: true });
    this.activePrivateChatUser = memberData;
    this.showPrivateChatContainer = !this.showPrivateChatContainer;
    this.resourcesLoading = true;
    this.getPrivateChatHistory();
    setTimeout(() => {
      this.updateChatHeight();
    }, 200);

    this.newPrivateMessages = this.newPrivateMessages.filter(x => x != memberData.VirtualEventUserId.toString());
  }

  getCurrentUtcDate() {
    const currentDate = new Date();
    const currentDateUtc = new Date(currentDate.getUTCFullYear(), currentDate.getUTCMonth(),
      currentDate.getUTCDate(), currentDate.getUTCHours(), currentDate.getUTCMinutes(), currentDate.getUTCSeconds());
    return currentDateUtc;
  }

  sendPrivateMessage(message) {

    if (!message || message == '<div><br></div><div><br></div>') { //TODO
      return;
    }

    message = message.replace('<a href="', '<a target="_blank" href="'); //TODO Testing Need proper solution

    const notification = {
      NotificationContent: message,
      NotificationSentByUserId: this.sharedService.virtualEventUser.VirtualEventUserId,
      NotificationSentForUserId: Number.parseInt(this.activePrivateChatUser.VirtualEventUserId),
      NotificationType: 'privatemessage',
      VirtualEventId: this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId
    } as UserNotificationModel;

    this.virtualEventService.addUserNotification(notification).pipe(takeUntil(this.destroy$)).subscribe(d => {
      if (!d || !d.Data) {
        this.messageService.showErrorMessage('Failed to send message to ' + this.activePrivateChatUser.FullName);
        return;
      }
      const rtmMessage = { messageType: 'TEXT', text: message } as RtmMessage;
      this.sharedService.rtmClient.sendMessageToPeer(rtmMessage, this.activePrivateChatUser.VirtualEventUserId.toString(), { enableHistoricalMessaging: true, enableOfflineMessaging: true }).then(sendResult => {
        const formatedTime = this.amCalendar.transform(this.getCurrentTime(), { sameDay: 'h:mm A' });
        const chatMessage = { senderId: this.sharedService.virtualEventUser.VirtualEventUserId.toString(), senderName: this.sharedService.virtualEventUser.FullName, time: formatedTime, rtmMessage, self: true } as ChatMessage
        this.privateChatHistoryPageIndex = 0;
        this.peerMessages = [...this.peerMessages, chatMessage];
        this.renderer.setProperty(this.messageBox.nativeElement, 'innerHTML', '');
        setTimeout(() => {
          this.updateChatHeight();
        }, 200);

      }).catch(error => {
        this.messageService.showErrorMessage('An error occurred while sending the message!');
        console.error(error)
      });
    });
  }

  sendPeerTextMessage(event: { keyCode: number; shiftKey: any; preventDefault: () => void; }) {
    var message = this.messageBox.nativeElement.textContent;
    if (!message || !message.trim()) {
      return;
    }

    if (!this.isUserLoggedIn || !this.sharedService.rtmClient || this.disabledPrivateChatTextbox) {
      return;
    }

    if (event.keyCode == 13 && !event.shiftKey) {
      event.preventDefault();
      this.renderer.setProperty(this.messageBox.nativeElement, 'innerHTML', '');
      this.renderer.setProperty(this.messageBox.nativeElement, 'innerText', '');
      this.sendPrivateMessage(message);
    }
    this.updateChatHeight();
  };

  sendMessageToPrivate(): void {
    var message = this.messageBox.nativeElement.textContent;
    if (!message || !message.trim()) {
      return;
    }

    if (!this.isUserLoggedIn || !this.sharedService.rtmClient || this.disabledPrivateChatTextbox) {
      return;
    }

    this.sendPrivateMessage(message);

  }

  resetMessageBox(event: any): boolean {
    event.preventDefault();
    this.renderer.setProperty(this.messageBox.nativeElement, 'innerText', '');
    return false;
  }

  getCurrentTime() {
    const now: Date = new Date();
    return now;
  }

  getFormatedTimeFromTimeStamp(ts: any) {
    const now: Date = new Date(ts);
    var time = moment(now).format('hh:mm A');
    return time;
  }

  assignPrivateChatHandlers(rtmClient: RtmClient): void {

    if (!rtmClient)
      return;

    rtmClient.on('MessageFromPeer', (message: RtmMessage, remoteUserId, messagePros) => {

      //TODO compare with array | IT is handled on fw-room
      const rtmTextMessage = message as RtmTextMessage;
      if (rtmTextMessage.text == this.sharedService.muteUserCommand
        || rtmTextMessage.text == this.sharedService.unmuteUserCommand
        || rtmTextMessage.text == this.sharedService.allowUnmuteUserCommand
        || rtmTextMessage.text == this.sharedService.deniedUnmuteUserCommand
        || rtmTextMessage.text == this.sharedService.roleChange
        || rtmTextMessage.text.indexOf(this.sharedService.moveAttendee) != -1
      ) {
        return;
      }

      if (!this.activePrivateChatUser || !this.activePrivateChatUser.VirtualEventUserId
        || (this.tabIndex != 2 && this.activePrivateChatUser.VirtualEventUserId != remoteUserId)) {
        if (!(rtmTextMessage.text.indexOf(this.sharedService.videoCallInvitationNotificationPattern + this.sharedService.virtualEventUser.VirtualEventUserId) > -1)) {
          this.onPrivateMessage.emit({ virtualEventUserId: remoteUserId, openChat: false });
        }
      }

      this.newPrivateMessages.push(remoteUserId);
      const attr = this.sharedService.eventMembers.find(x => x.VirtualEventUserId == remoteUserId);
      if (!attr) {
        return;
      }

      if (rtmTextMessage.text && rtmTextMessage.text.indexOf(this.sharedService.blockUserNotificationPattern + this.sharedService.virtualEventUser.VirtualEventUserId) > -1) {
        attr.AllowUnblock = false;
        attr.IsBlocked = true;
      }
      else if (rtmTextMessage.text && rtmTextMessage.text.indexOf(this.sharedService.unblockUserNotificationPattern + this.sharedService.virtualEventUser.VirtualEventUserId) > -1) {
        attr.AllowUnblock = false;
        attr.IsBlocked = false;
      }
      else if (rtmTextMessage.text && rtmTextMessage.text.indexOf(this.sharedService.videoCallInvitationNotificationPattern + this.sharedService.virtualEventUser.VirtualEventUserId) > -1) {
        //Get private room video call notification
      }
      else if (this.activePrivateChatUser && this.activePrivateChatUser.VirtualEventUserId == remoteUserId) {
        const formatedTime = this.amCalendar.transform(this.getCurrentTime(), { sameDay: 'h:mm A' });
        const chatMessage = { senderId: remoteUserId, senderName: attr.FullName, time: formatedTime, rtmMessage: message, self: false, alt: this.sharedService.getUserShortName(attr.FullName) } as ChatMessage
        this.privateChatHistoryPageIndex = 0;
        this.peerMessages = [...this.peerMessages, chatMessage];
      }

      this.sharedService.refreshNotificationsData(true);

      if (this.sharedService.enableAlertNotificationSound) {
        this.messageService.playNewMessageTone();
      }
    });

    rtmClient.on('RemoteInvitationReceived', remoteInvitation => {
      if (this.remoteInvitation) {
        this.remoteInvitation.removeAllListeners();
        this.remoteInvitation = null;
      }
      this.remoteInvitation = remoteInvitation;
    });
  }

  stopLoadingPrivateChatHistory: boolean = false;
  getPrivateChatHistory(pageIndex: number = 0) {
    this.privateChatLoading = true;

    if (pageIndex == 0)
      this.peerMessages = [];

    const requestData = {
      Source: this.sharedService.virtualEventUser.VirtualEventUserId.toString(),
      Destination: this.activePrivateChatUser.VirtualEventUserId,
      StartDate: this.sharedService.virtualEventUser.VirtualEvent.EventDatesInfo.StartDateUtc,
      EndDate: this.getCurrentUtcDate(),
      IsPrivateMessage: true,
      EventId: this.sharedService.virtualEventUser.VirtualEvent.EventId,
      PageIndex: pageIndex,
      PageSize: 100,
      Order: 'desc'
    } as HistoricalMessageRequestModel;

    this.virtualEventService.getChatHistory(requestData).pipe(takeUntil(this.destroy$)).subscribe(chatsData => {
      if (chatsData && chatsData.Data && chatsData.Data.Messages) {

        if (chatsData.Data.Messages.length > 0 && chatsData.Data.Messages.length < 100) {
          this.stopLoadingPrivateChatHistory = true;
        }

        chatsData.Data.Messages.forEach(m => {
          const rtmMessage = { text: m.Payload } as RtmMessage;
          const formatedTime = this.amCalendar.transform(m.Ms, { sameDay: 'h:mm A' });
          const chatMessage = { senderId: m.Src, senderName: m.FullName, alt: this.sharedService.getUserShortName(m.FullName), time: formatedTime, rtmMessage, self: m.Src == this.sharedService.virtualEventUser.VirtualEventUserId.toString() } as ChatMessage
          this.peerMessages = [chatMessage, ...this.peerMessages];
        });
      }
      this.privateChatLoading = false;
    }, (error) => { this.privateChatLoading = false; console.log(error); this.resourcesLoading = false; });
  }

  sendVideoCallLink(member: MemberAttributes) {

    if (!member)
      return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        Title: 'Please confirm',
        Message: 'Do you want to invite ' + member.FirstName + ' to a private room?', message: '',
        CancelText: 'Cancel',
        OkText: 'Yes'
      } as ConfirmDialogComponentData
    });
    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        //Create a private room and save in database
        const privateRoomData = {
          VirtualEventUserId: this.sharedService.virtualEventUser.VirtualEventUserId,
          VirtualEventId: this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId,
          ParticipantIds: member.VirtualEventUserId.toString(),
          RoomName: 'privateroom',
          AllowGuestInvite: true,
          AllowHandouts: true,
          AllowPollsAndSurvey: true,
          AllowRecording: true
        } as VirtualEventPrivateRoomModel;
        this.virtualEventService.createPrivateRoom(privateRoomData).pipe(takeUntil(this.destroy$)).subscribe(d => {
          if (d && d.Data) {
            const href = `fireworks/${this.sharedService.virtualEventUser.VirtualEvent.EventId}/{0}/privateroom?token=${d.Data.StreamId}`;
            const selfLink = `fireworks/${this.sharedService.virtualEventUser.VirtualEvent.EventId}/${this.sharedService.virtualEventUser.EventAccessToken}/privateroom?token=${d.Data.StreamId}`;
            const invitationMessage = `I would like to invite you to a private room. Please join using this <a class="routerlink" href="${href}">link</a>`;
            const userMessage = `You have invited ${member.FullName} to a private room. Please join using this <a class="routerlink" href="${selfLink}">link</a>.`;
            const notification = {
              NotificationContent: invitationMessage,
              NotificationSentByUserId: this.sharedService.virtualEventUser.VirtualEventUserId,
              NotificationSentForUserId: Number.parseInt(member.VirtualEventUserId, 10),
              NotificationType: 'invitation',
              VirtualEventId: this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId
            } as UserNotificationModel;

            this.virtualEventService.addUserNotification(notification).pipe(takeUntil(this.destroy$)).subscribe(d => {
              if (!d || !d.Data) {
                this.messageService.showErrorMessage('Failed to send invitation to ' + member.FullName);
                return;
              }

              this.dialog.open(ConfirmDialogComponent, {
                data: {
                  Title: 'Invite Success',
                  Message: userMessage,
                  CancelText: '',
                  OkText: 'Close'
                } as ConfirmDialogComponentData
              });

              const rtmMessage = { messageType: 'TEXT', text: invitationMessage } as RtmMessage;
              this.sharedService.rtmClient.sendMessageToPeer(rtmMessage, member.VirtualEventUserId.toString(),
                { enableHistoricalMessaging: true, enableOfflineMessaging: true }).then(sendResult => {
                  // this.messageService.add('An invitation has been sent to ' + member.FullName);
                  const formatedTime = this.amCalendar.transform(new Date(), { sameDay: 'h:mm A' });
                  const chatMessage = {
                    senderId: this.sharedService.virtualEventUser.VirtualEventUserId.toString(),
                    senderName: this.sharedService.virtualEventUser.FullName,
                    time: formatedTime,
                    rtmMessage,
                    self: true,
                    receiverId: member.VirtualEventUserId,
                    receiverName: member.FullName
                  } as ChatMessage;

                  this.peerMessages = [...this.peerMessages, chatMessage];
                  //Send another message to trigger notification
                  const videoCallInvitationNotification = this.sharedService.videoCallInvitationNotificationPattern + member.VirtualEventUserId;
                  const notificationMessage = { messageType: 'TEXT', text: videoCallInvitationNotification } as RtmMessage;
                  this.sharedService.rtmClient.sendMessageToPeer(notificationMessage, member.VirtualEventUserId.toString(), { enableHistoricalMessaging: false, enableOfflineMessaging: false }).then(sendResult => { }).catch(error => {
                    console.error(error)
                  });
                }).catch(error => {
                  this.messageService.showErrorMessage('An error occurred while sending the message!');
                  console.error(error)
                });
            });
          }
        });
      }
    });
  }

  cancelCall() {
    this.localInvitation && this.localInvitation.cancel()
    //this.status = 'onLine'
  }

  acceptCall() {
    this.remoteInvitation && this.remoteInvitation.accept()
    //this.status = 'meeting'
  }


  toggleDisplayattendeeInfoOverlay(attendee) {
    this.sharedService.attendeeInfoOverlay = new VirtualEventUserModel();
    if (attendee && Number(attendee.VirtualEventUserId)) {
      if (!this.sharedService.displayattendeeInfoOverlay) {
        var s = this.virtualEventService.getEventUserDetailById(this.sharedService.virtualEventUser.VirtualEvent.EventId, attendee.VirtualEventUserId).subscribe(d => {
          if (d && d.Data) {
            this.sharedService.attendeeInfoOverlay = d.Data;
            this.sharedService.attendeeInfoOverlay.UserProfileImage = this.sharedService.attendeeInfoOverlay.UserProfileImage ? environment.domainUrl + this.sharedService.attendeeInfoOverlay.UserProfileImage : null;
          }
        });
      }
      this.sharedService.displayattendeeInfoOverlay = !this.sharedService.displayattendeeInfoOverlay;
    }
    else {
      this.sharedService.displayattendeeInfoOverlay = false;
    }
  }

  refuseCall() {
    this.remoteInvitation && this.remoteInvitation.refuse()
    //this.status = 'onLine'
  }

  blockUser(member: MemberAttributes) {

    if (!member)
      return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        Title: 'Are you sure?',
        Message: 'You are going to block ' + member.FullName,
        CancelText: 'Cancel',
        OkText: 'Yes'
      } as ConfirmDialogComponentData
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        this.virtualEventService.blockUser(this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId, member.VirtualEventUserId).pipe(takeUntil(this.destroy$)).subscribe(done => {
          if (done) {
            const updateItem = this.sharedService.eventMembers.find(x => x.VirtualEventUserId == member.VirtualEventUserId);
            if (!updateItem) {
              this.messageService.showErrorMessage('An error occurred while blocking ' + member.FullName + '!');
              return;
            }

            updateItem.IsBlocked = true;
            updateItem.AllowUnblock = true;
            const notification = {
              NotificationContent: 'You have been blocked by ' + this.sharedService.virtualEventUser.FullName,
              NotificationSentByUserId: this.sharedService.virtualEventUser.VirtualEventUserId,
              NotificationSentForUserId: Number.parseInt(member.VirtualEventUserId),
              NotificationType: 'block',
              VirtualEventId: this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId
            } as UserNotificationModel;

            this.virtualEventService.addUserNotification(notification).pipe(takeUntil(this.destroy$)).subscribe(d => {
              const blockUserMessagePattern = this.sharedService.blockUserNotificationPattern + member.VirtualEventUserId;
              const rtmMessage = { messageType: 'TEXT', description: blockUserMessagePattern, text: blockUserMessagePattern } as RtmMessage;
              this.sharedService.rtmClient.sendMessageToPeer(rtmMessage, member.VirtualEventUserId.toString(), { enableHistoricalMessaging: false, enableOfflineMessaging: false }).then(sendResult => {

                const formatedTime = this.amCalendar.transform(new Date(), { sameDay: 'h:mm A' });
                const chatMessage = {
                  senderId: this.sharedService.virtualEventUser.VirtualEventUserId.toString(),
                  senderName: this.sharedService.virtualEventUser.FullName,
                  time: formatedTime,
                  rtmMessage,
                  self: true,
                  receiverId: member.VirtualEventUserId,
                  receiverName: member.FullName
                } as ChatMessage;
                this.peerMessages = [...this.peerMessages, chatMessage];
              }).catch(error => {
                console.error(error)
              });
            });
            this.messageService.showSuccessMessage(member.FullName + ' has been blocked!');
          }
        });
      }
    });
  }

  unblockUser(member: MemberAttributes) {

    if (!member)
      return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        Title: 'Are you sure?',
        Message: 'You are going to unblock ' + member.FirstName,
        CancelText: 'Cancel',
        OkText: 'Yes'
      } as ConfirmDialogComponentData
    });
    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        this.virtualEventService.unblockUser(this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId, member.VirtualEventUserId)
          .pipe(takeUntil(this.destroy$)).subscribe(done => {
            if (done) {
              const updateItem = this.sharedService.eventMembers.find(x => x.VirtualEventUserId == member.VirtualEventUserId);
              if (!updateItem) {
                this.messageService.showErrorMessage('An error occurred while unblocking ' + member.FullName + '!');
                return;
              }
              updateItem.IsBlocked = false;
              updateItem.AllowUnblock = true;
              const notification = {
                NotificationContent: 'You have been unblocked by ' + this.sharedService.virtualEventUser.FullName,
                NotificationSentByUserId: this.sharedService.virtualEventUser.VirtualEventUserId,
                NotificationSentForUserId: Number.parseInt(member.VirtualEventUserId),
                NotificationType: 'unblock',
                VirtualEventId: this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId
              } as UserNotificationModel;

              this.virtualEventService.addUserNotification(notification).pipe(takeUntil(this.destroy$)).subscribe(d => {
                const unblockUserMessagePattern = this.sharedService.unblockUserNotificationPattern + member.VirtualEventUserId;
                const rtmMessage = { messageType: 'TEXT', description: unblockUserMessagePattern, text: unblockUserMessagePattern } as RtmMessage;
                this.sharedService.rtmClient.sendMessageToPeer(rtmMessage, member.VirtualEventUserId.toString(), { enableHistoricalMessaging: false, enableOfflineMessaging: false }).then(sendResult => {

                  const formatedTime = this.amCalendar.transform(new Date(), { sameDay: 'h:mm A' });
                  const chatMessage = {
                    senderId: this.sharedService.virtualEventUser.VirtualEventUserId,
                    senderName: this.sharedService.virtualEventUser.FullName,
                    time: formatedTime,
                    rtmMessage,
                    self: true,
                    receiverId: member.VirtualEventUserId,
                    receiverName: member.FullName,
                    alt: this.sharedService.getUserShortName(this.sharedService.virtualEventUser.FullName),
                  } as unknown as ChatMessage;
                  this.peerMessages = [...this.peerMessages, chatMessage];
                }).catch(error => {
                  console.error(error)
                });
              });
              this.messageService.showSuccessMessage(member.FirstName + ' ' + member.LastName + ' has been unblocked successfully.');
            }
          });
      }
    });
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: Event): void {
    if (event.target instanceof HTMLAnchorElement) {
      const element = event.target as HTMLAnchorElement;
      if (element.className === 'routerlink') {
        event.preventDefault();
        this.navirateToInviteUrl(element);

        try {
          if (!this.sharedService.roomClientConnected) {
            this.dialog.closeAll();
          }
        } catch (e) {
        }
      }
    }
  }

  private navirateToInviteUrl(element: HTMLAnchorElement) {
    const route = element?.getAttribute('href');
    let decodedUrl = decodeURIComponent(route);
    if (decodedUrl) {
      decodedUrl = decodedUrl.replace('{0}', this.sharedService.userUniqueAccessToken);
      const token = this.getParamValueQueryString(decodedUrl, 'token');
      if (token) {
        this.router.navigate([`${decodedUrl.split('?')[0]}`], { queryParams: { token }, replaceUrl: false });
      }
      else {
        this.router.navigate([`${decodedUrl.split('?')[0]}`], { replaceUrl: false });
      }
    }
  }

  private getParamValueQueryString(url, paramName) {
    let paramValue;
    if (url.includes('?')) {
      const httpParams = new HttpParams({ fromString: url.split('?')[1] });
      paramValue = httpParams.get(paramName);
    }
    return paramValue;
  }

  hideChatContainer() {
    this.showPrivateChatContainer = false;
    this.activePrivateChatUser = null;
  }

  privateChatHistoryPageIndex: number = 0;
  onPrivateChatScrollUp() {
    if (!this.stopLoadingPrivateChatHistory)
      this.getPrivateChatHistory(++this.privateChatHistoryPageIndex);
  }

  manageUserRole(userData: any) {
    var member: MemberAttributes = userData.member;
    var IsEnabled = userData.isEnabled;
    var enumUserRole = userData.enumUserRole;
    if (member) {
      var presentersAndHostCount = this.sharedService.getTotalPresenters() + this.sharedService.hostAndCohost.length;
      if (userData.action == 1 && presentersAndHostCount >= environment.maxPresenter) {
        this.messageService.showErrorMessage('You cannot have more than ' + environment.maxPresenter + ' presenters!');
      } else {
        let userRole = EnumerationUserRole[enumUserRole].replace('_', '-');
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          data: {
            Title: 'Are you sure?',
            Message: (IsEnabled ? ' Change to ' + userRole + '.' : ' Disable as ' + userRole + '.'),
            CancelText: 'Cancel',
            OkText: 'Yes'
          } as ConfirmDialogComponentData
        });
        userRole = userRole.toLocaleLowerCase();
        dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(async (result) => {
          if (result) {
            var roleChangeMsg: RtmTextMessage = {
              text: this.sharedService.roleChange,
              messageType: 'TEXT'
            } as RtmTextMessage;

            var data = new ManageUserRoleModel();
            const memberIds = [];
            data.VirtualEventId = this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId;
            data.VirtualEventUserId = parseInt(member.VirtualEventUserId);
            data.VirtualEventRoleId = enumUserRole;
            data.IsEnabled = IsEnabled;
            data.UserIds = memberIds;
            data.MemberName = member.FullName;
            data.UserRole = userRole;
            data.VirtualEventRoomId = member.CurrentRoomId;
            data.RoomName = member.CurrentRoom;
            await this.sharedService.sendMessageToRoomMember(roleChangeMsg, data, member);
          }
        });
      }
    }
  }

  getAttendeeCount(): number {
    if (this.sharedService.currentView == 'room') {
      return this.sharedService.roomMembers.length;
    } else {
      if (this.sharedService.filterAttendeeValue != 'All') {
        return this.sharedService.eventMembers.filter(a => (this.sharedService.filterAttendeeValue == 'online' ? a.Online : !a.Online)).length;
      } else {
        return this.sharedService.eventMembers.length;
      }
    }
  }

  getMembersOnChange(): any {
    if (this.sharedService.currentView == 'event' || this.isLobbyRoom())
      return this.sharedService.eventMembers;
    else
      return this.sharedService.roomMembers
  }

  onViewChange(currentView: string): void {
    this.sharedService.currentView = currentView;
    this.sharedService.setPeoplesData();
    this.updateScrollHeight();
  }

  filterAttendeesByStatus(status: string): void {
    this.sharedService.filterAttendeeValue = status;
    this.sharedService.setPeoplesData();
  }

  callFunctionByType(e: any): void {
    switch (e.type) {
      case AttendeeAction.RoleChange:
        this.manageUserRole(e.data);
        break;
      case AttendeeAction.BlockUser:
        this.blockUser(e.data);
        break;
      case AttendeeAction.UnBlockUser:
        this.unblockUser(e.data);
        break;
      case AttendeeAction.AttendeeInfo:
        this.toggleDisplayattendeeInfoOverlay(e.data);
        break;
      case AttendeeAction.InviteMember:
        this.sendVideoCallLink(e.data);
        break;
      case AttendeeAction.OpenChat:
        this.openPrivateChatWindow(e.data);
        break;
    }
  }

  isLobbyRoom(): boolean {
    if (this.sharedService.currentRoomData) {
      if(this.sharedService.currentRoomData.RoomType === RoomType.Reception){
        this.sharedService.currentView = 'event';
        return true;
      }
    }
    return false;
  }
}
