import { Pipe, PipeTransform } from '@angular/core';
import { EnumerationUserRole } from 'src/app/fireworks/models/virtualevent.user.model';
import { SharedFireworksComponentService } from 'src/app/fireworks/services/shared.service';
import { MemberAttributes } from '../../fireworks/models/rtm.model';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {
  public transform(value, keys: string, term: string) {
    if (!term) return value;
    return (value || []).filter(item => keys.split(',').some(key => item.hasOwnProperty(key) && new RegExp(term, 'gi').test(item[key])));
  }
}



@Pipe({
  name: 'orderBy',
  pure: true
})
export class OrderByPipe implements PipeTransform {
  transform(array: any, field: string): any[] {
    if (!Array.isArray(array)) {
      return;
    }

    array.sort((a: any, b: any) => {
      if (a[field].toLowerCase() < b[field].toLowerCase()) {
        return -1;
      } else if (a[field].toLowerCase() > b[field].toLowerCase()) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }
}



@Pipe({
  name: 'meFirst'
})
export class MyselfFirstPipe implements PipeTransform {
  public transform(array, virtualEventUserId: string) {

    if (!array)
      return array;

    if (!virtualEventUserId) return array;

    let myself = array.find(x => x.VirtualEventUserId == virtualEventUserId);

    if (!myself) return array;

    var myData = array.splice(array.indexOf(myself), 1)[0];
    array.unshift(myData);

    return array;
  }
}


@Pipe({
  name: 'filterAttendee'
})
export class filterAttendeePipe implements PipeTransform {
  constructor(public sharedService: SharedFireworksComponentService) {

  }
  public transform(attendees: any, role: string) {
    if (!attendees)
      return attendees;
    var filteredAttendees = [];
    if (role == 'host') {
      filteredAttendees = attendees.filter((x: any) => this.sharedService.isHostOrCoHost(x));
    } else if (role == 'presenter') {
      filteredAttendees = attendees.filter((x: any) => this.sharedService.checkUserRole(EnumerationUserRole.Presenter, x) && !this.sharedService.isHostOrCoHost(x));
    } else {
      filteredAttendees = attendees.filter((x: any) => this.sharedService.checkUserRole(EnumerationUserRole.Attendee, x) && !this.sharedService.isHostOrCoHost(x));
    }
    return filteredAttendees;
  }
}

