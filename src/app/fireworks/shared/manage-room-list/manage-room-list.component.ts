import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VirtualEventRoomModel } from '../../models/virtualevent.room.model';
import { SharedFireworksComponentService } from '../../services/shared.service';

@Component({
  selector: 'manage-room-list',
  templateUrl: './manage-room-list.component.html',
  styleUrls: ['./manage-room-list.component.scss']
})
export class ManageRoomListComponent implements OnInit {
  roomList: VirtualEventRoomModel[];
  constructor(@Inject(MAT_DIALOG_DATA) public data: VirtualEventRoomModel[]) { }

  ngOnInit() {
    this.roomList = this.data;
  }

}
