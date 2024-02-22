import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';
import CustomPageModel, { CustomPageSesstionModel, EventmakerPageModel, EventmakerSectionModel, ngStyleModel, SectionPropertyModel } from '../../shared/models/event-maker/event-maker-model';;
import Player from '@vimeo/player';
@Component({
  selector: 'custom-page',
  templateUrl: './custom-page.component.html',
  styleUrls: ['./custom-page.component.scss']
})
export class CustomPageComponent implements OnInit {
  @Input() eventCustomPages: EventmakerSectionModel;
  ngStyle:ngStyleModel = new ngStyleModel();
  @Input() IsEditMode:boolean;
  @Input() themeName:string;
  @Input() websiteDetails: any;
  componentName: string;

  constructor(private globalService: GlobalService, protected _sanitizer: DomSanitizer, private cd:ChangeDetectorRef) { }

  ngOnInit(): void {
    //this.componentName = "theme"+this.themeName+"-custom-page";    
  }
  ngDoCheck(){
    if(this.themeName)
    this.componentName = `theme${this.themeName}-custom-page`;
  }
  getId(title: string) {
    if(title)
    return title.replace(/ /g, '').toLowerCase();
  }
  getModuleLoader() {
    return () =>
    import("../eventmaker.module").then(m => m.EventmakerModule);
  }
}
