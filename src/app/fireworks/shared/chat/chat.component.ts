import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { CalendarPipe, FromUnixPipe, TimeAgoPipe } from 'ngx-moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { MessageService } from '../../../shared/services/message.service';
import {
  ChannelAttributes,
  ChatMessage,
  HistoricalMessageRequestModel,
  MemberAttributes,
  RtmChannel,
  RtmMessage,
  RtmTextMessage
} from '../../models/rtm.model';
import { RoomType, VirtualEventRoomModel } from '../../models/virtualevent.room.model';
import { MediaInfoService } from '../../services/media-info-service';
import { SharedFireworksComponentService } from '../../services/shared.service';
import { VirtualEventService } from '../../services/virtualevent.service';
import { PollDialogComponent } from '../poll-dialog/poll-dialog.component';

@Component({
  selector: 'fireworks-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {

  destroy$ = new Subject();
  resourcesLoading: boolean;
  roomChatLoading: boolean;
  isUserLoggedIn: boolean;

  roomData: VirtualEventRoomModel;
  polling: boolean;

  eventMessages: ChatMessage[] = [];
  roomMessages: ChatMessage[] = [];

  eventChatActive = false;
  roomChatActive = true;

  disabledEventChatTextbox: boolean;
  disabledRoomChatTextbox: boolean;
  txtEventMessage: string;
  txtRoomMessage: string;
  domainUrl = environment.domainUrl;
  stopLoadingEventChatHistory = false;
  stopLoadingRoomChatHistory = false;
  eventChatHistoryPageIndex = 0;
  roomChatHistoryPageIndex = 0;


  @ViewChild('scrollMe') chatTab: ElementRef;
  @ViewChild('chatButton') chatButton: ElementRef;
  @ViewChild('chatInputBox') chatInputBox: ElementRef;
  @ViewChild('messageBox') messageBox: ElementRef;
  @ViewChild('roomMessageBox') roomMessageBox: ElementRef;

  constructor(
    protected dialog: MatDialog,
    protected sharedService: SharedFireworksComponentService,
    protected virtualEventService: VirtualEventService,
    protected messageService: MessageService,
    protected amTimeAgo: TimeAgoPipe,
    protected amCalendar: CalendarPipe,
    protected amFromUnix: FromUnixPipe,
    private changeDetect: ChangeDetectorRef, private mediaInfoService: MediaInfoService,
    private renderer: Renderer2) {
  }

  updateChatHeight(): void {
    if (this.chatInputBox && this.chatInputBox.nativeElement) {
      var roomButtonHeight = 50;
      const rightTopHeader = document.getElementsByClassName('tabButtonOuter')[0] as any;
      var chatInputBoxHeight = this.chatInputBox.nativeElement.offsetHeight;
      if (this.chatInputBox.nativeElement.offsetHeight == 0)
        chatInputBoxHeight = 57;
      const chatHeight = window.innerHeight
        - (rightTopHeader.offsetHeight + chatInputBoxHeight + roomButtonHeight);
      this.renderer.setStyle(this.chatTab.nativeElement, 'height', chatHeight + 'px');
    }
  }

  @HostListener('window:resize', ['$event'])
  sizeChange(): void {
    this.updateChatHeight();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateChatHeight();
    }, 1000);
  }

  async ngOnInit(): Promise<void> {
    try {
      this.roomData = this.sharedService.currentRoomData;
      this.createEventChannel();
      if (this.roomData && !this.sharedService.rtmRoomChannel) {
        this.createRoomChannelAndGetChatHistory();
      } else if (this.sharedService.enableChatRoom) {
        this.mediaInfoService.joinRoom();
      }

      this.sharedService.roomData$.pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (res) {
          this.roomData = res;
          if (res.RoomType == RoomType.Handouts) {
            return;
          }

          if (this.sharedService.virtualEventUser) {

            this.disabledEventChatTextbox = !this.roomData.AllowGroupChat;
            this.disabledRoomChatTextbox = !this.roomData.AllowGroupChat;
            if (!this.roomData.AllowGroupChat) {
              return;
            }
            this.isUserLoggedIn = true;
          }
        } else {
          this.roomData = res;
        }
      });

      this.subscribeOnlineStatusCommand();

      this.sharedService.onEventInfoUpdate.pipe(takeUntil(this.destroy$)).subscribe(() => {
        setTimeout(() => {
          this.updateChatHeight();
        }, 1000);
      });

      this.resourcesLoading = false;

    } catch (e) {
      console.log('check why chat loading false', e);
      this.resourcesLoading = false;
    }
  }

  private createEventChannel() {
    try {
      if (this.sharedService.virtualEventUser && this.sharedService.rtmClient && !this.sharedService.rtmEventChannel) {

        if (!this.sharedService.virtualEventUser.VirtualEvent.EventChannelName) {
          this.sharedService.virtualEventUser.VirtualEvent.EventChannelName = 'fireworks.' + this.sharedService.virtualEventUser.VirtualEvent.EventId;
        }

        this.sharedService.rtmEventChannel = this.sharedService.rtmClient.createChannel(this.sharedService.virtualEventUser.VirtualEvent.EventChannelName);
        this.sharedService.rtmEventChannel.join().then(async () => {
          await this.assignGroupChatHandlers(this.sharedService.rtmEventChannel);
          this.getEventChatHistory();
          this.updateAllMembersOnlineStatus();
        }, (reason) => { this.resourcesLoading = false; });
      } else {
        this.sharedService.rtmEventChannel = this.sharedService.rtmEventChannel.removeAllListeners();
        this.assignGroupChatHandlers(this.sharedService.rtmEventChannel);
      }
    } catch (e) {
      console.log('chat.component.createEventChannel:', e);
    }
  }

  private createRoomChannelAndGetChatHistory(): void {
    if (!this.roomData.RoomChannelName) {
      this.sharedService.setRoomChannelName(this.roomData);
    }
    this.sharedService.rtmRoomChannel = this.sharedService.rtmClient.createChannel(this.roomData.RoomChannelName);
    this.sharedService.rtmRoomChannel.join().then(async () => {
      this.assignRoomChatHandlers(this.sharedService.rtmRoomChannel);
      await this.sharedService.getRoomMembersFromAgoraChannel();
      this.sharedService.setPeoplesData();
      this.mediaInfoService.joinRoom();
      this.getRoomChatHistory();
    });
  }

  ngOnDestroy(): void {
    //await this.leaveRoomChannel();
    this.destroy$.next();
    this.destroy$.complete();
  }

  openPollDialog(): void {
    const dialogRef = this.dialog.open(PollDialogComponent, {
      width: '450px',
      data: {},
      hasBackdrop: false,
    });
  }

  getCurrentUtcDate(): Date {
    const currentDate = new Date();
    const currentDateUtc = new Date(currentDate.getUTCFullYear(), currentDate.getUTCMonth(),
      currentDate.getUTCDate(), currentDate.getUTCHours(), currentDate.getUTCMinutes(), currentDate.getUTCSeconds());
    return currentDateUtc;
  }

  async leaveChannel(): Promise<void> {
    if (this.sharedService.rtmEventChannel) {
      await this.sharedService.rtmEventChannel.leave().then(() => {
        console.log('Event channel left.');
      });
    }
  }

  async leaveRoomChannel(): Promise<void> {
    if (this.sharedService.rtmRoomChannel) {
      await this.sharedService.rtmRoomChannel.leave().then(() => {
        console.log('Room channel left.');
      });
    }
  }


  // ------------------Send message functions start--------------------------//

  sendMessage(message: string, type: string): void {

    // TODO, Prevent sending message that contains system keyword

    let eventMessage = message.trim();
    eventMessage = eventMessage.replace('<a href="', '<a target="_blank" href="'); // TODO Testing Need proper solution
    const rtmMessage = { messageType: 'TEXT', text: eventMessage } as RtmMessage;

    const channel = type == 'event' ? this.sharedService.rtmEventChannel : this.sharedService.rtmRoomChannel;

    channel.sendMessage(rtmMessage, { enableHistoricalMessaging: true, enableOfflineMessaging: true }).then(() => {
      const chatMessage = {
        senderId: this.sharedService.virtualEventUser.VirtualEventUserId.toString(),
        senderName: this.sharedService.virtualEventUser.FullName,
        time: this.getCurrentTime(),
        rtmMessage, self: true
      } as ChatMessage;
      if (type == 'event') {
        this.eventChatHistoryPageIndex = 0;
        this.eventMessages = [...this.eventMessages, chatMessage];
        this.renderer.setProperty(this.messageBox.nativeElement, 'innerHTML', '');
      } else {
        this.roomChatHistoryPageIndex = 0;
        this.roomMessages = [...this.roomMessages, chatMessage];
        this.renderer.setProperty(this.roomMessageBox.nativeElement, 'innerHTML', '');
      }
      setTimeout(() => {
        this.updateChatHeight();
      }, 200);
    }).catch(error => {
      this.messageService.showErrorMessage('An error occurred while sending the message!');
      console.error(error);
    });
  }

  resetMessageBox(event: any, type: string): boolean {
    event.preventDefault();
    if (type == 'event') {
      this.renderer.setProperty(this.messageBox.nativeElement, 'innerHTML', '');
    }
    else {
      this.renderer.setProperty(this.roomMessageBox.nativeElement, 'innerHTML', '');
    }
    return false;
  }

  validateMessage(event: any, message: string, type: string): boolean {
    if (!message) {
      return this.resetMessageBox(event, type);
    }
    if (!this.isUserLoggedIn) {
      return this.resetMessageBox(event, type);
    }

    const disableGrpChatBx = type == 'event' ? this.disabledEventChatTextbox : this.disabledRoomChatTextbox;

    if (disableGrpChatBx) {
      return this.resetMessageBox(event, type);
    }
    return true;
  }

  sendEventTextMessage(event: any): void {
    if (event.keyCode == 13) {
      const message = this.messageBox.nativeElement.innerHTML;
      if (!event.shiftKey) {
        if (this.validateMessage(event, message, 'event')) {
          event.preventDefault();
          this.sendMessage(message, 'event');
        }
      }
    }
    this.updateChatHeight();
  }

  sendEventMessage(event: any): void {
    const message = this.messageBox.nativeElement.innerHTML;
    if (this.validateMessage(event, message, 'event')) {
      this.sendMessage(message, 'event');
    }
  }

  sendRoomMessage(event: any): void {
    const message = this.roomMessageBox.nativeElement.innerHTML;
    if (this.validateMessage(event, message, 'room')) {
      this.sendMessage(message, 'room');
    }
  }

  sendRoomTextMessage(event: any): void {
    if (event.keyCode == 13) {
      if (!event.shiftKey) {
        const message = this.roomMessageBox.nativeElement.innerHTML;
        if (this.validateMessage(event, message, 'room')) {
          event.preventDefault();
          this.sendMessage(message, 'room');
        }
      }
    }
    this.updateChatHeight();
  }

  // ------------------------Send message function end-------------------------//

  private updateAllMembersOnlineStatus(): void {

    if (!this.sharedService.rtmEventChannel) {
      return;
    }

    this.sharedService.rtmEventChannel.getMembers().then((virtualEventUserIds) => {
      if (virtualEventUserIds) {
        this.sharedService.eventMembers.forEach(m => {
          if (virtualEventUserIds.indexOf(m.VirtualEventUserId.toString()) > -1) {
            m.Online = true;
          }
        });
      }
    });
  }

  private async updateRoomMemberStatus(virtualEventUserId: string, status: boolean) {
    var eventMember = this.sharedService.eventMembers.find(x => x.VirtualEventUserId == virtualEventUserId);
    this.sharedService.getMemberInfo(eventMember).then(() => {
      if (status) {
        eventMember.CurrentRoom = this.sharedService.currentRoomData.RoomName;
        eventMember.CurrentRoomId = this.sharedService.currentRoomData.VirtualEventRoomId;
        if (!this.sharedService.roomMembers.find(m => m.VirtualEventUserId == eventMember.VirtualEventUserId) && eventMember) {
          var copyOfEventMember = Object.assign({}, eventMember);
          copyOfEventMember.Online = true;
          copyOfEventMember.CurrentRoom = this.sharedService.currentRoomData.RoomName;
          copyOfEventMember.CurrentRoomId = this.sharedService.currentRoomData.VirtualEventRoomId;
          this.sharedService.roomMembers.push(copyOfEventMember);
        }
      } else {
        eventMember.CurrentRoom = "";
        eventMember.CurrentRoomId = 0;
        var roomMember = this.sharedService.roomMembers.find(x => x.VirtualEventUserId == virtualEventUserId);
        if (roomMember) {
          roomMember.CurrentRoom = "";
          roomMember.CurrentRoomId = 0;
          this.sharedService.roomMembers.splice(this.sharedService.roomMembers.indexOf(roomMember), 1);
        }
      }
      this.sharedService.setPeoplesData();
    });
  }

  private updateMemberOnlineStatus(virtualEventUserId: string, status: boolean): void {
    var member = this.sharedService.eventMembers.find(x => x.VirtualEventUserId == virtualEventUserId);
    if (member) {
      member.Online = status;
    }
    this.sharedService.updateEventMember(member);
  }

  getCurrentTime(): string {
    const now: Date = new Date();
    const time = moment(now).format('hh:mm A');
    return time;
  }

  getFormatedTimeFromTimeStamp(ts: any): string {
    const now: Date = new Date(ts);
    const time = moment(now).format('hh:mm A');
    return time;
  }

  async assignGroupChatHandlers(channel: RtmChannel): Promise<void> {
    if (!channel) {
      return;
    }

    channel.on('MemberJoined', (virtualEventUserId) => {
      this.updateMemberOnlineStatus(virtualEventUserId, true);
    });

    channel.on('MemberLeft', (virtualEventUserId) => {
      this.updateMemberOnlineStatus(virtualEventUserId, false);
    });

    channel.on('ChannelMessage', (message: RtmTextMessage, remoteUserId, messagePros) => {

      if (message.text && message.text == this.sharedService.muteUserCommand) {
        return;
      }
      else if (message.text && message.text == this.sharedService.unmuteUserCommand) {
        return;
      }
      else if (message.text && message.text == this.sharedService.allowUnmuteUserCommand) {
        return;
      }
      else if (message.text && message.text == this.sharedService.deniedUnmuteUserCommand) {
        return;
      }

      const attr = this.sharedService.eventMembers.find(x => x.VirtualEventUserId == remoteUserId);
      if (attr) {
        const chatMessage = {
          senderId: remoteUserId,
          senderName: attr.FullName,
          time: this.getCurrentTime(),
          rtmMessage: message,
          self: false,
          alt: this.sharedService.getUserShortName(attr.FullName),
          profileImageUrl: attr.ProfileImageUrl
        } as ChatMessage;

        this.eventMessages = [...this.eventMessages, chatMessage];
      }
    });
  }


  getEventChatHistory(pageIndex: number = 0): void {

    this.resourcesLoading = true;

    if (pageIndex == 0 || !pageIndex) {
      this.eventMessages = [];
    }

    const requestData = {
      Source: null,
      Destination: this.sharedService.virtualEventUser.VirtualEvent.EventChannelName,
      StartDate: this.sharedService.virtualEventUser.VirtualEvent.EventDatesInfo.StartDateUtc,
      EndDate: this.getCurrentUtcDate(),
      EventId: this.sharedService.virtualEventUser.VirtualEvent.EventId,
      PageIndex: pageIndex,
      PageSize: 100,
      Order: 'desc'
    } as HistoricalMessageRequestModel;

    this.virtualEventService.getChatHistory(requestData).pipe(takeUntil(this.destroy$)).subscribe(chatsData => {

      if (chatsData && chatsData.Data && chatsData.Data.Messages) {

        if (chatsData.Data.Messages.length > 0 && chatsData.Data.Messages.length < 100) {
          this.stopLoadingEventChatHistory = true;
        }

        chatsData.Data.Messages.forEach(m => {
          const rtmMessage = { text: m.Payload } as RtmMessage;
          const formatedTime = this.amCalendar.transform(m.Ms, { sameDay: 'h:mm A' });
          const chatMessage = {
            senderId: m.Src, senderName: m.FullName, alt: this.sharedService.getUserShortName(m.FullName),
            time: formatedTime,
            rtmMessage,
            self: m.Src == this.sharedService.virtualEventUser.VirtualEventUserId.toString(),
            profileImageUrl: m.ProfileImageUrl
          } as ChatMessage;
          this.eventMessages = [chatMessage, ...this.eventMessages];
        });
      }

      this.resourcesLoading = false;

    }, (error) => { console.log(error); this.resourcesLoading = false; });
  }

  assignRoomChatHandlers(channel: RtmChannel): void {

    if (!channel) {
      return;
    }

    channel.on('AttributesUpdated', (attrributes: ChannelAttributes) => {
      let userId = attrributes["lastUpdateUserId"].lastUpdateUserId;
      if (this.sharedService.virtualEventUser.VirtualEventUserId.toString() != userId) {
        this.sharedService.changeUserRole(userId);
      }
    })

    channel.on('MemberCountUpdated', async (memberCount) => {
      if (this.sharedService.roomMembers.length != memberCount) {
        await this.sharedService.getRoomMembersFromAgoraChannel();
      }
    });

    channel.on('MemberJoined', (virtualEventUserId) => {
      setTimeout(() => {
        this.updateRoomMemberStatus(virtualEventUserId, true);
      }, 1000);
    });

    channel.on('MemberLeft', (remoteUserId) => {
      setTimeout(() => {
        this.updateRoomMemberStatus(remoteUserId, false);
      }, 1000);
    });

    channel.on('ChannelMessage', async (message: RtmTextMessage, remoteUserId, messagePros) => {
      if (message.text == this.sharedService.muteUserCommand
        || message.text == this.sharedService.unmuteUserCommand
        || message.text == this.sharedService.allowUnmuteUserCommand
        || message.text == this.sharedService.deniedUnmuteUserCommand) {
        return;
      }

      if (message.text && message.text == this.sharedService.selfRoleChange) {
        var rMember = this.sharedService.roomMembers.find(m => m.VirtualEventUserId == remoteUserId);
        await this.sharedService.getMemberInfo(rMember);
        return;
      }

      const attr = this.sharedService.eventMembers.find(x => x.VirtualEventUserId == remoteUserId);
      if (attr) {
        const chatMessage = {
          senderId: remoteUserId,
          senderName: attr.FullName,
          time: this.getCurrentTime(),
          rtmMessage: message, self: false,
          alt: this.sharedService.getUserShortName(attr.FullName),
          profileImageUrl: attr.ProfileImageUrl
        } as ChatMessage;
        this.roomChatHistoryPageIndex = 0;
        this.roomMessages = [...this.roomMessages, chatMessage];
      }
    });
  }


  getRoomChatHistory(pageIndex: number = 0): void {

    if (this.sharedService.currentRoomData && this.sharedService.currentRoomData.RoomType == RoomType.PrivateRoom) {

      if (pageIndex == 0 || !pageIndex) {
        this.roomMessages = [];
      }

      this.resourcesLoading = false;
      this.roomChatLoading = true;

      try {
        const requestData = {
          Source: null,
          Destination: this.roomData.RoomChannelName,
          StartDate: this.sharedService.virtualEventUser.VirtualEvent.EventDatesInfo.StartDateUtc,
          EndDate: this.getCurrentUtcDate(),
          EventId: this.sharedService.virtualEventUser.VirtualEvent.EventId,
          PageIndex: pageIndex,
          PageSize: 100,
          Order: 'desc'
        } as HistoricalMessageRequestModel;

        this.virtualEventService.getChatHistory(requestData).pipe(takeUntil(this.destroy$)).subscribe(chatsData => {

          if (chatsData && chatsData.Data && chatsData.Data.Messages) {

            if (chatsData.Data.Messages.length > 0 && chatsData.Data.Messages.length < 100) {
              this.stopLoadingRoomChatHistory = true;
            }

            chatsData.Data.Messages.forEach(m => {
              const rtmMessage = { text: m.Payload } as RtmMessage;
              const formatedTime = this.amCalendar.transform(m.Ms, { sameDay: 'h:mm A' });
              const chatMessage = {
                senderId: m.Src, senderName: m.FullName,
                alt: this.sharedService.getUserShortName(m.FullName),
                time: formatedTime,
                rtmMessage,
                self: m.Src == this.sharedService.virtualEventUser.VirtualEventUserId.toString(),
                profileImageUrl: m.ProfileImageUrl
              } as ChatMessage;
              this.roomMessages = [chatMessage, ...this.roomMessages];
            });
          }

          this.roomChatLoading = false;

        }, (error) => { console.log(error); this.roomChatLoading = false; });
      } catch (e) {
        this.roomChatLoading = false;
      }
    }
  }


  onEventChatScrollUp(): void {
    if (!this.stopLoadingEventChatHistory) {
      //this.getEventChatHistory(++this.eventChatHistoryPageIndex);
    }
  }


  onRoomChatScrollUp(): void {
    if (!this.stopLoadingRoomChatHistory) {
      this.getRoomChatHistory(++this.roomChatHistoryPageIndex);
    }
  }

  onEventTabButtonClick(): void {
    this.eventChatActive = true;
    this.roomChatActive = false;
    if (this.eventMessages.length == 0 && !this.resourcesLoading) {
      //this.getEventChatHistory();
    }
    setTimeout(() => {
      this.updateChatHeight(); console.log('onEventTabButtonClick()');
    }, 200);
  }

  onRoomTabButtonClick(): void {
    this.eventChatActive = false;
    this.roomChatActive = true;
    if (this.roomMessages.length == 0 && !this.roomChatLoading) {
      this.getRoomChatHistory();
    }
    setTimeout(() => {
      this.updateChatHeight();
    }, 200);
  }

  replaceChatAnchor(match): boolean {
    console.log('href = ', match.getAnchorHref());
    console.log('text = ', match.getAnchorText());

    switch (match.getType()) {
      case 'url':
        console.log('url: ', match.getUrl());

        return true;  // let Autolinker perform its normal anchor tag replacement
    }
  }

  subscribeOnlineStatusCommand(): void {
    this.sharedService.onUpdateEventMembersOnlineCommand.pipe(takeUntil(this.destroy$)).subscribe(s => {
      this.updateAllMembersOnlineStatus();
    });
  }
}
