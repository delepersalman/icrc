import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { EventCountdownModel, EventmakerPageModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { GlobalService } from 'src/app/shared/services/global-service';

@Component({
  selector: 'event-countdown',
  templateUrl: './event-countdown.component.html',
  styleUrls: ['./event-countdown.component.scss']
})
export class EventCountdownComponent implements OnInit, OnChanges {
  eventEndDate: any;
  @Input() eventCountdown:EventCountdownModel= new EventCountdownModel();
  @Input() eventCustomPages:EventmakerPageModel;
  componentName:string;
  @Input() themeName:string;
  @Input() timerData: any = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  }
  @Input() isFullPage: boolean;
  @Input() websiteDetails: any;
  constructor(private globalService: GlobalService, private eventMakerService:EventMakerService) {

  }

  ngOnInit(): void {
    var that = this;
    setTimeout(() => {
      that.eventEndDate = that.globalService.eventEndDate;
      if(that.eventEndDate){
      setInterval(() => {
        that.makeTimer();
      }, 1000)
    }else{
      this.timerData.days = 0;
      this.timerData.hours = 0;
      this.timerData.minutes = 0;
      this.timerData.seconds =0;
      this.eventCountdown.timerData = this.timerData;
    }
    }, 1000);
    if(this.websiteDetails)
    this.eventCountdown = this.eventMakerService.MapComponentBaseData<EventCountdownModel>(this.eventCountdown,this.eventCustomPages, this.websiteDetails.FontList);    
    this.componentName = `theme${this.themeName}-event-countdown`;
  }
  getModuleLoader() {
    return () =>
    import("../eventmaker.module").then(m => m.EventmakerModule);
  }
ngOnChanges():void{
}
  makeTimer() {
    var endTime = (Date.parse(this.eventEndDate) / 1000);
    let now = (Date.parse(new Date().toString()) / 1000);
    let timeLeft = endTime - now;
    if(timeLeft>0){
    this.timerData.days = Math.floor(timeLeft / 86400);
    this.timerData.hours = Math.floor((timeLeft - (this.timerData.days * 86400)) / 3600);
    this.timerData.minutes = Math.floor((timeLeft - (this.timerData.days * 86400) - (this.timerData.hours * 3600)) / 60);
    this.timerData.seconds = Math.floor((timeLeft - (this.timerData.days * 86400) - (this.timerData.hours * 3600) - (this.timerData.minutes * 60)));
    if (this.timerData.hours < 10) { this.timerData.hours = "0" + this.timerData.hours; }
    if (this.timerData.minutes < 10) { this.timerData.minutes = "0" + this.timerData.minutes; }
    if (this.timerData.seconds < 10) { this.timerData.seconds = "0" + this.timerData.seconds; }
    }else{
      this.timerData.days = 0;
      this.timerData.hours = 0;
      this.timerData.minutes = 0;
      this.timerData.seconds =0;
    }
  }
}
