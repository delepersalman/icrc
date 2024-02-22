import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FireworksComponent } from '../fireworks/fireworks.component';
import { ReceptionComponent } from '../fireworks/reception/reception.component';
import { StageComponent } from '../fireworks/stage/stage.component';
import { EventmakerComponent } from '../eventmaker/eventmaker.component';
import { ViewEventComponent } from '../eventmaker/view-event/view-event.component';

const routes: Routes = [
  {
    path: '',
    component: FireworksComponent,
    children: [
      {
        path: 'fireworks/reception',
        component: ReceptionComponent,
        pathMatch: 'full'
      },
      {
        path: 'fireworks/stage',
        component: StageComponent,
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'eventmaker/:eventId',
    component: EventmakerComponent
  }, {
    path: 'viewevent/:eventId',
    component: ViewEventComponent
  },
  {
    path: '',
    component: FireworksComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, anchorScrolling: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
