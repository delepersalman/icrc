import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from '../../shared/services/message.service';
import { sleep } from '../constants/fireworks-constants';
import { BroadcastDataModel, ConfirmDialogComponentData, EnumerationTrackingActivityType } from '../models/common.model';
import { MemberAttributes, RtmTextMessage } from '../models/rtm.model';
import { RoomBaseAction, RoomType, VirtualEventRoomModel } from '../models/virtualevent.room.model';
import { EnumerationUserRole } from '../models/virtualevent.user.model';
import { SharedFireworksComponentService } from '../services/shared.service';
import { VirtualEventService } from '../services/virtualevent.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'manage-attendee',
  templateUrl: './manage-attendee.component.html',
  styleUrls: ['./manage-attendee.component.scss']
})
export class ManageAttendeeComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: MatTableDataSource<MemberAttributes>;
  memberSearch: string = '';
  memberFilter: string = 'online';
  attendeeTypeFilter: string = 'attendee';

  displayedColumns: string[] = [
    'VirtualEventUserId',
    'AttendeeName',
    'RoomName',
    'Status',
  ];
  selection = new SelectionModel<MemberAttributes>(true, []);
  roomType: any = RoomType;
  rooms: VirtualEventRoomModel[] = [];
  destroy$ = new Subject();
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<ManageAttendeeComponent>, public dialog2: MatDialog,
    public sharedService: SharedFireworksComponentService, private messageService: MessageService,
    public popOverDialog: MatDialog, private virtualEventService: VirtualEventService, public popUp: MatDialog,) {
    this.filterAttendeesByStatus(this.memberFilter);
  }

  ngOnInit(): void {
    this.bindChildRoom();
    this.getAttendeeRoomName();
    this.sharedService.onSetAttendeeRoomName.pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res) {
        var eventMember = this.data.eventMembers.filter((x: { VirtualEventUserId: any; }) => x.VirtualEventUserId == res.MemberId)[0];
        if (eventMember)
          eventMember.CurrentRoom = res.RoomName;
      }
    });

    this.sharedService.onEventMembersUpdated.pipe(takeUntil(this.destroy$)).subscribe((member: MemberAttributes) => {
      var eventMember = this.data.eventMembers.find((m: { VirtualEventUserId: string; }) => m.VirtualEventUserId == member.VirtualEventUserId);
      if (eventMember) {
        eventMember.Online = member.Online;
      }
      this.filterAttendeesByStatus(this.memberFilter);
    })
  }


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  dataSourceClone: MemberAttributes[] = [];
  searchMembers() {
    var totalAttendees = this.dataSourceClone.filter((x: MemberAttributes) => x.FullName.toLowerCase().indexOf(this.memberSearch) != -1
      || (x.CurrentRoom ? x.CurrentRoom.toLowerCase().indexOf(this.memberSearch) != -1 : false));
    this.createDataSource(totalAttendees);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row: MemberAttributes) => this.selection.select(row));
  }

  assignAttendees() {
    this.dialog.close(this.selection.selected);
  }

  kickOutAttendee() {
    if (this.selection.selected.length == 0)
      this.messageService.showErrorMessage('Please select attendee for remove from room.');
    else {
      const dialogRef = this.dialog2.open(ConfirmDialogComponent, {
        data: {
          Title: 'Please confirm',
          Message: 'Are you sure you want to remove selected attendees?',
          CancelText: 'No',
          OkText: 'Yes'
        } as ConfirmDialogComponentData
      });
      dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
        if (result) {
          let memberIds = this.selection.selected.filter(z => z.Online == true && z.VirtualEventUserId != this.sharedService.virtualEventUser.VirtualEventUserId.toString())
            .map(x => parseInt(x.VirtualEventUserId));
          if (memberIds.length > 0) {
            let data = new BroadcastDataModel();
            data.UserIds = memberIds; // broadcast to selected attendees only.
            data.VirtualEventId = this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId;
            data.DataType = RoomBaseAction.Kickout;
            //todo: Move to waitroom functionality.
            data.UserIds.forEach((virtualEventUserId: any) => {
              this.sharedService.saveFireworksActivity(this.sharedService.currentRoomData.VirtualEventRoomId, 
                virtualEventUserId, EnumerationTrackingActivityType.LeaveFireworksRoom, this.sharedService.currentRoomData.RoomType);
            });
            this.virtualEventService.broadcastClientDataToEventClients(data).pipe(takeUntil(this.destroy$)).subscribe(res => {
              this.messageService.showSuccessMessage("Selected user removed from room(s)");
            }, error => {
              console.log(error);
            });
          }
        }
      });
    }
  }  

  moveAttendeetoAnotherRoom(roomData: any) {
    if (this.selection.selected.length == 0)
      this.messageService.showErrorMessage('Please select attendees to move.');
    else {
      let memberIds = this.selection.selected.filter(z => z.VirtualEventUserId != this.sharedService.virtualEventUser.VirtualEventUserId.toString()).map(x => parseInt(x.VirtualEventUserId));
      if (memberIds.length > 0) {
        if (roomData.RoomType.indexOf(RoomType.Session) != -1)
          roomData.RoomType = RoomType.Session;
        else if (roomData.RoomType.indexOf(RoomType.CustomRoom) != -1)
          roomData.RoomType = RoomType.CustomRoom;
        else if (roomData.RoomType.indexOf(RoomType.Expo) != -1)
          roomData.RoomType = RoomType.Expo;

        var roomDataModel = {
          RoomName: roomData.RoomName,
          RoomType: roomData.RoomType.toLowerCase(),
          RoomId: roomData.VirtualEventRoomId
        };

        var roleChangeMsg: RtmTextMessage = {
          text: this.sharedService.moveAttendee + '~' + JSON.stringify(roomDataModel),
          messageType: 'TEXT'
        } as RtmTextMessage;

        memberIds.forEach(async (id, index) => {
          if (index == 99) {
            await sleep(2000);
          }
          this.sharedService.rtmClient.sendMessageToPeer(roleChangeMsg, id.toString()).then((res: any) => {
            if (res.hasPeerReceived) {
              this.messageService.showSuccessMessage("Selected user move to “" + roomData.RoomName + "” room.");
            }
          })
        });
      }
    }
  }

  getAttendeeRoomName() {
    let memberIds = this.data.eventMembers.filter((z: { Online: any; }) => z.Online).map((x: { VirtualEventUserId: string; }) => parseInt(x.VirtualEventUserId));
    if (memberIds.length > 0) {
      var data = new BroadcastDataModel();
      data.UserIds = memberIds; // broadcast to selected attendees only.
      data.VirtualEventId = this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId;
      data.DataType = RoomBaseAction.GetRoomName;
      data.Data = {
        RequestBy: this.sharedService.virtualEventUser.VirtualEventUserId,
        ActionName: RoomBaseAction.GetRoomName,
        MemberIds: memberIds
      };
      this.virtualEventService.broadcastClientDataToEventClients(data).subscribe(res => { })
    }
  }

  bindChildRoom() {
    this.rooms = this.sharedService.virtualEventUser.VirtualEvent.Rooms;
    if (this.rooms.length > 0) {
      this.rooms.forEach(element => {
        if (element.RoomType == this.roomType.Session || element.RoomType == this.roomType.Expo || element.RoomType == this.roomType.Networking) {
          this.virtualEventService.getEventRoomDetail(this.sharedService.virtualEventUser.VirtualEvent.EventId, element.VirtualEventRoomId).pipe(takeUntil(this.destroy$)).subscribe(rd => {
            if (rd && rd.Data) {
              element.VirtualEventBooths = rd.Data.VirtualEventBooths;
            }
          }, error => {
          });
        }
      });
    }
  }

  async ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  filterAttendeesByStatus(status: string): void {
    this.memberFilter = status;
    var totalAttendees = this.data.eventMembers;
    this.selection.clear();
    if (status != 'All') {
      totalAttendees = this.data.eventMembers.filter((x: { Online: any; }) => status == 'online' ? x.Online : !x.Online);
    }
    if (this.attendeeTypeFilter != 'All') {
      if (this.attendeeTypeFilter == 'host') {
        totalAttendees = totalAttendees.filter((x: any) => this.sharedService.isHostOrCoHost(x));
      } else if (this.attendeeTypeFilter == 'speaker') {
        totalAttendees = totalAttendees.filter((x: any) => this.sharedService.checkUserRole(EnumerationUserRole.Presenter, x) && !this.sharedService.isHostOrCoHost(x));
      } else {
        totalAttendees = totalAttendees.filter((x: any) => this.sharedService.checkUserRole(EnumerationUserRole.Attendee, x) && !this.sharedService.isHostOrCoHost(x));
      }
    }
    this.dataSourceClone = totalAttendees;
    this.createDataSource(totalAttendees);
    if (this.memberSearch) {
      this.searchMembers();
    }
  }

  createDataSource(filteredData: MemberAttributes[]): void {
    this.dataSource = new MatTableDataSource(filteredData);
    if (this.paginator && this.sort) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }
}
