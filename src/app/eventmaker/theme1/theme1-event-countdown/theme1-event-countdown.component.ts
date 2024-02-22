import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, ViewChildren, ViewContainerRef } from '@angular/core';
import { ngStyleModel, SectionPropertyModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'theme1-event-countdown',
  templateUrl: './theme1-event-countdown.component.html',
  styleUrls: ['./theme1-event-countdown.component.scss']
})
export class Theme1EventCountdownComponent implements OnInit {  
  @Input() timerData: any = {};
  @Input() eventCountdown: any;
  ngStyle:ngStyleModel = new ngStyleModel();
  domainUrl:string;
  @ViewChildren('appendItem', { read: ViewContainerRef })
  public dynComponents: QueryList<ViewContainerRef>;

  @Output() outputEvent : EventEmitter<any> = new EventEmitter<any>();
  constructor(private globalService: GlobalService, private cd: ChangeDetectorRef) { }
  changeAlignment(event){
    this.globalService.changeAlignment(event, this.eventCountdown, this.ngStyle);
    this.cd.detectChanges();
    this.ngStyle =  new ngStyleModel();
    this.ngStyle.SectionName = "countdown";
  }
  ChangeDetect(event, section) {
    this.ngStyle = this.globalService.changeDetected(event, section, this.ngStyle, this.cd);
    this.cd.detectChanges();
  }
  closeToolBar(){
    let classList =document.getElementsByClassName('Clicked');
    if(classList.length>0){
      for(let i =0;i<classList.length;i++)
       {
        classList[i].classList.remove('Clicked');
       }
  }
  }
  showHideToolbar(event:any,prop:SectionPropertyModel,isBtn: boolean=false){    
    this.globalService.closeToolBar();
    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if (vcr.element.nativeElement == event.target) {
          this.ngStyle =  this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventCountdown,false);
          prop.expanded = true;
        }
      });  
 }
  ngOnInit(): void {
    this.ngStyle.SectionName = "countdown";
    this.ngStyle.sectionTextColor =  this.eventCountdown.ModuleTextColor;
    this.ngStyle.sectionBgColor = this.eventCountdown.ModuleBGColor;
    this.domainUrl = environment.domainUrl;
  }
  getStyleString(fieldName: SectionPropertyModel) {
    return this.globalService.getStyleString(fieldName);
  }
  getSectionStyleString(sectionName) {
    return this.globalService.getSectionStyleString(sectionName);
  }
  
}
