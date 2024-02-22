import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import CustomPageModel, { ComponentOrderModel, EventmakerPageModel, EventmakerSectionModel, EventWebsiteModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { GlobalService } from 'src/app/shared/services/global-service';
import { ViewEventService } from '../service/view-event.service';
import { CustomSectionComponent } from './custom-section/custom-section.component';

@Component({
  selector: 'app-component-setting',
  templateUrl: './component-setting.component.html',
  styleUrls: ['./component-setting.component.scss']
})
export class ComponentSettingComponent implements OnInit {
  eventWebsiteDetail:EventWebsiteModel;
  selectedComponents:number []=[];
  @Output() saveEvent = new EventEmitter();
  constructor(private _eventmakerService: EventMakerService, private _globalService: GlobalService, private _viewEventService: ViewEventService, private dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any) { }
  allChecked = false;
  ngOnInit(): void {
    if(this.data)
    this.eventWebsiteDetail= this.data;
    this.selectedComponents = this.eventWebsiteDetail.EventPages[0].PageSections.filter(z=>z.Selected).map(x=>x.PageId)
  }
checked  (item, list) {
    var idx = list.indexOf(item);
    if (idx > -1) {
      list.splice(idx, 1);
    }
    else {
      list.push(item);
    }
  };
 exists (item, list) {
    return list.indexOf(item) > -1;
  };
  saveEventMaker(){
   
  }
  setAll(checked: boolean) {
    this.allChecked = checked==false?true:false;
    if (this.eventWebsiteDetail.EventPages== null) {
      return;
    }
    if(!checked){
      this.eventWebsiteDetail.EventPages[0].PageSections.forEach(t =>  {
        if(this.selectedComponents.indexOf(t.PageId) !-1)
        this.selectedComponents.push(t.PageId);
      });
    }else{
      this.selectedComponents=[];
    }
  }
  saveSelectedComponents() {
    this._globalService.showLoader(true);
    let componentdata: ComponentOrderModel = new ComponentOrderModel();
    componentdata.SelectedComponents = this.selectedComponents;
    componentdata.EventMakerWebsiteId =this.eventWebsiteDetail.WebsiteDetailId;
    componentdata.EventId = this.eventWebsiteDetail.Event.EventId;
    this._eventmakerService.saveWebComponentOrder(componentdata).subscribe(res => {
      this._globalService.showLoader(false);
      this._globalService.showToast("Saved successfully!", "success-message");
      this.saveEvent.emit(true);
    });
  }
  modalAddPage() {
    const dialogRef = this.dialog.open(CustomSectionComponent, {
      data:this.eventWebsiteDetail
    });
    dialogRef.componentInstance.saveEvent.subscribe((a:CustomPageModel)=>{
      if(a.CustomPageId>0){
       let res:EventmakerSectionModel = new EventmakerSectionModel();
       res.PageId = a.CustomPageId;
       res.PageTitle =a.PageTitle;
       res.IsSystemModule=false;
      this.eventWebsiteDetail.EventPages[0].PageSections.push(res);
        dialogRef.close();
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        
      }
    });
    
  }
  isDialogClosed(){
    this.dialog.closeAll();
  }
}
