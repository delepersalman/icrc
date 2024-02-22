import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VirtualEventService } from '../../services/virtualevent.service';
import { BreakoutRoomModel, RoomBaseAction, RoomType, VirtualEventPrivateRoomModel } from '../../models/virtualevent.room.model';
import { SharedFireworksComponentService } from '../../services/shared.service';
import { EnumerationUserRole, VirtualEventUserModel } from '../../models/virtualevent.user.model';
import { StatusCode } from 'src/app/shared/models/api.response.model';
import { MessageService } from 'src/app/shared/services/message.service';
import { ManageAttendeeComponent } from '../../manage-attendee/manage-attendee.component';
import { MemberAttributes } from '../../models/rtm.model';
import { BroadcastDataModel, ConfirmDialogComponentData } from '../../models/common.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatMenuTrigger } from '@angular/material/menu';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-create-breakout-room',
  templateUrl: './create-breakout-room.component.html',
  styleUrls: ['./create-breakout-room.component.scss']
})
export class CreateBreakoutRoomComponent implements OnInit, OnDestroy {
  attendees = [];
  roomNumber = 0;
  allocationTypes: string[] = ["Automatic", "Manual"];
  distrubutedRoomsAttendee: any[] = [];
  breakout: BreakoutRoomModel = new BreakoutRoomModel();
  step1 = false;
  step2 = false;
  title = "Breakout Rooms";
  broadcastMessage: string;
  userData: VirtualEventUserModel;
  destroy$ = new Subject();
  constructor(private dialog: MatDialog, private virtualeventService: VirtualEventService,
    protected sharedService: SharedFireworksComponentService, private messageService: MessageService,
    public router: Router, public route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.getAttendeeRoomNames();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  getAttendeeRoomNames() {
    let memberIds = this.sharedService.eventMembers.filter(z => z.VirtualEventUserId != this.sharedService.virtualEventUser.VirtualEventUserId.toString() && z.Online).map(x => parseInt(x.VirtualEventUserId));
    if (memberIds.length > 0)
      this.attendees = this.createAttendeesList();

    this.getAllBreakoutRooms();
  }

  createAttendeesList(): any {
    return this.sharedService.eventMembers.filter(x => x.VirtualEventUserId != this.sharedService.virtualEventUser.VirtualEventUserId.toString()
      && x.Online && !this.sharedService.isHostOrCoHost(x)
    ).map(x => {
      return {
        VirtualEventUserId: x.VirtualEventUserId,
        FullName: x.FullName,
        FirstName: x.FirstName,
        LastName: x.LastName,
        Alt: x.Alt,
        Online: x.Online,
        ChannelRole: x.ChannelRole,
        IsScreenClient: x.IsScreenClient,
        CurrentRoom: x.CurrentRoom,
        VirtualEventUserRoles: x.VirtualEventUserRoles
      }
    })
  }

  fillRoomArray() {
    if (this.breakout.AttendeePerBreakout > this.attendees.length && this.breakout.AttendeePerBreakout > 0) {
      this.breakout.AttendeePerBreakout = this.attendees.length;
    } else if (this.breakout.AttendeePerBreakout > environment.maxPresenter) {
      this.breakout.AttendeePerBreakout = environment.maxPresenter;
    }

    if (this.breakout.AttendeePerBreakout) {
      var copy = [];
      Object.assign(copy, this.attendees);
      this.distrubutedRoomsAttendee = this.getAttendeesPerRoom(copy, this.breakout.AttendeePerBreakout);
      this.roomNumber = this.distrubutedRoomsAttendee.length;
    }
  }

  getAttendeesPerRoom(myArray, chunk_size) {
    var results = [];
    while (myArray.length) {
      results.push(myArray.splice(0, chunk_size));
    }
    return results;
  }

  broadcastCloseMessageToHostAndCoHost(breakoutRoom: VirtualEventPrivateRoomModel) {
    var clientData = new BroadcastDataModel();
    clientData.DataType = RoomBaseAction.CloseBreakoutRooms;
    clientData.VirtualEventId = this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId;
    var hostAndCoHost = this.sharedService.eventMembers.filter(m => this.sharedService.isHostOrCoHost(m));
    clientData.UserIds = hostAndCoHost.map(m => { return parseInt(m.VirtualEventUserId) });
    clientData.Data = { RoomName: breakoutRoom.RoomName, VirtualEventPrivateRoomId: breakoutRoom.VirtualEventPrivateRoomId };
    this.virtualeventService.broadcastClientDataToEventClients(clientData).pipe(takeUntil(this.destroy$)).subscribe(() => {
      console.log('broadcasted to host');
    });
  }


  OpenCloseSpecificRoom(breakoutRoom: VirtualEventPrivateRoomModel) {
    var message = 'Breakout room ' + (breakoutRoom.IsRoomOpen ? 'closed' : 'opened') + ' successfully.';
    breakoutRoom.IsRoomOpen = !breakoutRoom.IsRoomOpen;
    this.breakout.BroadcastDataToParticipants = true;
    if (!breakoutRoom.IsRoomOpen)
      this.broadcastCloseMessageToHostAndCoHost(breakoutRoom);
    this.saveBreakoutInDB().pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.messageService.showSuccessMessage(message);
    });
  }

  openCloseAllRooms(opt: string) {
    this.breakout.Rooms.forEach(br => {
      br.IsRoomOpen = (opt == 'opened' ? true : false);
      if (!br.IsRoomOpen)
        this.broadcastCloseMessageToHostAndCoHost(br);
    })
    this.breakout.BroadcastDataToParticipants = true;
    this.saveBreakoutInDB().pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.messageService.showSuccessMessage('Breakout room(s) ' + opt + ' successfully.');
    });
  }

  JoinBreakoutRoom(breakoutRoom: VirtualEventPrivateRoomModel) {
    if (this.sharedService.currentRoomData.RoomType == RoomType.Breakout && this.sharedService.currentRoomData.VirtualEventRoomId == breakoutRoom.VirtualEventPrivateRoomId)
      return;

    var previousRoomId = this.sharedService.currentRoomData.VirtualEventRoomId;
    this.dialog.closeAll();
    if (this.sharedService.roomClientConnected) {
      this.sharedService.autoJoin = true;
    }
    this.sharedService.roomClientConnected = false;
    var url = `/fireworks/${this.sharedService.virtualEventUser.VirtualEvent.EventId}/${this.sharedService.virtualEventUser.EventAccessToken}/breakout/${previousRoomId}/${breakoutRoom.RoomName.toLowerCase().replace(/ /g, '-')}/${breakoutRoom.VirtualEventPrivateRoomId}`;
    this.router.navigate([url]);
  }

  showOpenCloseAllRooms(check): any {
    var res = this.breakout.Rooms.find(x => (check == 'open' ? x.IsRoomOpen : !x.IsRoomOpen)) != undefined;
    return res;
  }

  moveAttendeetoAnotherRoom(sourceRoomId: number, destinationRoomId: number, attendeeId: string) {
    var sourceBreakoutRoom = this.breakout.Rooms.find(x => x.VirtualEventPrivateRoomId == sourceRoomId);
    var DestinationBreakoutRoom = this.breakout.Rooms.find(x => x.VirtualEventPrivateRoomId == destinationRoomId);
    var attendee = sourceBreakoutRoom.RoomParticipants.find(x => x.VirtualEventUserId == attendeeId);
    DestinationBreakoutRoom.RoomParticipants.push(attendee);
    sourceBreakoutRoom.RoomParticipants.splice(sourceBreakoutRoom.RoomParticipants.indexOf(attendee), 1);
    sourceBreakoutRoom.ParticipantIds = sourceBreakoutRoom.RoomParticipants.map(x => { return x.VirtualEventUserId }).join(',');
    DestinationBreakoutRoom.ParticipantIds = DestinationBreakoutRoom.RoomParticipants.map(x => { return x.VirtualEventUserId }).join(',');
    this.saveBreakoutRooms();
  }

  goBack() {
    this.step2 = false;
    this.step1 = true;
  }

  gotoNextStep() {
    this.step2 = true;
    this.step1 = false;
  }

  getUnassignedAttendees(): MemberAttributes[] {
    var roomParticipantIds = [];
    this.breakout.Rooms.forEach(em => {
      if (em.RoomParticipants) {
        roomParticipantIds = roomParticipantIds.concat(em.RoomParticipants.map(x => { return x.VirtualEventUserId }));
      }
    });
    if (roomParticipantIds.length > 0)
      return this.attendees.filter(x => roomParticipantIds.indexOf(x.VirtualEventUserId) == -1);
    else
      return this.attendees;
  }

  createNewBreakoutRoom() {
    if (this.attendees.length > 0) {
      this.CreateBreakoutRoom(this.breakout.Rooms.length, 'none');
      if (this.breakout.BreakoutAttendeeAllocationType == "Automatic") {
        var newRoom = this.breakout.Rooms[this.breakout.Rooms.length - 1];
        var unAssignedMembers = this.getUnassignedAttendees();
        if (unAssignedMembers.length > 0) {
          newRoom.RoomParticipants = [];
          var selectedAttendee = unAssignedMembers.splice(0, this.breakout.AttendeePerBreakout);
          newRoom.RoomParticipants = newRoom.RoomParticipants.concat(selectedAttendee);
          newRoom.ParticipantIds = newRoom.RoomParticipants.map(x => { return x.VirtualEventUserId }).join(',');
        }
      }
      this.saveBreakoutRooms();
    } else
      this.messageService.showErrorMessage("Sorry!! no more attendee(s) to assign.");
  }

  CreateBreakoutRoom(index: number, allocationType: string) {
    let breakoutRoom = {
      VirtualEventUserId: this.sharedService.virtualEventUser.VirtualEventUserId,
      VirtualEventId: this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId,
      RoomName: 'Breakout Room ' + (index + 1),
      AllowGuestInvite: true,
      AllowHandouts: true,
      AllowPollsAndSurvey: true,
      AllowRecording: true,
      RoomParticipants: []
    } as VirtualEventPrivateRoomModel;
    if (allocationType == 'Automatic') {
      breakoutRoom.RoomParticipants = this.distrubutedRoomsAttendee[index];
      breakoutRoom.ParticipantIds = this.distrubutedRoomsAttendee[index].map((x: { VirtualEventUserId: any; }) => { return x.VirtualEventUserId }).join(',');
    }
    this.breakout.Rooms.push(breakoutRoom);
  }

  saveBreakoutInDB() {
    return this.virtualeventService.createBreakoutRooms(this.breakout);
  }

  saveBreakoutRooms() {
    this.saveBreakoutInDB().pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res.StatusCode == StatusCode.Ok) {
        this.breakout = res.Data;
        this.assignRoomMembers();
        this.gotoNextStep();
      }
    });
  }

  saveBreakoutRoomSettings() {
    this.saveBreakoutInDB().pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res.StatusCode == StatusCode.Ok) {
        this.messageService.showSuccessMessage("Setting saved successfully.");
      }
    });
  }


  renameBreakoutRoom(breakoutRoom) {
    breakoutRoom.enableEdit = false;
    this.saveBreakoutRooms();
  }

  prepareClientData(breakoutRoom: VirtualEventPrivateRoomModel): BroadcastDataModel {
    var clientData = new BroadcastDataModel();
    clientData.VirtualEventId = this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId;
    clientData.DataType = breakoutRoom.IsRoomOpen ? RoomBaseAction.CloseBreakoutRooms : RoomBaseAction.OpenBreakoutRooms;
    var data: any = { VirtualEventId: this.breakout.VirtualEventId }
    data.Rooms = [];
    data.Rooms.push(breakoutRoom);
    clientData.Data = data;
    return clientData;
  }

  deleteAllRooms() {
    var dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        Title: 'Please confirm',
        Message: 'Are you sure you want to delete selected room(s)?',
        CancelText: 'No',
        OkText: 'Yes'
      } as ConfirmDialogComponentData
    });
    dialogRef.afterClosed().toPromise().then(result => {
      if (result) {
        var selectedRooms = this.breakout.Rooms.filter(x => x.Checked);
        var roomIds = selectedRooms.map(x => { return x.VirtualEventPrivateRoomId });
        this.virtualeventService.deleteBreakoutRooms(roomIds, this.sharedService.virtualEventUser.VirtualEventUserId).pipe(takeUntil(this.destroy$)).subscribe(res => {
          if (res.StatusCode == StatusCode.Ok) {
            selectedRooms.forEach(breakoutRoom => {
              this.broadcastCloseMessageToHostAndCoHost(breakoutRoom);
              this.breakout.Rooms.splice(this.breakout.Rooms.indexOf(breakoutRoom), 1);
            })
            if (this.breakout.Rooms.length == 0) {
              this.goBack();
              this.allChecked = false;
              this.fillRoomArray();
            }
            this.messageService.showSuccessMessage('Selected breakout room(s) deleted successfully.');
          }
        })
      }
    });
  }

  deleteRoom(breakoutRoom: VirtualEventPrivateRoomModel) {
    var dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        Title: 'Please confirm',
        Message: 'Are you sure you want to delete this room?',
        CancelText: 'No',
        OkText: 'Yes'
      } as ConfirmDialogComponentData
    });
    dialogRef.afterClosed().toPromise().then(result => {
      if (result) {
        this.virtualeventService.deleteBreakoutRooms([breakoutRoom.VirtualEventPrivateRoomId], this.sharedService.virtualEventUser.VirtualEventUserId).pipe(takeUntil(this.destroy$)).subscribe(res => {
          if (res.StatusCode == StatusCode.Ok) {
            this.broadcastCloseMessageToHostAndCoHost(breakoutRoom);
            this.breakout.Rooms.splice(this.breakout.Rooms.indexOf(breakoutRoom), 1);
            if (this.breakout.Rooms.length == 0) {
              this.goBack();
              this.allChecked = false;
              this.fillRoomArray();
            }
            this.messageService.showSuccessMessage('Breakout room deleted successfully.');
          }
        })
      }
    });
  }

  createBreakoutRooms() {
    this.breakout.Rooms = [];
    if (this.breakout.AttendeePerBreakout > 0) {
      for (let index = 0; index < this.roomNumber; index++) {
        this.CreateBreakoutRoom(index, this.breakout.BreakoutAttendeeAllocationType);
      }
      this.breakout.BroadcastDataToParticipants = false;
      this.saveBreakoutRooms();
    } else {
      this.messageService.showErrorMessage("Please assign some attendees.");
    }
  }

  openManageAttendeePopup(breakout: VirtualEventPrivateRoomModel) {
    this.dialog.open(ManageAttendeeComponent, {
      width: '80%',
      maxHeight: '80%',
      data: { eventMembers: this.getUnassignedAttendees(), callFor: 'breakoutRooms' }
    }).afterClosed().pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res) {
        if (!breakout.RoomParticipants)
          breakout.RoomParticipants = [];
        res.forEach((member: { VirtualEventUserId: any; }) => {
          var em = this.attendees.find(x => x.VirtualEventUserId == member.VirtualEventUserId);
          if (em) {
            breakout.RoomParticipants.push(em);
            breakout.ParticipantIds = breakout.RoomParticipants.map(x => { return x.VirtualEventUserId }).join(',');
          }
        })
        this.breakout.BroadcastDataToParticipants = false;
        this.saveBreakoutRooms();
      }
    });
  }

  removeParticipant(participant, breakoutRoom: VirtualEventPrivateRoomModel) {
    var clientData = this.prepareClientData(breakoutRoom);
    clientData.DataType = RoomBaseAction.CloseBreakoutRooms;
    clientData.UserIds = [participant.VirtualEventUserId];
    this.virtualeventService.broadcastClientDataToEventClients(clientData).pipe(takeUntil(this.destroy$)).subscribe(res => {
      breakoutRoom.RoomParticipants.splice(breakoutRoom.RoomParticipants.indexOf(participant), 1);
      breakoutRoom.ParticipantIds = breakoutRoom.RoomParticipants.map(x => { return x.VirtualEventUserId }).join(',');
      this.saveBreakoutRooms();
      this.messageService.showSuccessMessage("Attendee removed successfully.");
    })

  }

  getAllBreakoutRooms() {
    this.virtualeventService.getBreakoutRooms(this.sharedService.virtualEventUser.VirtualEventUserId, this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId).subscribe(res => {
      if (res.StatusCode == StatusCode.Ok) {
        this.breakout = res.Data;
        this.assignRoomMembers();
        if (this.breakout.Rooms.length > 0)
          this.gotoNextStep();
        else {
          this.fillRoomArray();
          this.goBack();
        }
      }
    })
  }

  broadcastMessagetoAllRooms() {
    var roomIds = this.breakout.Rooms.filter(r => r.Checked).map(x => { return x.VirtualEventPrivateRoomId });
    if (this.broadcastMessage) {
      if (roomIds.length > 0) {
        var clientData = new BroadcastDataModel();
        clientData.VirtualEventId = this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId;
        clientData.DataType = RoomBaseAction.BroadcastMessageToBreakout
        clientData.Data = {
          roomIds: roomIds,
          message: this.broadcastMessage
        };
        this.virtualeventService.broadcastClientDataToEventClients(clientData).pipe(takeUntil(this.destroy$)).subscribe(res => {
          this.messageService.showSuccessMessage('Message broadcasted to selected room(s)!!');
          this.broadcastMessage = "";
        })
      } else {
        this.messageService.showErrorMessage('Please select a room first!!');
      }
    } else {
      this.messageService.showErrorMessage('Please enter message!!');
    }
  }

  assignRoomMembers() {
    this.breakout.Rooms.forEach(room => {
      room.VirtualEventUserId = this.sharedService.virtualEventUser.VirtualEventUserId;
      room.RoomParticipants = [];
      if (room.ParticipantIds) {
        var ids = room.ParticipantIds.split(',').map(x => { return parseInt(x) });
        room.RoomParticipants = this.attendees.filter((x) => ids.indexOf(parseInt(x.VirtualEventUserId)) != -1 && x.Online);
      }
    })
  }

  allChecked: boolean = false;

  updateAllComplete() {
    this.allChecked = this.breakout.Rooms != null && this.breakout.Rooms.every(t => t.Checked);
  }

  setAll(checked: boolean) {
    this.allChecked = checked;
    if (this.breakout.Rooms == null) {
      return;
    }
    this.breakout.Rooms.forEach(t => t.Checked = checked);
  }

  someChecked(): boolean {
    if (this.breakout.Rooms == null) {
      return false;
    }
    return this.breakout.Rooms.filter(t => t.Checked).length > 0 && !this.allChecked;
  }
}
