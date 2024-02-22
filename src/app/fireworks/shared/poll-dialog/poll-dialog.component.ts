import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VirtualEventService } from '../../services/virtualevent.service';
import { SharedFireworksComponentService } from '../../services/shared.service';
import * as moment from 'moment';
import { Subscription, interval } from 'rxjs';


@Component({
  selector: 'fireworks-poll-dialog',
  templateUrl: './poll-dialog.component.html',
  styleUrls: ['./poll-dialog.component.scss']
})
export class PollDialogComponent implements OnInit, OnDestroy {
  constructor(
    public dialogRef: MatDialogRef<PollDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public virtualEventService: VirtualEventService,
    public sharedService: SharedFireworksComponentService) {

   }

  public userAnswerSelected = this.data.Answers[0].Answer;
  public PollAnswerSaveResponse: any;

  public model = {
    VirtualEventPollId: this.data.VirtualEventPollId,
    VirtualEventRoomId: this.data.VirtualEventRoomId,
    PollQuestion: this.data.Question,
    VirtualEventUserId: this.data.VirtualEventUserId,
    UserAnswerSelected: this.userAnswerSelected,
    UpdatedDateUtc: this.data.UpdatedDateUtc,
    PushResult: false,
  };
  private subscription: Subscription;
  public dateNow = new Date();
  public dDay: Date = new Date(moment.utc(this.data.ExpiryDate).local().format());
  milliSecondsInASecond = 1000;
  hoursInADay = 24;
  minutesInAnHour = 60;
  SecondsInAMinute = 60;

  public timeDifference;
  public secondsToDday;
  public minutesToDday;
  public hoursToDday;
  public daysToDday;

  private getTimeDifference() {
    this.timeDifference = this.dDay.getTime() - new Date().getTime();
    this.allocateTimeUnits(this.timeDifference);
  }

  private allocateTimeUnits(timeDifference) {
    this.secondsToDday = Math.floor((timeDifference) / (this.milliSecondsInASecond) % this.SecondsInAMinute);
    this.minutesToDday = Math.floor((timeDifference) / (this.milliSecondsInASecond * this.minutesInAnHour) % this.SecondsInAMinute);
    this.hoursToDday = Math.floor((timeDifference) / (this.milliSecondsInASecond * this.minutesInAnHour * this.SecondsInAMinute) % this.hoursInADay);
    this.daysToDday = Math.floor((timeDifference) / (this.milliSecondsInASecond * this.minutesInAnHour * this.SecondsInAMinute * this.hoursInADay));
  }

  ngOnInit() {
    if (!this.data.PushResult) {
      this.subscription = interval(1000)
        .subscribe(x => {
          if ((new Date()) >= this.dDay) {
            if (this.data.IsRequired) {
              this.subscription.unsubscribe();
            } else {
              if (this.PollAnswerSaveResponse) {
                this.subscription.unsubscribe();
              } else {
                this.dialogClose();
              }
            }
          } else {
            this.getTimeDifference();
          }
        });
    } else {
      this.model.PushResult = true;
      this.virtualEventService.savePollUserAnswer(this.model).subscribe(d => {
        if (d && d.Data) {
          if (this.data.DisplayResultToAttendees) {
            this.PollAnswerSaveResponse = d.Data;
            this.data.IsRequired = false;
          }
          else {
            this.dialogClose();
          }
        }
      });
    }
  }

  ngOnDestroy() {
    if (!this.data.PushResult) {
      this.subscription.unsubscribe();
    }
  }

  submitPollAnswer(): any {
    this.model.VirtualEventPollId = this.data.VirtualEventPollId;
    this.model.VirtualEventRoomId = this.data.RoomId;
    this.model.PollQuestion = this.data.Question;
    this.model.VirtualEventUserId = this.sharedService.virtualEventUser.VirtualEventUserId;
    this.model.UserAnswerSelected = this.userAnswerSelected;
    this.model.UpdatedDateUtc = this.data.UpdatedDateUtc;
    this.model.PushResult = false;

    this.virtualEventService.savePollUserAnswer(this.model).subscribe(d => {

      if (d && d.Data) {
        if (this.data.DisplayResultToAttendees) {
          this.PollAnswerSaveResponse = d.Data;
          this.data.IsRequired = false;
        }
        else {
          this.dialogClose();
        }
      }
    });
  }

  dialogClose(): void {
    this.dialogRef.close();
  }
}
