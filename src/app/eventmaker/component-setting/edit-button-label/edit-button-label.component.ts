import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GlobalService } from 'src/app/shared/services/global-service';

@Component({
  selector: 'app-edit-button-label',
  templateUrl: './edit-button-label.component.html',
  styleUrls: ['./edit-button-label.component.scss']
})
export class EditButtonLabelComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private globalService: GlobalService) { }
  @Input() LableName:string;
  @Output() updateLabelText:EventEmitter<string> = new EventEmitter<string>();
  ngOnInit(): void {
    if(this.data &&  this.data.data)
    this.LableName = this.data.data;
    
  } 

  saveLabel(){
    if(this.LableName)
    {
      if(this.data && this.data.SectionName === 'event-header'){
        let testAlphabet = /^[a-zA-Z 0-9]+$/.test(this.LableName);
        if(this.LableName && !testAlphabet)
        {
          this.globalService.showToast("Header link text must contains alphanumeric only.", "error-message");
          return false;
        }
        if(this.LableName.length>50)
        {
          this.globalService.showToast("Header link text must be less than 50 characters.", "error-message");
          return false;
        }
      }
     
   
    this.updateLabelText.emit(this.LableName);
    } else {
      this.globalService.showToast("The field is required.", "error-message");
      return false;
    }
  }
}
