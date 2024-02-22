import { ChangeDetectorRef, Component, Input, OnInit, QueryList, Renderer2, ViewChildren, ViewContainerRef } from '@angular/core';
import { ngStyleModel, SectionPropertyModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventTeamModel, EventTeamViewModel } from 'src/app/shared/models/event/event-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'theme1-event-teams',
  templateUrl: './theme1-event-teams.component.html',
  styleUrls: ['./theme1-event-teams.component.scss']
})
export class Theme1EventTeamsComponent implements OnInit {
  @Input() eventTeams: EventTeamModel;
  @Input() isFullPage: boolean;
  constructor(private globalService: GlobalService, private renderer: Renderer2, private cd: ChangeDetectorRef) { }
  ngStyle:ngStyleModel = new ngStyleModel();
  domainUrl:string
  heading:SectionPropertyModel= new SectionPropertyModel();
  description: SectionPropertyModel = new SectionPropertyModel();
  sectionBanner: SectionPropertyModel;
  Sectionheading:SectionPropertyModel= new SectionPropertyModel();
  enableTeamsMember: SectionPropertyModel;
  enableTeams: SectionPropertyModel;
  @ViewChildren('appendItem', { read: ViewContainerRef })
  public dynComponents: QueryList<ViewContainerRef>;
  expanded = false;
  ngOnInit(): void {
    this.renderer.listen('window', 'click', (e: any) => {
      this.globalService.clearToolBar(this.dynComponents, e);
      });
    this.domainUrl = environment.domainUrl;
  }
  changeAlignment(event){
    this.globalService.changeAlignment(event, this.eventTeams, this.ngStyle);
    this.cd.detectChanges();
    this.ngStyle =  new ngStyleModel();
  }
  ChangeDetect(event, section) {
    this.ngStyle = this.globalService.changeDetected(event, section, this.ngStyle, this.cd);
    this.cd.detectChanges();
  }
  onChange(value, prop){
    this.globalService.onChange(value, prop, this.eventTeams);
   }
  ngDoCheck():void{   
    if(this.eventTeams.ComponentId){
      this.heading= this.eventTeams.SectionProperties.filter(a=>a.Name === 'TeamHeading')[0];     
      this.description = this.eventTeams.SectionProperties.filter(a => a.Name == 'TeamsDescription')[0];
      this.Sectionheading = this.eventTeams.SectionProperties.filter(a => a.Name == 'SectionHeading')[0];
      this.sectionBanner = this.eventTeams.SectionProperties.filter(a => a.Name == 'SectionBanner')[0];
      this.enableTeamsMember = this.eventTeams.SectionProperties.filter(a => a.Name == 'EnableTeamsMember')[0];
      this.enableTeams = this.eventTeams.SectionProperties.filter(a => a.Name == 'EnableTeams')[0];
      this.ngStyle.sectionTextColor =  this.eventTeams.ModuleTextColor;
      this.ngStyle.sectionBgColor = this.eventTeams.ModuleBGColor;
      this.ngStyle.SectionBorder = this.eventTeams.SectionBorder;
      this.ngStyle.SectionPadding = this.eventTeams.SectionPadding;
    }
  }
  showHideToolbar(event:any,prop:SectionPropertyModel){ 
    this.dynComponents.map(
     (vcr: ViewContainerRef, index: number) => {
       vcr.clear();
       prop.expanded = false;
       if(vcr.element.nativeElement == event.target){   
       this.globalService.showHideToolbar(event,prop,this.ngStyle, vcr, this.eventTeams);  
       prop.expanded = true;     
       }
     })
  
 }
 getStyleString(fieldName: SectionPropertyModel) {
  return this.globalService.getStyleString(fieldName);
}
getSectionStyleString(sectionName) {
  return this.globalService.getSectionStyleString(sectionName);
}
}
