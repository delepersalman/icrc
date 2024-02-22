import { Pipe, PipeTransform } from '@angular/core';
import { MemberAttributes } from '../../models/rtm.model';
import { EnumerationUserRole, UserRole } from '../../models/virtualevent.user.model';
@Pipe({
  name: 'member_role'
})
export class MemberRoleFilterPipe implements PipeTransform {

  transform(value: MemberAttributes[], args: UserRole): any {
    if (!args) {
      return value;
    }
    return value.filter((val) => { return (val.VirtualEventUserRoles.find(x=> EnumerationUserRole[x.VirtualEventRoleId] == args) != null) });
  }
}
