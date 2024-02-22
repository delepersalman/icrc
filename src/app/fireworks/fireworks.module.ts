import { NgModule, CUSTOM_ELEMENTS_SCHEMA, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { CommonModule } from '@angular/common';

import { MomentModule, TimeAgoPipe, CalendarPipe, FromUnixPipe } from 'ngx-moment';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FireworksComponent } from './fireworks.component';
import { ReceptionComponent } from './reception/reception.component';
import { StageComponent } from './stage/stage.component';
import { NetworkingComponent } from './networking/networking.component';
import { SessionComponent } from './session/session.component';
import { ExpoComponent } from './expo/expo.component';
import { KeynoteComponent } from './keynote/keynote.component';
import { CustomRoomComponent } from './customroom/customroom.component';
import { HandoutsComponent } from './handouts/handouts.component';
import { ChatComponent } from './shared/chat/chat.component';
import { BackStageComponent } from './backstage/backstage.component';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';
import { PollDialogComponent } from './shared/poll-dialog/poll-dialog.component';
import { HandoutsDialogComponent } from './shared/handouts-dialog/handouts-dialog.component';
import { SilentAuctionComponent } from './shared/silent-auction/silent-auction.component';
import { NotificationsDialogComponent } from './shared/notifications-dialog/notifications-dialog.component';
import { MediaSettingDialogComponent } from './shared/media-setting-dialog/media-setting-dialog.component';
import { UserinfoDialogComponent } from './shared/userinfo-dialog/userinfo-dialog.component';
import { UserIdleModule } from 'angular-user-idle';

import { FireworksRoutingModule } from './fireworks.routing';

import { CustomRoomfilterPipe } from './shared/customRoomfilter.pipe';

