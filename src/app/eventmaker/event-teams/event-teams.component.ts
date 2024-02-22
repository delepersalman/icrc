import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventTeamModel, EventTeamViewModel } from 'src/app/shared/models/event/event-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';

@Component({
  selector: 'event-teams',
  templateUrl: './event-teams.component.html',
  styleUrls: ['./event-teams.component.scss']
})
export class EventTeamsComponent implements OnInit {
  @Input() eventId;
  eventTeams: EventTeamModel = new EventTeamModel();
  @Input() eventCustomPages: any;
  @Input() isFullPage: boolean;
  componentName:string;
  @Input() themeName:string;
  @Input() websiteDetails: any;
  constructor(private eventmakerService: EventMakerService, private router: ActivatedRoute) { }

  ngOnInit(): void {
    if(this.eventId)
    this.getEventTeams();
   this.componentName = `theme${this.themeName}-event-teams`;
  }
  getModuleLoader() {
    return () =>
    import("../eventmaker.module").then(m => m.EventmakerModule);
  }
  getEventTeams() {
    this.eventmakerService.getEventTeams(this.eventId).subscribe(res => {
      if (res && this.websiteDetails)
        this.eventTeams.eventTeams = res;
        this.eventTeams = this.eventmakerService.MapComponentBaseData<EventTeamModel>(this.eventTeams,this.eventCustomPages , this.websiteDetails.FontList);    
    })
  }
}
