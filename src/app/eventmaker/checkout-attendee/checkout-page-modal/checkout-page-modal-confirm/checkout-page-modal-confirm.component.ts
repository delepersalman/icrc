import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../../../../environments/environment';
import { CheckoutPageModalComponent } from '../checkout-page-modal.component';

@Component({
  selector: 'checkout-page-modal-confirm',
  templateUrl: './checkout-page-modal-confirm.component.html',
  styleUrls: ['./checkout-page-modal-confirm.component.scss']
})
export class CheckoutPageModalConfirmComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<CheckoutPageModalComponent>) {
  }

  ngOnInit(): void {
  }
}
