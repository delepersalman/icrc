import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventIntroModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
@Component({
  selector: 'add-to-calendar-modal',
  templateUrl: './add-to-calendar-modal.component.html',
  styleUrls: ['./add-to-calendar-modal.component.scss']
})
export class AddToCalendarModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
  eventUrl: string;
  navUrl: string;
  ngOnInit(): void {
  }
  createNavigationUrl(type) {
    this.eventUrl = environment.domainUrl+ "/e/"+this.data.EventTitle.replace(' ','-')+"-"+this.data.EventID+"";
    let searchParams = new URLSearchParams();
        // TODO: zrobić map z tego manualnego dziugania
       let isoStart = this.data.DateInfo.UtcStartDate.toString("yyyyMMddTHHmmssZ");
       let  isoEnd = this.data.DateInfo.UtcEndDate.toString("yyyyMMddTHHmmssZ");
        let diff = moment(this.data.DateInfo.UtcEndDate).diff(moment(this.data.DateInfo.UtcStartDate));
       let duration =moment.duration(diff);
       let description = this.data.EventDescription.replace(/<[^>]+>/g, '');
    switch(type) {
      case 'outlook':
        searchParams.set('beginDate', isoStart);
        searchParams.set('endDate', isoEnd);
        searchParams.set('location',(this.data.OnlineEvent?'Online':this.data.Address));
        searchParams.set('subject', this.data.EventTitle);
        searchParams.set('description', description);
        this.navUrl = environment.domainUrl+'/download/calendar?' + searchParams;
        break;
      case 'google':
        searchParams.set('action', 'TEMPLATE');
        searchParams.set('dates', isoStart+"/"+isoEnd);
        searchParams.set('details', description);
        searchParams.set('text', this.data.EventTitle);
        searchParams.set('location',(this.data.OnlineEvent?'Online':this.data.Address));
        
        this.navUrl =  'https://www.google.com/calendar/render?' + searchParams;
        break;
        case 'apple':
          searchParams.set('beginDate', isoStart);
          searchParams.set('endDate', isoEnd);
          searchParams.set('location',(this.data.OnlineEvent?'Online':this.data.Address));
          searchParams.set('subject', this.data.EventTitle);
          searchParams.set('description', description);
          this.navUrl = environment.domainUrl+'/download/calendar?' + searchParams;
        break;
    }
    this.addtoCalender();
  }

  public addtoCalender() {
    return window.open(this.navUrl, "_blank");
  }
}
