import { Component, EventEmitter, OnChanges, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { GlobalService } from '../shared/services/global-service';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'eventmaker',
  templateUrl: './eventmaker.component.html',
  styleUrls: ['./eventmaker.component.scss']
})
export class EventmakerComponent implements OnInit {
  IsEditMode:boolean;
  outputValue:any
  constructor(private _snackBar: MatSnackBar, private router: ActivatedRoute, private globalService:GlobalService) { }
  
  ngOnInit(): void {
    this.router.params.subscribe(params =>{
      var url =this.router.url.subscribe(res=>{       
        this.IsEditMode =  res[0].path === "eventmaker"?true:false;
      })    
    });  
  }
  synchValue(evnt){
    this.outputValue = evnt;
  }
}
