import { ChangeDetectorRef, Component, Input, OnInit, QueryList, Renderer2, ViewChildren, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EventDescriptionModel, EventmakerSectionModel, SectionPropertyModel, ngStyleModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';
import { ContactUsModalComponent } from '../../contact-us-modal/contact-us-modal.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';

@Component({
  selector: 'theme2-event-contactus',
  templateUrl: './theme2-event-contactus.component.html',
  styleUrls: ['./theme2-event-contactus.component.scss']
})
export class Theme2EventContactusComponent implements OnInit {
  @Input() eventId;
  @Input() eventCustomPages:EventmakerSectionModel;
  @Input() eventDesc: EventDescriptionModel = new EventDescriptionModel();
  description: SectionPropertyModel = new SectionPropertyModel();
  heading: SectionPropertyModel = new SectionPropertyModel();
  ngStyle: ngStyleModel = new ngStyleModel();
  @ViewChildren('appendItem', { read: ViewContainerRef })
  public dynComponents: QueryList<ViewContainerRef>;
  expanded = false;
  submitted = false;
  domainUrl;
  ImagePath;
  @Input() websiteDetails: any;
  constructor(private dialog: MatDialog, private eventMakerService: EventMakerService, private globalService: GlobalService,
    private cd: ChangeDetectorRef,  private renderer: Renderer2) { }

  
  openContactusModal(e,prop) {
    if(this.eventDesc.EditMode){
      this.showHideButtonToolbar(e,prop);
      return false;
    }
    this.submitted= true;
    this.eventCustomPages.EventId = this.eventId;
    const dialogRef = this.dialog.open(ContactUsModalComponent, {
       data:this.eventCustomPages,
       maxWidth: '700px',
       scrollStrategy: new NoopScrollStrategy()
    });
    dialogRef.componentInstance.outputEvent.subscribe(res=>{
      dialogRef.close();
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.submitted= false;
      }
    });
  }
  showHideButtonToolbar(event: any, prop: SectionPropertyModel) {
    if (this.eventDesc.EditMode) {
      this.dynComponents.map(
        (vcr: ViewContainerRef, index: number) => {
          vcr.clear();
          prop.expanded = false;
          if (vcr.element.nativeElement == event.target) {
            this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventDesc, true);
            prop.expanded = true;
          }
        });
    }
  }
  changeAlignment(event) {
    this.globalService.changeAlignment(event, this.eventDesc, this.ngStyle)
    this.cd.detectChanges();
    this.ngStyle =  new ngStyleModel();
  }
  ChangeDetect(event, section) {
    this.ngStyle = this.globalService.changeDetected(event, section, this.ngStyle, this.cd);
    this.cd.detectChanges();
  }
  showHideToolbar(event: any, prop: SectionPropertyModel) {

    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if (vcr.element.nativeElement == event.target) {
          this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventDesc);
          prop.expanded = true;
        }
      });
  }
  onChange(value, prop) {
    this.globalService.onChange(value, prop, this.eventDesc);
  }
  ngDoCheck(): void {
    if (this.eventCustomPages && this.websiteDetails) {
      this.eventDesc = this.eventMakerService.MapComponentBaseData<EventDescriptionModel>(this.eventDesc,this.eventCustomPages , this.websiteDetails.FontList);    
      this.heading = this.eventCustomPages.EventmakerPagePropertyDesigns.filter(a => a.Name == 'ContactUSHeading')[0];
      this.description = this.eventCustomPages.EventmakerPagePropertyDesigns.filter(a => a.Name == 'ContactUSDescription')[0];
      }
  }
  
  ngOnInit(): void {
    this.renderer.listen('window', 'click', (e: any) => {
      this.globalService.clearToolBar(this.dynComponents, e);
    });
    this.domainUrl = environment.domainUrl;
  }
  getStyleString(fieldName: SectionPropertyModel) {
    return this.globalService.getStyleString(fieldName);
  }
  getSectionStyleString(sectionName) {
    return this.globalService.getSectionStyleString(sectionName);
  }
}
