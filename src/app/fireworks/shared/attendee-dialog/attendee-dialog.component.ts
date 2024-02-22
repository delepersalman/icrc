import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { MemberAttributes } from '../../models/rtm.model';
import { VirtualEventModel } from '../../models/virtualevent.model';
import { VirtualEventUserModel } from '../../models/virtualevent.user.model';
import { SharedFireworksComponentService } from '../../services/shared.service';
import { VirtualEventService } from '../../services/virtualevent.service';

@Component({
  selector: 'fireworks-attendee-dialog',
  templateUrl: './attendee-dialog.component.html',
  styleUrls: ['./attendee-dialog.component.scss']
})
export class AttendeeDialogComponent implements OnInit, AfterViewInit {
  resourcesLoading: boolean;
  gridColumns = 10;
  domainUrl = environment.domainUrl;
  attendeeSearch : string;

  constructor(@Inject(MAT_DIALOG_DATA) public attendeeData: any,
  public dialogRef: MatDialogRef<AttendeeDialogComponent>,
    protected sharedService: SharedFireworksComponentService,
    public virtualEventService: VirtualEventService,) {

  }

  toggleGridColumns() {
    this.gridColumns = this.gridColumns === 15 ? 10 : 15;
  }


  ngOnInit(): void {
  }

  ngAfterViewInit() {

  }

}
