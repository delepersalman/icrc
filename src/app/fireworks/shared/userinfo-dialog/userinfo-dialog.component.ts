import { Component, OnInit } from '@angular/core';
import { VirtualEventService } from '../../services/virtualevent.service';
import { SharedFireworksComponentService } from '../../services/shared.service';
import { MessageService } from '../../../shared/services/message.service';
import { VirtualEventUserModel } from '../../models/virtualevent.user.model';
import { environment } from '../../../../environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'fireworks-userinfo-dialog',
  templateUrl: './userinfo-dialog.component.html',
  styleUrls: ['./userinfo-dialog.component.scss']
})
export class UserinfoDialogComponent implements OnInit {

  destroy$ = new Subject();
  constructor(
    public dialogRef: MatDialogRef<UserinfoDialogComponent>,
    protected virtualEventService: VirtualEventService,
    protected sharedService: SharedFireworksComponentService,
    protected messageService: MessageService) { }
    virtualEventUser: VirtualEventUserModel;
    imagePath: string;
    personalInfoPic: string | ArrayBuffer;
    personalInfoPicName: string = '';
    UserProfileImageName: string;
    IsPersonalInfoPic: boolean = false;
    domainUrl = environment.domainUrl;

  ngOnInit(): void {
    this.virtualEventUser = new VirtualEventUserModel();

   this.virtualEventService.getEventUserDetailById(this.sharedService.virtualEventUser.VirtualEvent.EventId, this.sharedService.virtualEventUser.VirtualEventUserId).subscribe(d => {
      if (d && d.Data) {
        this.virtualEventUser = d.Data;
        this.personalInfoPic = this.virtualEventUser.UserProfileImage;
        this.personalInfoPic = (this.personalInfoPic != null && this.personalInfoPic != "") ? this.domainUrl + this.personalInfoPic : this.personalInfoPic;
        this.personalInfoPicName = this.virtualEventUser.UserProfileImageName;
        this.IsPersonalInfoPic = (this.personalInfoPic != null && this.personalInfoPic != "");
      }
    });
  }

  saveAttendeeDetail(form) {
    if (form.valid) {
      this.virtualEventUser.UserProfileImage = this.personalInfoPic as string;
      this.virtualEventUser.UserProfileImageName = this.personalInfoPicName;
      this.IsPersonalInfoPic = (this.personalInfoPic != null && this.personalInfoPic != "");
      this.virtualEventService.updateVirtualEventUser(this.virtualEventUser).pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (res && res.Data) {
          this.sharedService.virtualEventUser.FirstName = res.Data.FirstName;
          this.sharedService.virtualEventUser.LastName = res.Data.LastName;
          this.sharedService.virtualEventUser.Title = res.Data.Title;
          this.sharedService.virtualEventUser.Phone = res.Data.Phone;
          this.sharedService.virtualEventUser.Description = res.Data.Description;
          this.sharedService.virtualEventUser.ProfileImageUrl = res.Data.ProfileImageUrl;
          this.dialogRef.close();
        }
      });
    } else{
      form.form.controls['FirstName'].touched = true;
      form.form.controls['LastName'].touched = true;
      form.form.controls['Phone'].touched = true;
      form.form.controls['password'].touched = true;
    }
  }
  uploadProfileImage(event) {
    var reader = new FileReader();
    reader.onload = (event) => {
      this.personalInfoPic = event.target.result;
      this.IsPersonalInfoPic = (this.personalInfoPic != null && this.personalInfoPic != "");
    };
    reader.readAsDataURL(event.target.files[0]);
    this.personalInfoPicName = event.target.files[0].name;
  }

  stripText(event) {
    const seperator  = '^[- +()0-9]+';
    const maskSeperator =  new RegExp(seperator , 'g');
    let result =maskSeperator.test(event.key);   return result;
  }

  linkedInClicked() {
    this.virtualEventService.linkedInCall().pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res && res.Data) {
        var win = window.open(res.Data, '_blank');
        win.focus();
      }
    });
  }

  forgotPassword(){
    alert('forgot password');
  }
  deleteImage() {
    this.personalInfoPic = '';
    this.personalInfoPicName = '';
    this.IsPersonalInfoPic = false;
  }
}

