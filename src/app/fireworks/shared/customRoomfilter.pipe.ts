import { VirtualEventRoomModel } from './../models/virtualevent.room.model';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customRoomfilter',
  pure: false
})
export class CustomRoomfilterPipe implements PipeTransform {

  transform(Rooms: VirtualEventRoomModel[], filter: any): any {
    if (!Rooms || !filter) {
      return Rooms;
    }
    return Rooms.filter(r => r.RoomType.indexOf(filter.roomType) !== -1);
  }

}
