import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { DialogUserIdleData } from '../../models/common.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'fireworks-user-idle-dialog',
  templateUrl: './user-idle-dialog.component.html',
  styleUrls: ['./user-idle-dialog.component.scss']
})
export class UserIdleDialogComponent implements OnInit, OnDestroy {

  countDown: Subscription;
  counter = 120;
  counterDisplay: string;
  tick = 1000;
  showOkButton = true;

  constructor(
    public dialogRef: MatDialogRef<UserIdleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogUserIdleData) {
  }

  ngOnInit(): void {

    this.countDown = timer(0, this.tick).subscribe(() => {
      if (this.counter <= 1) {
        this.counterDisplay = 'Your session has ended.';
        this.countDown.unsubscribe();
        this.showOkButton = false;
        window.location.reload();
        return;
      }

      --this.counter;

      if (this.counter > 60) {
        this.counterDisplay = `<p>Your session will end in 2 minutes.</p>`;
      } else {
        this.counterDisplay = `<p> Your session is going to end in ${this.counter} sec.</p>`;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.countDown) {
      this.countDown.unsubscribe();
    }
  }

  cancel(): void {
    this.dialogData.DialogAction = 'cancel';
    this.dialogRef.close(this.dialogData);
  }

  confirm(): void {
    this.dialogData.DialogAction = 'confirm';
    this.dialogRef.close(this.dialogData);
  }

  refresh(): void {
    window.location.reload();
  }
}
