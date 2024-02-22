// tslint:disable: triple-equals
// tslint:disable: typedef
import { Component, EventEmitter, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CalendarPipe, FromUnixPipe, TimeAgoPipe } from 'ngx-moment';
import {
  MemberAttributes
} from 'src/app/fireworks/models/rtm.model';
import { EnumerationFeatures, EnumerationUserRole } from 'src/app/fireworks/models/virtualevent.user.model';
import { MediaInfoService } from 'src/app/fireworks/services/media-info-service';
import { SharedFireworksComponentService } from 'src/app/fireworks/services/shared.service';
import { VirtualEventService } from 'src/app/fireworks/services/virtualevent.service';
import { MessageService } from 'src/app/shared/services/message.service';
import { environment } from 'src/environments/environment';
import { AttendeeAction } from '../../../constants/fireworks-constants';


@Component({
  // tslint:disable-next-line: component-selector
  selector: 'event-attendee-info',
  templateUrl: './attendee-info.component.html',
  styleUrls: ['./attendee-info.component.scss']
})
export class AttendeeInfoComponent implements OnInit {
  @Input() member: MemberAttributes;

  @Output() onMemberAction: EventEmitter<any> = new EventEmitter<any>();

  @Input() gridView: boolean = false;
  @Input() privateMesseges: [];
  enumerationFeatures: any = EnumerationFeatures;
  enumerationUserRole: any = EnumerationUserRole;
  constructor(
    public router: Router,
    public dialog: MatDialog,
    public sharedService: SharedFireworksComponentService,
    public virtualEventService: VirtualEventService,
    public messageService: MessageService,
    public amTimeAgo: TimeAgoPipe,
    public amCalendar: CalendarPipe,
    public amFromUnix: FromUnixPipe,
    public renderer: Renderer2,
    public mediaInfoService: MediaInfoService
  ) {
  }

  ngAfterViewInit() { }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.onMemberAction.complete();
  }


  openPrivateChatWindow(memberData: MemberAttributes): void {
    this.onMemberAction.emit({ type: AttendeeAction.OpenChat, data: memberData });
  }

  showHideOnDisplay(member: MemberAttributes): void {
    this.sharedService.changeUserRole(member.VirtualEventUserId);
  }

  manageUserRole(member: MemberAttributes, isEnabled: boolean, enumUserRole: EnumerationUserRole, action: number): void {
    var userData = {
      member: member,
      isEnabled: isEnabled,
      enumUserRole: enumUserRole,
      action: action
    }
    this.onMemberAction.emit({ type: AttendeeAction.RoleChange, data: userData });
  }

  toggleDisplayattendeeInfoOverlay(attendee: any): void {
    this.onMemberAction.emit({ type: AttendeeAction.AttendeeInfo, data: attendee });
  }


  blockUser(member: MemberAttributes) {
    this.onMemberAction.emit({ type: AttendeeAction.BlockUser, data: member });
  }

  unblockUser(member: MemberAttributes) {
    this.onMemberAction.emit({ type: AttendeeAction.UnBlockUser, data: member });
  }

  sendVideoCallLink(member: MemberAttributes): void {
    this.onMemberAction.emit({ type: AttendeeAction.InviteMember, data: member });
  }

  haveUnreadMessage(virtualEventUserId: any): boolean {
    if (this.privateMesseges)
      return this.privateMesseges.find(x => x == virtualEventUserId) != undefined;
    else
      return false;
  }

  openProfileView(virtualEventUserId: string) {
    let url = this.sharedService.domainUrl + '/public/profile/' + btoa(virtualEventUserId);
    window.open(url, "_blank");
  }

  getProfileViewUrl(virtualEventUserId: string): string {
    let url = this.sharedService.domainUrl + '/public/profile/' + btoa(virtualEventUserId);
    return url;
  }
}
