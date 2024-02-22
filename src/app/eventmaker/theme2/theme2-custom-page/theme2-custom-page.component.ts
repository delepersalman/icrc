import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, QueryList, Renderer2, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import CustomPageModel, { CustomPageSesstionModel, EventmakerSectionModel, SectionPropertyModel, ngStyleModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';
import Player from '@vimeo/player';
import { Theme1CustomPageComponent } from '../../theme1/theme1-custom-page/theme1-custom-page.component';
@Component({
  selector: 'theme2-custom-page',
  templateUrl: './theme2-custom-page.component.html',
  styleUrls: ['./theme2-custom-page.component.scss']
})
export class Theme2CustomPageComponent extends Theme1CustomPageComponent implements OnInit {
 
}
