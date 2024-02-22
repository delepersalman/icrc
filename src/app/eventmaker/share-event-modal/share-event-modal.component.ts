import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventIntroModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-share-event-modal',
  templateUrl: './share-event-modal.component.html',
  styleUrls: ['./share-event-modal.component.scss']
})
export class ShareEventModalComponent implements OnInit {
  eventUrl = '';
  constructor(@Inject(MAT_DIALOG_DATA) public data: EventIntroModel) { }
  navUrl: string;
  
  ngOnInit() {
    this.eventUrl = environment.domainUrl+ "/e/"+this.data.EventTitle.replace(' ','-')+"-"+this.data.EventID+"";
  }
  createNavigationUrl(type) {    
    let searchParams = new URLSearchParams();
        // TODO: zrobić map z tego manualnego dziugania

    switch(type) {
      case 'facebook':
        searchParams.set('u', this.eventUrl);
        this.navUrl = 'https://www.facebook.com/sharer/sharer.php?' + searchParams;
        break;
      case 'twitter':
        searchParams.set('url', this.eventUrl);
        searchParams.set('via', "Eventcombo");
        searchParams.set('related', "Eventcombo");
        searchParams.set('text', this.data.EventTitle);
        this.navUrl =  'https://twitter.com/share?' + searchParams;
        break;
        case 'linkedin':
        searchParams.set('url', this.eventUrl);
        searchParams.set('title', this.data.EventTitle);
        this.navUrl =  'https://www.linkedin.com/shareArticle?mini=true&' + searchParams;
        break;
    }
    this.share();
  }

  public share() {
    return window.open(this.navUrl, "_blank","toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=626,height=436");
  }
}
