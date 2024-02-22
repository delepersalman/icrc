import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'src/app/shared/services/message.service';
import { BroadcastDataModel, BroadcastNotificationToEvent } from '../../models/common.model';
import { RoomBaseAction, RoomType, VirtualEventRoomModel } from '../../models/virtualevent.room.model';
import { SharedFireworksComponentService } from '../../services/shared.service';
import { VirtualEventService } from '../../services/virtualevent.service';

@Component({
  selector: 'app-controll-room',
  templateUrl: './controll-room.component.html',
  styleUrls: ['./controll-room.component.scss']
})
export class ControllRoomComponent implements OnInit, OnDestroy {

  constructor(private sharedService: SharedFireworksComponentService,
              private virtualEventService: VirtualEventService,
              private messageService: MessageService) { }
  roomType: any = RoomType;
  rooms: VirtualEventRoomModel[];
  broadcastMessageModel: BroadcastNotificationToEvent = new BroadcastNotificationToEvent();
  destroy$ = new Subject();

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.broadcastMessageModel.VirtualEventId = this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId;
    this.broadcastMessageModel.NotificationSentByUserId = this.sharedService.virtualEventUser.VirtualEventUserId;
    this.broadcastMessageModel.NotificationType = 'publicmessage';
    this.broadcastMessageModel.MessageType = 'event';
    this.rooms = this.sharedService.virtualEventUser.VirtualEvent.Rooms;
    if (this.rooms.length > 0) {
      this.rooms.forEach(element => {
        if (element.RoomType === this.roomType.Session || element.RoomType === this.roomType.Expo) {
          this.virtualEventService.getEventRoomDetail(this.sharedService.virtualEventUser.VirtualEvent.EventId, element.VirtualEventRoomId)
            .pipe(takeUntil(this.destroy$)).subscribe(rd => {
              if (rd && rd.Data) {
                element.VirtualEventBooths = rd.Data.VirtualEventBooths;
              }
            }, error => {
              console.log(error);
            });
        }
        this.sharedService.currentRoomData = null;
      });
    }
  }

  broadcastMessage(): void {
    if (this.broadcastMessageModel.MessageType === 'room' && this.broadcastMessageModel.RoomIds.length === 0) {
      this.messageService.showErrorMessage('Please select room(s)');
      return;
    }

    if (!this.broadcastMessageModel.Notification) {
      this.messageService.showErrorMessage('Please enter message');
      return;
    }

    if (this.broadcastMessageModel.MessageType === 'event') {
      this.virtualEventService.SaveAndBroadcastNotification(this.broadcastMessageModel).subscribe(res => {
        if (res.Data) {
          this.messageService.showSuccessMessage('Message broadcasted!!');
          this.broadcastMessageModel.Notification = '';
        }
      });
    } else {
      const data = new BroadcastDataModel();
      data.VirtualEventId = this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId;
      data.DataType = RoomBaseAction.BroadcastMessageToRooms;
      data.Data = this.broadcastMessageModel;
      this.virtualEventService.broadcastClientDataToEventClients(data).subscribe(() => {
        this.messageService.showSuccessMessage('Message broadcasted!!');
        this.broadcastMessageModel.Notification = '';
      }, error => {
        console.log(error);
      });
    }
  }
}
