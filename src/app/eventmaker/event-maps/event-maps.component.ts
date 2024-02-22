import { Component, Input, OnInit } from '@angular/core';
import { EventmakerSectionModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';

@Component({
  selector: 'event-maps',
  templateUrl: './event-maps.component.html',
  styleUrls: ['./event-maps.component.scss']
})
export class EventMapsComponent implements OnInit{
  @Input() eventId;
  @Input() eventCustomPages:EventmakerSectionModel;
  @Input() isFullPage: boolean;
  constructor(private eventMakerService: EventMakerService) { }

  ngOnInit(): void {
    this.getEventIntro();
  }
  getEventIntro() {
    this.eventMakerService.getEventIntro(this.eventId).subscribe(res => {
      if (res){
      const latitude = res.Lat;
      const longitude = res.Long;     
      if(latitude && longitude){
      let mapElemnet = document.getElementById('mapiframe');
      const mapIframe = document.createElement("iframe");
      mapIframe.setAttribute("src", "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2478.0344093994404!2d" + longitude + "!3d" + latitude + "!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce44ead05b9b5%3A0xd5c5be3f3210f9fd!2s" + res.Address + "!5e0!3m2!1sen!2sin!4v1680592930452!5m2!1sen!2sin");
      mapIframe.setAttribute("width", "100%");
      mapIframe.setAttribute("height", "450");
      mapIframe.setAttribute("style", "border:0;");
      mapElemnet.appendChild(mapIframe);
      }
     }
    });
  }
}
