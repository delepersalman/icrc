import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SectionPropertyModel, ContactUsModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { ViewEventService } from '../service/view-event.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EventMakerService } from '../../shared/services/event-maker/event-maker.service';

@Component({
  selector: 'contact-us-modal',
  templateUrl: './contact-us-modal.component.html',
  styleUrls: ['./contact-us-modal.component.scss']
})
export class ContactUsModalComponent implements OnInit {
  PhoneNo: SectionPropertyModel = new SectionPropertyModel();
  public myForm: FormGroup;
  submitted: boolean = false;
  phoneNumber: number;
  contact: ContactUsModel = new ContactUsModel();
  @Output() outputEvent: EventEmitter<any> = new EventEmitter<any>();
  constructor(private _globalService: GlobalService, private _eventMakerService: EventMakerService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.PhoneNo = this.data.EventmakerPagePropertyDesigns.filter(a => a.Name == 'Phone_Number')[0];
    this.myForm = new FormGroup({
      phoneNumber: new FormControl(''),
      cCode: new FormControl(''),
      fullName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      message: new FormControl('', [Validators.required, Validators.maxLength(500)]),
      email: new FormControl('', [Validators.required, Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-zA-Z]{2,4}$"), Validators.maxLength(30)])
    });
    if (this.PhoneNo) {
      this.contact.cCode = "+1";
      this.myForm.get('phoneNumber').setValidators([Validators.required, Validators.maxLength(10), Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]);
      this.myForm.get('cCode').setValidators([Validators.required]);
    }
  }
  public myError = (controlName: string, errorName: string) => {
    return this.myForm.controls[controlName].hasError(errorName);
  }
  onSubmit() {
    this.submitted = true;
    if (this.myForm.invalid) {
      return;
    } else {
      if (this.contact.cCode && this.contact.PhoneNoWithoutCode) {
        this.contact.PhoneNo = this.contact.cCode + " " + this.contact.PhoneNoWithoutCode;
      }
      this._globalService.showLoader(true);
      this.contact.OrganizerId = this.data.OrganizerId ? this.data.OrganizerId : 0;
      this.contact.EventId = this.data.EventId ? this.data.EventId : 0;
      this._eventMakerService.sendContactusEmail(this.contact).subscribe(s => {
        this._globalService.showLoader(false);
        if (s) {
          this.outputEvent.emit(true);
          this._globalService.showToast("Sent successfully!", "success-message");
        } else {
          this.submitted = false;
          this._globalService.showToast("Something went wrong!", "error-message");
        }
      });
    }

  }

  onCountryChange(event) {
    this.contact.cCode = '+' + event.dialCode;
  }
}
