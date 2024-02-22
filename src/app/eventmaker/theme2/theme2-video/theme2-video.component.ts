import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, QueryList, Renderer2, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CustomPageSesstionModel, ngStyleModel, SectionPropertyModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';
import Player from '@vimeo/player';
import { Theme1VideoComponent } from '../../theme1/theme1-video/theme1-video.component';
@Component({
  selector: 'theme2-video',
  templateUrl: './theme2-video.component.html',
  styleUrls: ['./theme2-video.component.scss']
})
export class Theme2VideoComponent extends Theme1VideoComponent implements OnInit {
  
}