import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'edit-event-format-model',
  templateUrl: './edit-event-format-model.component.html',
  styleUrls: ['./edit-event-format-model.component.scss']
})
export class EditEventFormatModelComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
  @Input() dateFormat:string;
  @Output() updateLabelText:EventEmitter<string> = new EventEmitter<string>();
  ngOnInit(): void {
    if(this.data)
    this.dateFormat = this.data;
    else{
      this.dateFormat = "EEEE, MMMM d, y, h:mm:ss a";
    }
  }
  saveDateFormat(){
    if(this.dateFormat)
    this.updateLabelText.emit(this.dateFormat);
  }

}
