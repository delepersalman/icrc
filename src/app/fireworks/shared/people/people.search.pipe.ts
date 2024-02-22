import { Pipe, PipeTransform } from '@angular/core';
import { MemberAttributes } from '../../models/rtm.model';
@Pipe({
  name: 'people_search'
})
export class PeopleSearchPipe implements PipeTransform {

  transform(value: MemberAttributes[], args?: any): any {
    if (!args) {
      return value;
    }
    args = args.toLowerCase();
    return value.filter((val) => {
      let rVal = (val.FirstName.toLowerCase().includes(args)) || (val.LastName.toLowerCase().includes(args));
      return rVal;
    });
  }
}

@Pipe({
  name: 'filterStatus'
})
export class FilterStatusPipe implements PipeTransform {

  transform(members: MemberAttributes[], status: string): any {
    if (status != 'All') {
      return members.filter(a => (status == 'online' ? a.Online : !a.Online));
    } else {
      return members;
    }
  }
}