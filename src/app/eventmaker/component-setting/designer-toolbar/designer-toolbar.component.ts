import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ngStyleModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EditButtonLabelComponent } from '../edit-button-label/edit-button-label.component';
import { EditEventFormatModelComponent } from '../edit-event-format-model/edit-event-format-model.component';
import { ConfirmDialogComponentData } from 'src/app/fireworks/models/common.model';
import { takeUntil } from 'rxjs/operators';
import { ConfirmDialogComponent } from 'src/app/fireworks/shared/confirm-dialog/confirm-dialog.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'designer-toolbar',
  templateUrl: './designer-toolbar.component.html',
  styleUrls: ['./designer-toolbar.component.scss'],
  animations: [
    trigger('expand', [
      state('in', style({ height: '*' })),
      transition(':leave', [
        style({ height: '*' }),
        animate(250, style({ height: 0 }))
      ]),
      transition(':enter', [
        style({ height: 0 }),
        animate(250, style({ height: '*' }))
      ])
    ])
  ],
  host: { '[@expand]': 'in' }
})
export class DesignerToolbarComponent implements OnInit {
  @Input() ngStyle: ngStyleModel;
  @Output() eventTextFormatAlignment: EventEmitter<any> = new EventEmitter<any>();
  destroy$ = new Subject();
  fontSize: number;
  fontStyle: string = '';
  numbers: any = [8, 10, 12, 14, 16, 18, 20, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50];
  constructor(private dialog: MatDialog) {

  }

  onTextFormatAlignment() {
    this.eventTextFormatAlignment.emit(this.ngStyle);
  }
  onTextFormatWeight() {
    if (this.ngStyle.FontWeight === 'bold') {
      this.ngStyle.FontWeight = "normal";
    } else {
      this.ngStyle.FontWeight = "bold";
    }
    this.eventTextFormatAlignment.emit(this.ngStyle);
  }
  onTextColor() {
    if (this.ngStyle.textColor)
      this.eventTextFormatAlignment.emit(this.ngStyle);
  }

  onBgColor() {
    if (this.ngStyle.bgColor)
      this.eventTextFormatAlignment.emit(this.ngStyle);
  }
  onFontChange() {
    if (this.fontSize && this.fontSize !== this.ngStyle.FontSize) {
      this.ngStyle.FontSize = this.fontSize;
      this.eventTextFormatAlignment.emit(this.ngStyle);
    }
  }
  onFontStyleChange() {
    if (this.fontStyle && this.fontStyle !== this.ngStyle.FontStyle) {
      this.ngStyle.FontStyle = this.fontStyle;
      this.eventTextFormatAlignment.emit(this.ngStyle);
    }

  }
  onItalicColor() {

    if (this.ngStyle.TextFormat === 'italic') {
      this.ngStyle.TextFormat = "normal";
    } else {
      this.ngStyle.TextFormat = "italic";
    }

    this.eventTextFormatAlignment.emit(this.ngStyle);
  }
  onUnderlineColor() {
    if (this.ngStyle.TextDecoration === 'underline') {
      this.ngStyle.TextDecoration = "none";
    } else {
      this.ngStyle.TextDecoration = "underline";
    }
    this.eventTextFormatAlignment.emit(this.ngStyle);
  }
  openDialogAddNewPage(eventId) {
    const dialogRef = this.dialog.open(EditButtonLabelComponent, {
      data: this.ngStyle.CustomName
    });
    dialogRef.componentInstance.updateLabelText.subscribe(t => {
      this.ngStyle.CustomName = t;
      this.eventTextFormatAlignment.emit(this.ngStyle);
      dialogRef.close();

    });

  }
  openDialogEventFormat(eventId) {
    const dialogRef = this.dialog.open(EditEventFormatModelComponent, {
      data: this.ngStyle.CustomDateFormat
    });
    dialogRef.componentInstance.updateLabelText.subscribe(t => {
      this.ngStyle.CustomDateFormat = t;
      this.eventTextFormatAlignment.emit(this.ngStyle);
      dialogRef.close();

    });
  }
  resetBG() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        Title: 'Please confirm',
        Message: 'Are you sure you want to reset your current field designs?',
        CancelText: 'No',
        OkText: 'Yes'
      } as ConfirmDialogComponentData
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        this.ngStyle.ChangeType = "Reset";
        this.ngStyle.FontSize = 0;
        this.ngStyle.FontStyle = '';
        this.eventTextFormatAlignment.emit(this.ngStyle);
      }
    })
  }
  ngOnInit(): void {
    if (this.ngStyle)
      this.ngStyle.ChangeType = "";
    this.fontSize = this.ngStyle.FontSize;
    this.fontStyle = this.ngStyle.FontStyle == undefined ? '' : this.ngStyle.FontStyle;
  }

}
