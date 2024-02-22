import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfirmDialogComponentData } from 'src/app/fireworks/models/common.model';
import { ConfirmDialogComponent } from 'src/app/fireworks/shared/confirm-dialog/confirm-dialog.component';
import { ECImageViewModel } from 'src/app/shared/models/ec-image-model';
import { ngStyleModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'section-designer-toolbar',
  templateUrl: './section-designer-toolbar.component.html',
  styleUrls: ['./section-designer-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionDesignerToolbarComponent implements OnInit {
  @Input() ngStyle: ngStyleModel;
  @Output() eventTextFormatAlignment: EventEmitter<any> = new EventEmitter<any>();
  sectionBgColor: string;
  bgColor: string;
  textColor: string;
  destroy$ = new Subject();
  onPaddingOptionStatus:boolean;
  onBorderOptionStatus : boolean;
  paddingIdTop : any = 0;
  paddingIdRight : any = 0;
  paddingIdLeft : any = 0;
  paddingIdBottom : any = 0;
  sectionPadding: string;
  sectionBorder: string;
  border: string;
  borderPixel: number = 0;
  borderColor: string = "black";
  count = 1;
  constructor(private globalService: GlobalService, private dialog: MatDialog) { }

  onFileChange(event, ChangeType) {
    if (event.target.files && event.target.files.length) {
      let files = event.target.files;
      var fd = new FormData();
      for (let file of files) {
        if (this.validateImage(file)) {
          fd.append('files', file);
          this.globalService.uploadImages(fd).subscribe((res: ECImageViewModel[]) => {
            if (res) {
              this.ngStyle.BGImage = res[0];
              this.ngStyle.bgColor = "";
           //   this.sectionBgColor = "";
            }
            this.ngStyle.ChangeType = ChangeType;
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
        Message: 'Are you sure you want to reset your background?',
        CancelText: 'No',
        OkText: 'Yes'
      } as ConfirmDialogComponentData
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
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
  onBgColor() {
    this.ngStyle.BGImage = null;
    if (this.bgColor !== this.ngStyle.bgColor) {
      this.ngStyle.bgColor = this.bgColor;
      this.ngStyle.ChangeType = "BGColor";
      this.ngStyle.PropertyName = "";
      this.eventTextFormatAlignment.emit(this.ngStyle);
    }
  }
  saveBorder() {
    this.sectionBorder = `${this.borderPixel}px ${this.border} ${this.borderColor}`
    if (this.sectionBorder !== this.ngStyle.SectionBorder) {
      this.ngStyle.SectionBorder =this.sectionBorder;
      this.ngStyle.ChangeType = "SectionBorder";
      this.eventTextFormatAlignment.emit(this.ngStyle);
      this.onBorderOptionStatus = false;
    }
  }
  applyBorder(value){
    this.border = value;
  }
  resetPadding() {
    this.ngStyle.SectionPadding = "";
    this.ngStyle.ChangeType = "SectionPadding";
    this.eventTextFormatAlignment.emit(this.ngStyle);
    this.paddingIdBottom = 0;
    this.paddingIdTop = 0;
    this.paddingIdLeft = 0;
    this.paddingIdRight = 0;
    this.onPaddingOptionStatus = false;
  }
  onTextColor(){
    if (this.textColor !== this.ngStyle.sectionTextColor) {
      this.ngStyle.sectionTextColor = this.textColor;
      this.ngStyle.ChangeType = "TextColor";
      this.ngStyle.PropertyName = "";
      this.eventTextFormatAlignment.emit(this.ngStyle);
    }
  }
  savePadding() {
    this.ngStyle.SectionPadding = `${this.paddingIdTop?this.paddingIdTop:'0'}px ${this.paddingIdRight?this.paddingIdRight:'0'}px ${this.paddingIdBottom?this.paddingIdBottom:'0'}px ${this.paddingIdLeft?this.paddingIdLeft:'0'}px`;
    if (this. sectionPadding !== this.ngStyle.SectionPadding){    
    this.ngStyle.ChangeType = "SectionPadding";
      this.eventTextFormatAlignment.emit(this.ngStyle);
      this.onPaddingOptionStatus = false;
    }
  }
  ngOnInit(): void {
    this.onPaddingOptionStatus = false;
    this.onBorderOptionStatus = false;
    this.bgColor = this.ngStyle.bgColor;
    this.textColor = this.ngStyle.sectionTextColor;
    if(this.ngStyle.SectionBorder){
      this.splitBorder(this.ngStyle.SectionBorder);
    }
    if(this.ngStyle.SectionPadding){
      this.splitPadding(this.ngStyle.SectionPadding);
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(!changes.ngStyle.firstChange) {
    this.bgColor = this.ngStyle.bgColor;
    this.textColor = this.ngStyle.sectionTextColor;
    if(this.ngStyle.SectionBorder){
      this.splitBorder(this.ngStyle.SectionBorder);
    }
    if(this.ngStyle.SectionPadding){
      this.splitPadding(this.ngStyle.SectionPadding);
    }
    if(document.getElementById('imageId'))
    document.getElementById('imageId').nodeValue = ""
    }
  }

  onPaddingOptions(event){
    this.onBorderOptionStatus =false;
    this.onPaddingOptionStatus = !this.onPaddingOptionStatus;
  }
  onBorderOptions(event){
    this.onPaddingOptionStatus =false;
    this.onBorderOptionStatus = !this.onBorderOptionStatus;
  }
  splitBorder(border){
    let borderItems = border.split(' ');
    for (let index = 0; index < borderItems.length; index++) {
      if(index === 0){
      this.borderPixel = parseInt(borderItems[index].split(' ')[0].replace(/px/g, ''));
      }
      else if(index === 1)
      this.border = borderItems[index];
      else if(index === 2)
      this.borderColor = borderItems[index];
    }
  }
  splitPadding(padding){
    let paddingItems = padding.split(' ');
    for (let index = 0; index < paddingItems.length; index++) {
      if(index === 0)
      this.paddingIdTop = isNaN(parseInt(paddingItems[index].split(' ')[0].replace(/px/g, '')))?0:parseInt(paddingItems[index].split(' ')[0].replace(/px/g, ''));    
      else if(index === 1)
      this.paddingIdRight = isNaN(parseInt(paddingItems[index].split(' ')[0].replace(/px/g, '')))?0:parseInt(paddingItems[index].split(' ')[0].replace(/px/g, ''));    
      else if(index === 2)
      this.paddingIdBottom = isNaN(parseInt(paddingItems[index].split(' ')[0].replace(/px/g, '')))?0:parseInt(paddingItems[index].split(' ')[0].replace(/px/g, ''));    
      else
      this.paddingIdLeft = isNaN(parseInt(paddingItems[index].split(' ')[0].replace(/px/g, '')))?0:parseInt(paddingItems[index].split(' ')[0].replace(/px/g, ''));    
    }
  }
  paddingIncrease(e, type){
    switch(type) { 
      case 'top': {
        this.paddingIdTop = this.count++;
        break; 
      } 
      case 'right': { 
        this.paddingIdRight = this.count++;
        break; 
      } 
      case 'left': { 
        this.paddingIdLeft = this.count++;
        break; 
      } 
      case 'bottom': { 
        this.paddingIdBottom = this.count++;
        break; 
      } 
      default: { 
         //statements; 
         break; 
      } 
    } 
  }

  paddingDecrease(e, type){
    switch(type) { 
      case 'top': {
        this.paddingIdTop = this.count--;
        break; 
      } 
      case 'right': { 
        this.paddingIdRight = this.count--;
        break; 
      } 
      case 'left': { 
        this.paddingIdLeft = this.count--;
        break; 
      } 
      case 'bottom': { 
        this.paddingIdBottom = this.count--;
        break; 
      } 
      default: { 
         //statements; 
         break; 
      } 
    } 
  }

}
