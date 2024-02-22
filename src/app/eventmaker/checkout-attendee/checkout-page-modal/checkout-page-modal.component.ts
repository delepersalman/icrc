import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { EventmakerSectionModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { environment } from 'src/environments/environment';
import { CheckoutPageModalConfirmComponent } from './checkout-page-modal-confirm/checkout-page-modal-confirm.component';

@Component({
  selector: 'checkout-page-modal',
  templateUrl: './checkout-page-modal.component.html',
  styleUrls: ['./checkout-page-modal.component.scss']
})
export class CheckoutPageModalComponent implements OnInit {
  checkoutSections: EventmakerSectionModel[] = [];
  eventId = 0;
  themeName: string;
  url: SafeUrl;
  purchaseComplete: boolean = false;

  constructor(
    private dialog: MatDialog,
    private parentDialog: MatDialogRef<CheckoutPageModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    protected _sanitizer: DomSanitizer) {
    this.url = this._sanitizer.bypassSecurityTrustResourceUrl(environment.domainUrl + '/TicketPurchase/Checkout?lockId=' + data.TicketLockResponse.LockId + '&webreferralId=0&iframe=true&kmaEventId='+data.KmaEventId);
  }

  ngOnInit(): void {
    let itsMe = this;
    window.addEventListener("message", function (event) {
      if(event.data === "goBack"){
        itsMe.purchaseComplete = true;
        itsMe.openConfirmationDialog();
      }else if(event.data === "iframe.checkout.completed"){
        itsMe.purchaseComplete = true;
      }
    });
  }


  ngDoCheck() {
    this.checkoutSections = this.data.EventPages.filter(x => x.PageSystemName == 'checkout').map(s => s.PageSections)[0].filter(a => a.Selected);
    if (!this.data.TemplateId) {
      this.themeName = "1";
    } else
      this.themeName = this.data.TemplateId.toString();
    this.eventId = this.data.Event.EventId;
  }
  

  openConfirmationDialog() {

    if(this.purchaseComplete){
      this.parentDialog.close();
      return;
    }

    let dialogRef = this.dialog.open(CheckoutPageModalConfirmComponent, {
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.parentDialog.close();
      }
      dialogRef = null;
    });
  }

  getModuleLoader() {
    return () =>
      import("../../eventmaker.module").then(m => m.EventmakerModule);
  }
}
