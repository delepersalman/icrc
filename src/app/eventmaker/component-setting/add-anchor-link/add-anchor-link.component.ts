import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'add-anchor-link',
  templateUrl: './add-anchor-link.component.html',
  styleUrls: ['./add-anchor-link.component.scss']
})
export class AddAnchorLinkComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
  @Input() LableName:string;
  @Output() updateLabelText:EventEmitter<string> = new EventEmitter<string>();
  ngOnInit(): void {
    if(this.data)
    this.LableName = this.data;
  }
  saveLabel(){
    if(this.LableName)
    this.updateLabelText.emit(this.LableName);
  }
}
