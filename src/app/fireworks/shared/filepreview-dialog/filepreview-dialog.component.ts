import { Component, OnInit, Inject } from '@angular/core';
import { HandoutsDocumentPreviewDialogData } from '../../models/handouts.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'file-preview-dialog',
  templateUrl: './filepreview-dialog.component.html',
  styleUrls: ['./filepreview-dialog.component.scss']
})
export class HandoutsDocuementPreviewDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<HandoutsDocuementPreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: HandoutsDocumentPreviewDialogData) {
  }


  ngOnInit() {
    console.log('The great dialog data', this.dialogData);
  }


  cancel(): void {
    this.dialogData.DialogAction = 'cancel';
    this.dialogRef.close(this.dialogData);
  }

  confirm(): void {
    this.dialogData.DialogAction = 'confirm';
    this.dialogRef.close(this.dialogData)
  }
}
