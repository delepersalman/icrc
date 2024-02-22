import { ChangeDetectorRef, Component, Input, OnInit, QueryList, Renderer2, ViewChildren, ViewContainerRef } from '@angular/core';
import { ngStyleModel, SectionPropertyModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { EventTeamModel, EventTeamViewModel } from 'src/app/shared/models/event/event-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';
import { Theme1EventTeamsComponent } from '../../theme1/theme1-event-teams/theme1-event-teams.component';

@Component({
  selector: 'theme2-event-teams',
  templateUrl: './theme2-event-teams.component.html',
  styleUrls: ['./theme2-event-teams.component.scss']
})
export class Theme2EventTeamsComponent extends Theme1EventTeamsComponent implements OnInit {
  
}
