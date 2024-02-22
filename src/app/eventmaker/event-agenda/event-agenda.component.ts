import { Component, Input, OnInit } from '@angular/core';
import { EventAgendaModel, EventmakerPageModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';

@Component({
  selector: 'event-agenda',
  templateUrl: './event-agenda.component.html',
  styleUrls: ['./event-agenda.component.scss']
})
export class EventAgendaComponent implements OnInit {
  @Input() eventId;
  @Input() eventCustomPages:EventmakerPageModel;
  @Input() isFullPage: boolean;
  @Input() websiteDetails: any;
  eventAgenda: EventAgendaModel = new EventAgendaModel();
  componentName:string;
  @Input() themeName:string;
  constructor(private eventMakerService: EventMakerService) { }

  ngOnInit(): void {
    if(this.eventId){
    this.getEventAgenda();
    this.componentName = `theme${this.themeName}-event-agenda`;
    }
  }
  getModuleLoader() {
    return () =>
    import("../eventmaker.module").then(m => m.EventmakerModule);
  }

  getEventAgenda() {
    this.eventMakerService.getEventAgenda(this.eventId).subscribe(res => {
      if (res && this.websiteDetails)
        this.eventAgenda = res;
        this.eventAgenda = this.eventMakerService.MapComponentBaseData<EventAgendaModel>(this.eventAgenda,this.eventCustomPages, this.websiteDetails.FontList);    
        this.eventAgenda.EventId= this.eventId;
    })
  }



}
