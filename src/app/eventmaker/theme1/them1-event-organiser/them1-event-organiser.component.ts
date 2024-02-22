import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, Input, OnInit, QueryList, Renderer2, ViewChildren, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EventDescriptionModel, EventmakerPageModel, EventmakerSectionModel, EventWebsiteModel, ngStyleModel, SectionPropertyModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventMakerService } from 'src/app/shared/services/event-maker/event-maker.service';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';
import { ContactUsModalComponent } from '../../contact-us-modal/contact-us-modal.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';

@Component({
  selector: 'theme1-event-organiser',
  templateUrl: './them1-event-organiser.component.html',
  styleUrls: ['./them1-event-organiser.component.scss']
})
export class Them1EventOrganiserComponent implements OnInit {

  @Input() eventDesc: EventDescriptionModel = new EventDescriptionModel();
  ngStyle: ngStyleModel = new ngStyleModel();
  domainUrl: string;
  orgName: SectionPropertyModel = new SectionPropertyModel();
  heading: SectionPropertyModel = new SectionPropertyModel();
  OrganiserBox:  SectionPropertyModel = new SectionPropertyModel();
  ImageUrl: boolean;
  eventCustomPages: EventmakerSectionModel;
  profileImageUrl: string;
  @ViewChildren('appendItem', { read: ViewContainerRef })
  public dynComponents: QueryList<ViewContainerRef>;
  expanded = false;
  submitted = false;
  membershipURL: string;
  constructor(private globalService: GlobalService, private _eventmakerService: EventMakerService, private dialog: MatDialog, private renderer: Renderer2,
    private cd: ChangeDetectorRef) { }
  drop(event: CdkDragDrop<string[]>) {
    this.globalService.drop(event, this.eventDesc);
  }
  changeAlignment(event){
    this.globalService.changeAlignment(event, this.eventDesc, this.ngStyle);
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

  ngOnInit(): void {
    this.domainUrl = environment.domainUrl;
    this.profileImageUrl = environment.domainUrl;
    this.renderer.listen('window', 'click', (e: any) => {
      this.dynComponents.forEach(element => {
        if (e.target !== element.element.nativeElement && e.target.parentElement.parentElement.nodeName !== 'BUTTON' && e.target.parentElement.parentElement.nodeName !== "DESIGNER-TOOLBAR") {
          element.clear();
          return;
        }
      });
    });
    this.globalService.onFieldDataChanged.subscribe(s=>{
      for (let index = 0; index < s.length; index++) {  
          if(s[index].FieldId === this.eventDesc.Organizer.OrganizerId && s[index].FieldName === 'OrganiserBox'){
            this.eventDesc.Organizer.BGColor = s[index].BGColor;
            this.eventDesc.Organizer.TextColor = s[index].TextColor;
          }
      }
    });
  }
  showHideButtonToolbar(event: any, prop: SectionPropertyModel, organiser: any = undefined) {
    if (this.eventDesc.EditMode) {   
      this.dynComponents.map(
        (vcr: ViewContainerRef, index: number) => {
          vcr.clear();
          prop.expanded = false;
          if (vcr.element.nativeElement == event.target) {
            if(organiser){
              prop.FieldId = organiser.OrganizerId;
              prop.BGColor = organiser.BGColor;
              prop.Color = organiser.TextColor;
              this.ngStyle.bgColor  = organiser.BGColor;
              this.ngStyle.textColor  = organiser.TextColor;
            }
            this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventDesc, true);
            prop.expanded = true;
          }
        });
    }
    else if(prop.Name === 'Contact')
      this.openContactusModal();
  }

  openContactusModal() {
    this.submitted= true;
    this._eventmakerService.getEventWebsiteDetail(this.eventDesc.EventID).subscribe((eventDetails: EventWebsiteModel) => {
      eventDetails.EventPages.forEach(res => {
        if (res.PageSystemName === 'event') {
          this.eventCustomPages = res.PageSections.filter(x => x.Selected && x.PageTitle === "Contact Us")[0];
        }
      });
      this.eventCustomPages.OrganizerId = this.eventDesc.Organizer.OrganizerId;
      const dialogRef = this.dialog.open(ContactUsModalComponent, {
        data: this.eventCustomPages,
        maxWidth: '700px',
        scrollStrategy: new NoopScrollStrategy()
      });
      dialogRef.componentInstance.outputEvent.subscribe(res => {
        dialogRef.close();
      })
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.submitted= false;
        }
      });
    })
  }
  ngDoCheck(): void {
    if (this.eventDesc.ComponentId) {
      this.membershipURL = this.domainUrl+"/"+this.eventDesc.Organizer.JoinMembershipUrl;
      this.heading = this.eventDesc.SectionProperties.filter(a => a.Name == 'OrganizedBy')[0];
      this.ImageUrl = this.eventDesc.SectionProperties.filter(a => a.Name == 'OrganizerImage')[0] ? true : false;
      this.orgName = this.eventDesc.SectionProperties.filter(a => a.Name == 'Name')[0];
      this.OrganiserBox = this.eventDesc.SectionProperties.filter(a => a.Name == 'OrganiserBox')[0];
      this.ngStyle.sectionTextColor =  this.eventDesc.ModuleTextColor;
      this.ngStyle.sectionBgColor = this.eventDesc.ModuleBGColor;
    }
  }
  getStyleString(fieldName: SectionPropertyModel) {
    return this.globalService.getStyleString(fieldName);
  }
  getSectionStyleString(sectionName) {
    return this.globalService.getSectionStyleString(sectionName);
  }

}
