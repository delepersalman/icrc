import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ngStyleModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { CustomSectionComponent } from '../custom-section/custom-section.component';
import { EditButtonLabelComponent } from '../edit-button-label/edit-button-label.component';
import { ConfirmDialogComponent } from 'src/app/fireworks/shared/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogComponentData } from 'src/app/fireworks/models/common.model';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AddAnchorLinkComponent } from '../add-anchor-link/add-anchor-link.component';
import { ECImageViewModel } from 'src/app/shared/models/ec-image-model';
import { TicketSettingModalComponent } from '../../ticket-setting-modal/ticket-setting-modal.component';
import { ViewEventService } from '../../service/view-event.service';

@Component({
  selector: 'button-designer-toolbar',
  templateUrl: './button-designer-toolbar.component.html',
  styleUrls: ['./button-designer-toolbar.component.scss']
})
export class ButtonDesignerToolbarComponent implements OnInit {

  @Input() ngStyle: ngStyleModel;
  @Output() eventTextFormatAlignment : EventEmitter<any> = new EventEmitter<any>();
  btnBgColor: string;
  textBtnColor: string;
  btnHoverColor: string;
  destroy$ = new Subject();
  fontSize: number;
  fontStyle: string = '';
  numbers: any = [8, 10, 12, 14, 16, 18, 20, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50];
  checkBgColor: string;
  constructor(private globalService: GlobalService, private dialog: MatDialog, private _viewEventService: ViewEventService) { }
  onBgColor(ChangeType) {
    if(this.ngStyle && (this.btnBgColor && (this.ngStyle.bgColor !== this.btnBgColor) || (this.checkBgColor && this.ngStyle.CheckoutBGColor !== this.checkBgColor))){
      if (ChangeType === this.ngStyle.PropertyName+'_BGColor')
      {
        if('TicketCheckoutBox_BGColor' === ChangeType){
        this.ngStyle.CheckoutBGColor = this.checkBgColor;
        } else
        this.ngStyle.bgColor = this.checkBgColor;
      }
      else
        this.ngStyle.bgColor = this.btnBgColor;

      this.eventTextFormatAlignment.emit(this.ngStyle);
    }
  }
  onTextColor() {
    if(this.textBtnColor && this.ngStyle.textColor !== this.textBtnColor){
    this.ngStyle.textColor = this.textBtnColor;
    this.eventTextFormatAlignment.emit(this.ngStyle);
    }
  }
  onHoverColor() {
    if(this.btnHoverColor && this.ngStyle.HoverColor !== this.btnHoverColor){
    this.ngStyle.HoverColor = this.btnHoverColor;
    this.eventTextFormatAlignment.emit(this.ngStyle);
    }
  }
  ngOnInit(): void {
    if(this.ngStyle){
      this.ngStyle.ChangeType = "";
     this.btnBgColor= this.ngStyle.bgColor;
     this.textBtnColor= this.ngStyle.textColor;
     if('TicketCheckoutBox_BGColor' ===  this.ngStyle.PropertyName+"_BGColor"){
      this.checkBgColor = this.ngStyle.CheckoutBGColor;
      } else
      this.checkBgColor = this.ngStyle.bgColor ;
     this.btnHoverColor= this.ngStyle.HoverColor;
    }
      this.fontSize = this.ngStyle.FontSize;
      this.fontStyle = this.ngStyle.FontStyle==undefined?'':this.ngStyle.FontStyle;
  }
  
  onTextFormatAlignment() {
    this.eventTextFormatAlignment.emit(this.ngStyle);
  }
  openDialogAddNewPage(eventId) {
    const dialogRef = this.dialog.open(EditButtonLabelComponent, {
      data: {data:this.ngStyle.CustomName,
      SectionName: this.ngStyle.SectionName
      }
    });
    dialogRef.componentInstance.updateLabelText.subscribe(t=>{
       this.ngStyle.CustomName = t;
       this.eventTextFormatAlignment.emit(this.ngStyle);
        dialogRef.close();

  });
}
openDialogToAddLink(eventId) {
  const dialogRef = this.dialog.open(AddAnchorLinkComponent, {
    data:this.ngStyle.AnchorLink
  });
  dialogRef.componentInstance.updateLabelText.subscribe(t=>{
     this.ngStyle.AnchorLink = t;
     this.eventTextFormatAlignment.emit(this.ngStyle);
      dialogRef.close();
});
}
onTextFormatWeight() {
  if (this.ngStyle.FontWeight === 'bold') {
    this.ngStyle.FontWeight = "normal";
  } else {
    this.ngStyle.FontWeight = "bold";
  }
  this.eventTextFormatAlignment.emit(this.ngStyle);
}
onFontChange() {
  if (this.fontSize && this.fontSize !== this.ngStyle.FontSize) {
    this.ngStyle.FontSize = this.fontSize;
    this.eventTextFormatAlignment.emit(this.ngStyle);
  }
}
onFontStyleChange() {
  if(this.fontStyle && this.fontStyle !== this.ngStyle.FontStyle){
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


onFileChange(event) {
  if (event.target.files && event.target.files.length) {
    let files = event.target.files;
    var fd = new FormData();
    for (let file of files) {
      if (this.validateImage(file)) {
        fd.append('files', file);
        this.globalService.uploadImages(fd).subscribe((res: ECImageViewModel[]) => {
          if (res) {
            this.ngStyle.BGImage = res[0];
            this.btnBgColor = "";
          }
          this.ngStyle.ChangeType = "BTNBGImage";
          this.eventTextFormatAlignment.emit(this.ngStyle);
        })
      }
    }
  }
}
resetBG() {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    data: {
      Title: 'Please confirm',
      Message: 'Are you sure you want to reset your settings?',
      CancelText: 'No',
      OkText: 'Yes'
    } as ConfirmDialogComponentData
  });

  dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
    if (result) {
      this.ngStyle.BGImage = null;
      this.ngStyle.bgColor = "";
      this.ngStyle.textBtnColor = "";
      this.ngStyle.ChangeType = "Reset";
      this.eventTextFormatAlignment.emit(this.ngStyle);
    }
  })
}
validateImage(file): boolean {
  var ValidImageTypes = ["image/gif", "image/jpeg", "image/png"];
  if (ValidImageTypes.indexOf(file.type) > -1) {
    if (file.size <= 4 * 1024 * 1024)
      return true;
    else {
      alert("Sorry, your image is over 4MB, please try an image under 4MB");
    }
  } else {
    alert("Uploaded file is not an image!")
  }
  return false;
};
openDialogPageSettings(TicketId) {
  let page: any;
  const dialogRef = this.dialog.open(TicketSettingModalComponent, {
    data: {
      data: TicketId,
      eventWebsiteDetail: this.ngStyle.websiteDetails,
      Type: 'TicketBox',
      ModuleName: this.ngStyle.SectionName
    },
    width: '800px'
  });
  dialogRef.componentInstance.outputEvent.subscribe(t => {
    if (t){
      this.ngStyle.FieldId = TicketId
      this._viewEventService.getEventWebsiteDetail(this.ngStyle.websiteDetails.Event.EventId);
    dialogRef.close();
    }
  });
  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      page.eventWebsiteDetail = {};
     // this.getWebsitedetails();
    }
  });
}
}
