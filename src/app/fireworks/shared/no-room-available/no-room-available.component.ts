import { Component, OnInit, Input } from '@angular/core';
import { VirtualEventRoomModel } from '../../models/virtualevent.room.model';

@Component({
  selector: 'fireworks-no-room-available',
  templateUrl: './no-room-available.component.html',
  styleUrls: ['./no-room-available.component.scss']
})
export class NoRoomAvailableComponent implements OnInit {

  constructor() { }

  @Input() roomData: VirtualEventRoomModel
  resourceLoading: boolean = true;
  @Input() isBoothNotAvailable: boolean = false;

  ngOnInit(): void {
    setTimeout(() => {
      this.resourceLoading = false;
    }, 5000)
  }

}