import { HttpErrorInterceptor } from '../shared/interceptors/http-error-interceptor'
import { UrlSafePipe } from '../shared/pipes/urlsafe.pipe';
import { PeopleComponent } from './shared/people/people.component';
import { HandoutsDocuementPreviewDialogComponent } from './shared/filepreview-dialog/filepreview-dialog.component';
import { RoomHandoutsComponent } from './shared/room-handouts/room-handouts.component';
import { SearchPipe, OrderByPipe, MyselfFirstPipe, filterAttendeePipe } from '../shared/pipes/common.pipe';
import { UserIdleDialogComponent } from './shared/user-idle-dialog/user-idle-dialog.component';
import { SharedFireworksComponentService } from './services/shared.service';
import { VirtualEventService } from './services/virtualevent.service';
import { AuthInterceptor } from '../shared/interceptors/auth.interceptor';
import { MessageService } from '../shared/services/message.service';
import { HttpErrorHandler } from '../shared/services/http-error-handler.service';
import { DeactivateGuard } from './shared/guards/deactivate-guards';
import { PrivateRoomComponent } from './privateroom/privateroom.component';
import { AuthGuard } from '../auth/auth.guard';
import { FwRoomComponent } from './shared/fw-room/fw-room.component';
import { JoinRoomComponent } from './join-room/join-room.component';
import { GreenRoomComponent } from './greenroom/greenroom.component';
import { CreateBreakoutRoomComponent } from './breakout/create-breakout-room/create-breakout-room.component';
import { LinkyModule } from 'angular-linky';
import { AttendeeDialogComponent } from './shared/attendee-dialog/attendee-dialog.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { environment } from '../../environments/environment';
import { FilterStatusPipe, PeopleSearchPipe } from '../fireworks/shared/people/people.search.pipe'
import { HandoutsSearchPipe } from '../fireworks/shared/handouts.search.pipe';
import { ManageAttendeeComponent } from './manage-attendee/manage-attendee.component';
import { ManageRoomListComponent } from './shared/manage-room-list/manage-room-list.component'
import { MemberRoleFilterPipe } from '../fireworks/shared/fw-room/member-Role.filter.pipe';
import { JoinBreakoutComponent } from './breakout/join-breakout/join-breakout.component';
import { NoRoomAvailableComponent } from './shared/no-room-available/no-room-available.component'
import { CountdownModule } from 'ngx-countdown';
import { ControllRoomComponent } from './admin/controll-room/controll-room.component';
import { SharedRoomActionService } from '../fireworks/services/room.action.service';
import { SplashScreenComponent } from './shared/splash-screen/splash-screen.component';
import { ThemingService } from './shared/_theme/theme.service';
import { SponsorsComponent } from './shared/sponsors/sponsors.component';
import { SpeakersComponent } from './shared/speakers/speakers.component';
import { SchedulesComponent } from './shared/schedules/schedules.component';
import { AttendeeInfoComponent } from './shared/people/attendee-info/attendee-info.component';
import { MessageComponent } from '../shared/message/message.component';
import { RoomCloseCountDownComponent } from './shared/fw-room/room-close-count-down/room-close-count-down.component';
import { RoomBoxComponent } from './lobby/room-box/room-box.component';
import { PagerService } from './services/pager.service';
import { LobbyComponent } from './lobby/lobby.component';
import { SilentAuctionService } from './shared/silent-auction/silent-auction.service';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    FireworksComponent,
    ReceptionComponent,
    StageComponent,
    NetworkingComponent,
    SessionComponent,
    ExpoComponent,
    KeynoteComponent,
    CustomRoomComponent,
    HandoutsComponent,
    ChatComponent,
    BackStageComponent,
    ConfirmDialogComponent,
    PollDialogComponent,
    HandoutsDialogComponent,
    SilentAuctionComponent,
    NotificationsDialogComponent,
    UserinfoDialogComponent,
    MediaSettingDialogComponent,
    HandoutsDocuementPreviewDialogComponent,
    RoomHandoutsComponent,
    UrlSafePipe,
    SearchPipe,
    OrderByPipe,
    PeopleComponent,
    UserIdleDialogComponent,
    PrivateRoomComponent,
    FwRoomComponent,
    JoinRoomComponent,
    GreenRoomComponent,
    CreateBreakoutRoomComponent,
    CustomRoomfilterPipe,
    AttendeeDialogComponent,
    PeopleSearchPipe,
    FilterStatusPipe,
    HandoutsSearchPipe,
    MemberRoleFilterPipe,
    ManageAttendeeComponent,
    ManageRoomListComponent,
    MyselfFirstPipe,
    filterAttendeePipe,
    JoinBreakoutComponent,
    NoRoomAvailableComponent,
    ControllRoomComponent,
    SplashScreenComponent,
    SponsorsComponent,
    SpeakersComponent,
    SchedulesComponent,
    AttendeeInfoComponent,
    RoomCloseCountDownComponent,
    RoomBoxComponent,
    LobbyComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    MomentModule.forRoot({
      relativeTimeThresholdOptions: {
        'm': 59
      }
    }),
    LinkyModule,
    FireworksRoutingModule,
    FlexLayoutModule,
    // Optionally you can set time for `idle`, `timeout` and `ping` in seconds.
    // Default values: `idle` is 300 (5 minutes), `timeout` is 120 (2 minutes)
    // and `ping` is 60 (1 minutes).
    UserIdleModule.forRoot({ idle: environment.idleTimeout, timeout: 120, ping: 60 }),
    InfiniteScrollModule,
    LoggerModule.forRoot({
      serverLoggingUrl: environment.apiBaseUrl + 'fireworks/virtualEvent/FireworksLog',
      level: NgxLoggerLevel.DEBUG, serverLogLevel: NgxLoggerLevel.INFO
    }),
    CountdownModule
  ],

  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {
      provide: APP_INITIALIZER,
      useFactory: (themingService: ThemingService) => () => themingService.initialize(),
      multi: true,
      deps: [ThemingService],
    },

    UrlSafePipe,
    OrderByPipe,
    SearchPipe,
    TimeAgoPipe,
    CalendarPipe,
    FromUnixPipe,
    MessageService,
    HttpErrorHandler,
    SharedFireworksComponentService,
    VirtualEventService,
    SharedRoomActionService,
    DeactivateGuard,
    AuthGuard,
    CountdownModule,
    PagerService,
    SilentAuctionService
  ]
})
export class FireworksModule { }



