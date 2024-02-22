import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventAgendaModel, EventmakerPageModel, EventmakerSectionModel, EventWebsiteModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';

@Component({
  selector: 'view-agenda-modal',
  templateUrl: './view-agenda-modal.component.html',
  styleUrls: ['./view-agenda-modal.component.scss']
})
export class ViewAgendaModalComponent implements OnInit {
  eventId;
  eventAgenda: EventAgendaModel = new EventAgendaModel();
  componentName:string;
  themeName:string;
  customPages: EventmakerSectionModel;
  constructor(@Inject(MAT_DIALOG_DATA) public data: EventWebsiteModel, private eventMakerService: EventMakerService) { }
  ngOnInit(): void {
    if(this.data){
      this.componentName = `theme${this.data.TemplateId}-event-agenda`;
      this.customPages = this.data.EventPages.filter(x=>x.PageSystemName == 'event')[0].PageSections.filter(z=>z.PageSystemName == 'event-agenda')[0];
      this.getEventAgenda();
    }
  }
getModuleLoader() {
  return () =>
  import("../../eventmaker.module").then(m => m.EventmakerModule);
}
getEventAgenda() {
  this.eventMakerService.getEventAgenda(this.data.Event.EventId, this.data.TickerId.toString()).subscribe(res => {
    if (res)
      this.eventAgenda = res;
      this.eventAgenda = this.eventMakerService.MapComponentBaseData<EventAgendaModel>(this.eventAgenda, this.customPages, this.data.FontList);
      this.eventAgenda.EditMode = false; 
  })
  }
}
