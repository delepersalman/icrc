import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ViewEventService } from '../../service/view-event.service';
export interface QuestionNAnswer {
  Question: string;
  position: number;
  Answer: string;
}


@Component({
  selector: 'edit-faq',
  templateUrl: './edit-faq.component.html',
  styleUrls: ['./edit-faq.component.scss']
})
export class EditFaqComponent implements OnInit {
  @Input() pageData: any
  @Output() outputEvent : EventEmitter<any> = new EventEmitter<any>();
  displayedColumns: string[] = ['position', 'Question', 'Answer'];
  dataSource : any;
  controls: FormArray;
  Answer:string
  Question:string
  constructor(private _eventMakerService: ViewEventService) { }

  ngOnInit(): void {
    
  }
  savePageData(){

  }
}
