import { ChangeDetectorRef, Component, Input, OnChanges, OnInit } from '@angular/core';
import { ngStyleModel, SectionPropertyModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';
import { Theme1EventCountdownComponent } from '../../theme1/theme1-event-countdown/theme1-event-countdown.component';

@Component({
  selector: 'theme2-event-countdown',
  templateUrl: './theme2-event-countdown.component.html',
  styleUrls: ['./theme2-event-countdown.component.scss']
})
export class Theme2EventCountdownComponent extends Theme1EventCountdownComponent implements OnInit {  
  
}
