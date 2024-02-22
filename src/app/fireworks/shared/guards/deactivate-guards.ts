import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { SharedFireworksComponentService } from '../../services/shared.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { RoomBaseComponent } from '../roombase.component'
import { ConfirmDialogComponentData, EnumerationTrackingActivityType } from '../../models/common.model';
import { RoomType, VideoSource } from '../../models/virtualevent.room.model';
import { VirtualEventService } from '../../services/virtualevent.service';

@Injectable()
export class DeactivateGuard implements CanDeactivate<RoomBaseComponent> {
  constructor(private sharedService: SharedFireworksComponentService, public dialog: MatDialog, public virtualEventService: VirtualEventService) { }
  canDeactivate(component: RoomBaseComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState: any): Observable<boolean> | boolean {
    if (this.sharedService.roomClientConnected) {
      const subject = new Subject<boolean>();
      let dialogRef: MatDialogRef<ConfirmDialogComponent, any>;
      if (this.sharedService.virtualEventUser.VirtualEvent.EnableRoomJumping && (component.roomData.RoomType != RoomType.Breakout
        || this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser))) {
        dialogRef = this.dialog.open(ConfirmDialogComponent, {
          data: {
            Title: 'Please confirm',
            Message: 'Are you sure you want to leave?',
            CancelText: 'No, stay',
            OkText: 'Yes'
          } as ConfirmDialogComponentData
        });
      } else if (component.roomData.RoomType == RoomType.Breakout && !this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)) {
        dialogRef = this.dialog.open(ConfirmDialogComponent, {
          data: {
            Title: 'Alert',
            Message: 'You cannot leave breakout room.',
            CancelText: 'OK'
          } as ConfirmDialogComponentData
        });
      }
      else {
        dialogRef = this.dialog.open(ConfirmDialogComponent, {
          data: {
            Title: 'Please confirm',
            Message: 'Do you want to leave this room and join another room?',
            CancelText: 'No, stay',
            OkText: 'Yes, leave'
          }
        });
        this.sharedService.autoJoin = false;
      }
      dialogRef.afterClosed().toPromise().then((result: boolean) => {
        subject.next(result);
        subject.complete();
        try {
          if (result) {
            this.dialog.closeAll();
            this.sharedService.saveFireworksActivity(this.sharedService.currentRoomData.VirtualEventRoomId,
              this.sharedService.virtualEventUser.VirtualEventUserId, EnumerationTrackingActivityType.LeaveFireworksRoom, this.sharedService.currentRoomData.RoomType);
          }
        } catch (e) {
        }
      });
      return subject.asObservable();
    } else if (!this.sharedService.roomClientConnected && this.sharedService.currentRoomData && this.sharedService.currentRoomData.VideoSource != VideoSource.Eventcombo) {
      this.sharedService.saveFireworksActivity(this.sharedService.currentRoomData.VirtualEventRoomId,
        this.sharedService.virtualEventUser.VirtualEventUserId, EnumerationTrackingActivityType.LeaveFireworksRoom, this.sharedService.currentRoomData.RoomType);
      return true;
    } else {
      return true;
    }
  }
}
