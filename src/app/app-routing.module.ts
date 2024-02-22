import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EventmakerComponent } from './eventmaker/eventmaker.component';
import { ViewEventComponent } from './eventmaker/view-event/view-event.component';

const routes: Routes = [
  {
    path: 'eventmaker/:eventId',
    component: EventmakerComponent
  },
  {
    path: 'eventmaker/:eventId/:componentname',
    component: EventmakerComponent
  },
  {
    path: 'event/:eventId',
    component: ViewEventComponent
  },
  {
    path: 'event/:eventId/:componentname',
    component: ViewEventComponent
  },
  {
    path: 'checkout/:eventId',
    component: ViewEventComponent
  },
  {
    path: 'checkout/:eventId/:componentname',
    component: ViewEventComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
