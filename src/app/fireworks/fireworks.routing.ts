
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BackStageComponent } from './backstage/backstage.component';
import { CustomRoomComponent } from './customroom/customroom.component';
import { ExpoComponent } from './expo/expo.component';
import { FireworksComponent } from './fireworks.component';
import { HandoutsComponent } from './handouts/handouts.component';
import { KeynoteComponent } from './keynote/keynote.component';
import { NetworkingComponent } from './networking/networking.component';
import { PrivateRoomComponent } from './privateroom/privateroom.component';
import { ReceptionComponent } from './reception/reception.component';
import { SessionComponent } from './session/session.component';
import { DeactivateGuard } from './shared/guards/deactivate-guards';
import { StageComponent } from './stage/stage.component';
import { JoinRoomComponent } from './join-room/join-room.component';
import { GreenRoomComponent } from './greenroom/greenroom.component';
import { JoinBreakoutComponent } from './breakout/join-breakout/join-breakout.component';
import { ControllRoomComponent } from './admin/controll-room/controll-room.component';

const routes: Routes = [
  {
    path: 'fireworks/:{eventId}/:{eventAccessToken}',
    component: FireworksComponent,
    children: [
      {
        path: 'backstage',
        component: BackStageComponent,
        //canActivate: [AuthGuard]
      },
      {
        path: 'reception',
        component: ReceptionComponent,
        canDeactivate: [DeactivateGuard]
      },
      {
        path: 'stage',
        component: StageComponent,
        canDeactivate: [DeactivateGuard]
      },
      {
        path: 'networking',
        component: NetworkingComponent,
        canDeactivate: [DeactivateGuard]
      },
      {
        path: 'session',
        component: SessionComponent,
        canDeactivate: [DeactivateGuard]
      },
      {
        path: 'warroom',
        component: ControllRoomComponent,
        canDeactivate: [DeactivateGuard]
      },
      { path: 'networking/:{roomname}/:{roomid}/join', component: JoinRoomComponent, canDeactivate: [DeactivateGuard], runGuardsAndResolvers: 'paramsOrQueryParamsChange' },
      { path: 'session/:{roomname}/:{roomid}/join', component: JoinRoomComponent, canDeactivate: [DeactivateGuard], runGuardsAndResolvers: 'paramsOrQueryParamsChange' },
      { path: 'expo/:{roomname}/:{roomid}/join', component: JoinRoomComponent, canDeactivate: [DeactivateGuard], runGuardsAndResolvers: 'paramsOrQueryParamsChange' },
      { path: 'customroom/:{roomname}/:{roomid}/join', component: JoinRoomComponent, canDeactivate: [DeactivateGuard], runGuardsAndResolvers: 'paramsOrQueryParamsChange' },
      { path: 'breakout/:{refRoomId}/:{roomname}/:{roomid}', component: JoinBreakoutComponent, canDeactivate: [DeactivateGuard], runGuardsAndResolvers: 'paramsOrQueryParamsChange' },
      {
        path: 'expo',
        component: ExpoComponent,
        canDeactivate: [DeactivateGuard]
      },
      {
        path: 'customroom',
        component: CustomRoomComponent,
        canDeactivate: [DeactivateGuard]
      },
      {
        path: 'keynoteroom',
        component: KeynoteComponent,
        canDeactivate: [DeactivateGuard]
      },
      {
        path: 'handouts',
        component: HandoutsComponent,
        canDeactivate: [DeactivateGuard]
      },
      {
        path: 'privateroom',
        component: PrivateRoomComponent,
        canDeactivate: [DeactivateGuard]
      },
      {
        path: 'greenroom',
        component: GreenRoomComponent
      },
      {
        path: 'lobby',
        component: ReceptionComponent,
        canDeactivate: [DeactivateGuard]
      },
    ]
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class FireworksRoutingModule { }
