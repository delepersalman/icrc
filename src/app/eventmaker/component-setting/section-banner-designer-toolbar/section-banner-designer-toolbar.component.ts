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
  selector: 'section-banner-designer-toolbar',
  templateUrl: './section-banner-designer-toolbar.component.html',
  styleUrls: ['./section-banner-designer-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionBannerDesignerToolbarComponent implements OnInit {
  @Input() ngStyle: ngStyleModel;
  @Output() eventTextFormatAlignment: EventEmitter<any> = new EventEmitter<any>();
  sectionBgColor: string;
  bgColor: string;
  textColor: string;
  destroy$ = new Subject();
  onPaddingOptionStatus: boolean;
  onBorderOptionStatus: boolean;
  paddingIdTop: any = 0;
  paddingIdRight: any = 0;
  paddingIdLeft: any = 0;
  paddingIdBottom: any = 0;
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
    if (this.bgColor !== this.ngStyle.BannerSectionBGColor) {
      this.ngStyle.BannerSectionBGColor = this.bgColor;
      this.ngStyle.ChangeType = "BGColor";
      this.eventTextFormatAlignment.emit(this.ngStyle);
    }
  }
  saveBorder() {
    this.sectionBorder = `${this.borderPixel}px ${this.border} ${this.borderColor}`   
      if (this.sectionBorder !== this.ngStyle.BannerSectionBorder) {
        this.ngStyle.BannerSectionBorder = this.sectionBorder;
        this.ngStyle.ChangeType = "SectionBorder";
        this.eventTextFormatAlignment.emit(this.ngStyle);
        this.onBorderOptionStatus = false;
      }
  }
  applyBorder(value) {
    this.border = value;
  }
  onTextColor() {
    if (this.textColor !== this.ngStyle.sectionTextColor) {
      this.ngStyle.sectionTextColor = this.textColor;
      this.ngStyle.ChangeType = "TextColor";
      this.eventTextFormatAlignment.emit(this.ngStyle);
    }
  }
  savePadding() {
      this.ngStyle.BannerSectionPadding = `${this.paddingIdTop}px ${this.paddingIdRight}px ${this.paddingIdBottom}px ${this.paddingIdLeft}px`;
      if (this.sectionPadding !== this.ngStyle.BannerSectionPadding) {
        this.ngStyle.ChangeType = "SectionPadding";
        this.eventTextFormatAlignment.emit(this.ngStyle);
        this.onPaddingOptionStatus = false;
      } 
  }
  ngOnInit(): void {
    this.ngStyle.SectionType = 'SectionBanner';
    this.onPaddingOptionStatus = false;
    this.onBorderOptionStatus = false;
    this.bgColor = this.ngStyle.BannerSectionBGColor;
    this.textColor = this.ngStyle.sectionTextColor;
      if (this.ngStyle.BannerSectionBorder) {
        this.splitBorder(this.ngStyle.BannerSectionBorder);
      }
      if (this.ngStyle.BannerSectionPadding) {
        this.splitPadding(this.ngStyle.BannerSectionPadding);
      }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.ngStyle.firstChange)
    this.bgColor = this.ngStyle.BannerSectionBGColor;
    this.textColor = this.ngStyle.sectionTextColor;
      if (this.ngStyle.BannerSectionBorder) {
        this.splitBorder(this.ngStyle.BannerSectionBorder);
      }
      if (this.ngStyle.BannerSectionPadding) {
        this.splitPadding(this.ngStyle.BannerSectionPadding);
      }
  }

  onPaddingOptions(event) {
    this.onBorderOptionStatus = false;
    this.onPaddingOptionStatus = !this.onPaddingOptionStatus;
  }
  onBorderOptions(event) {
    this.onPaddingOptionStatus = false;
    this.onBorderOptionStatus = !this.onBorderOptionStatus;
  }
  splitBorder(border) {
    let borderItems = border.split(' ');
    for (let index = 0; index < borderItems.length; index++) {
      if (index === 0) {
        this.borderPixel = parseInt(borderItems[index].split(' ')[0].replace(/px/g, ''));
      }
      else if (index === 1)
        this.border = borderItems[index];
      else if (index === 2)
        this.borderColor = borderItems[index];
    }
  }
  splitPadding(padding) {
    let paddingItems = padding.split(' ');
    for (let index = 0; index < paddingItems.length; index++) {
      if (index === 0)
        this.paddingIdTop = parseInt(paddingItems[index].split(' ')[0].replace(/px/g, ''));
      else if (index === 1)
        this.paddingIdRight = parseInt(paddingItems[index].split(' ')[0].replace(/px/g, ''));
      else if (index === 2)
        this.paddingIdBottom = parseInt(paddingItems[index].split(' ')[0].replace(/px/g, ''));
      else
        this.paddingIdLeft = parseInt(paddingItems[index].split(' ')[0].replace(/px/g, ''));
    }
  }
}
