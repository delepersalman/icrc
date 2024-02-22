import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';


@Component({
  selector: 'room-close-count-down',
  templateUrl: './room-close-count-down.component.html',
  styleUrls: ['./room-close-count-down.component.scss']
})
export class RoomCloseCountDownComponent implements OnInit {
  @Input() roomCloseCountdown: number = 0;
  @Input() roomCloseFormat = 'h\'h\':m\'m\':s\'s\'';
  @Output() onRoomClose: EventEmitter<any> = new EventEmitter<any>();
  @Input() showTimer: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  makeTextToHtml(text: string) {
    var timesArray = text.split(':');
    var timerHTML = '', timeElement = '';
    timesArray.forEach(el => {
      timeElement = el.replace(/[^\d.-]/g, '');
      timerHTML += '<strong class="timeCount">' + timeElement + '</strong>';
      if (el.indexOf('d') != -1) {
        timerHTML += '<span class="timeValIn">d</span>';
      } else if (el.indexOf('h') != -1) {
        timerHTML += '<span class="timeValIn">h</span>';
      } else if (el.indexOf('m') != -1) {
        timerHTML += '<span class="timeValIn">m</span>';
      } else {
        timerHTML += '<span class="timeValIn">s</span>';
      }
    })
    return timerHTML;
  }

  onCountdownFinish(data: any): void {
    if (data.action == 'done') {
      this.onRoomClose.emit(true);
    }
    var timeleft = (data.left / 1000);
    if (data.action == 'notify' && timeleft == 90) { // show timer after 90 sec left
      this.showTimer = true;
    }
  }

  hideTimer(): void {
    this.showTimer = false;
  }
}
