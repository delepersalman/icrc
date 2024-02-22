import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { UserIdleService } from 'angular-user-idle';
import { CalendarPipe } from 'ngx-moment';
import { MessageService } from '../../shared/services/message.service';
import { MemberAttributes } from '../models/rtm.model';
import { RoomType, VirtualEventPrivateRoomModel, VirtualEventRoomModel } from '../models/virtualevent.room.model';
import { SharedFireworksComponentService } from '../services/shared.service';
import { VirtualEventService } from '../services/virtualevent.service';
import { RoomBaseComponent } from '../shared/roombase.component';
import { takeUntil } from 'rxjs/operators';
import { ThemingService } from '../shared/_theme/theme.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'fireworks-privateroom',
  templateUrl: './privateroom.component.html',
  styleUrls: ['./privateroom.component.scss']
})

export class PrivateRoomComponent extends RoomBaseComponent implements OnInit {
  roomMembers: MemberAttributes[] = [];
  token: string = '';
  constructor(
    public route: ActivatedRoute,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public titleService: Title,
    public sharedService: SharedFireworksComponentService,
    public virtualEventService: VirtualEventService,
    public messageService: MessageService,
    public amCalendar: CalendarPipe,
    public userIdle: UserIdleService,
    public router: Router,
    public themeService: ThemingService
  ) {
    super(dialog, sharedService, messageService, virtualEventService, router, themeService);

    this.route.queryParams.pipe(takeUntil(this.unsubscribeAll)).subscribe(params => {
      if (params.token != this.token && this.token != '') {
        window.location.reload();
      }
    });
  }

  ngOnInit() {
    try {
      this.route.queryParams.subscribe(params => {
        this.token = params.token;
        if (this.token) {
          this.titleService.setTitle('Eventcombo Fireworks - ' + RoomType.PrivateRoom);
          if (this.validatePermissionAndInitializeData()) {
            if (this.sharedService.virtualEventUser && this.sharedService.virtualEventUser.VirtualEvent) {
              this.virtualEventService.getPrivateRoomDetail(this.sharedService.virtualEventUser.VirtualEvent.EventId, this.token)
                .pipe(takeUntil(this.unsubscribeAll)).subscribe(rd => {

                  this.resourcesLoading = false;

                  if (rd && rd.Data) {
                    const roomData = {
                      VirtualEventRoomId: rd.Data.VirtualEventPrivateRoomId,
                      AllowGroupChat: true,
                      AllowGuestInvite: rd.Data.AllowGuestInvite,
                      AllowHandouts: rd.Data.AllowHandouts,
                      AllowOneToOneNetworking: true,
                      AllowPollsAndSurvey: rd.Data.AllowPollsAndSurvey,
                      AllowPrivateChat: true,
                      AllowRecording: rd.Data.AllowRecording,
                      RoomName: rd.Data.RoomName,
                      StreamId: rd.Data.StreamId,
                      RoomType: RoomType.PrivateRoom,
                      MediaType: 'video',
                      VideoSource: 'eventcombo'
                    } as VirtualEventRoomModel;

                    this.roomData = roomData;
                    document.documentElement.style.setProperty('--theme-color',
                      this.roomData.BoardBackgroundColor ? this.roomData.BoardBackgroundColor
                        : this.sharedService.virtualEventUser.VirtualEvent.BoardBackgroundColor);

                    this.resourcesLoading = false;
                    this.sharedService.setRoomChannelName(this.roomData);
                    this.sharedService.setRoomData(this.roomData);
                  }
                }, error => {
                  this.userAllowed = false;
                });
            }
            else {
              this.messageService.showErrorMessage('Sorry! An error occurred while loading event infomration.');
            }
          }
        }
      });
    } catch (e) {

    }
  }

  addRoomAndSendVideoChatGroupInvite(member: MemberAttributes): void {

    if (member.VirtualEventUserId === this.sharedService.virtualEventUser.VirtualEventUserId.toString()) {
      return;
    }

    if (!this.rtmClient) {
      return;
    }

    if (member.IsBlocked && member.AllowUnblock) {
      // It means it is blocked by me
      this.messageService.showErrorMessage('You cannot send invite as this user is blocked!');
      return;
    }

    // If member already connected then skip
    if (this.roomMembers.filter(m => m.VirtualEventUserId === member.VirtualEventUserId).length > 0) {
      this.messageService.showSuccessMessage('User already connected!');
      return;
    }

    // Create or update a private room and save in database
    const privateRoomData = {
      VirtualEventUserId: this.sharedService.virtualEventUser.VirtualEventUserId,
      VirtualEventId: this.sharedService.virtualEventUser.VirtualEvent.VirtualEventId,
      ParticipantIds: member.VirtualEventUserId,
      StreamId: this.roomData.StreamId,
      RoomName: 'privateroom',
      AllowGuestInvite: true,
      AllowHandouts: true,
      AllowPollsAndSurvey: true,
      AllowRecording: true
    } as VirtualEventPrivateRoomModel;

    this.virtualEventService.addUpdateUserToPrivateRoom(privateRoomData).subscribe(d => {

      if (d && d.Data) {
        // this.sendVideoChatGroupInvite(member);
      }
    });
  }

}
