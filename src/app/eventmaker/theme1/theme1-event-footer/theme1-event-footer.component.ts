import { Component, Input, OnInit } from '@angular/core';
import { EventFooter } from 'src/app/shared/models/event-maker/event-maker-model';

@Component({
  selector: 'theme1-event-footer',
  templateUrl: './theme1-event-footer.component.html',
  styleUrls: ['./theme1-event-footer.component.scss']
})
export class Theme1EventFooterComponent implements OnInit {
  @Input() eventFooter: EventFooter = new EventFooter();
  constructor() { }

  ngOnInit(): void {
  }

}
