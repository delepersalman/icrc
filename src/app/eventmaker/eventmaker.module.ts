import { ComponentFactoryResolver, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { EventmakerComponent } from './eventmaker.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { EventIntroComponent } from './event-intro/event-intro.component';
import { EventDescriptionComponent } from './event-description/event-description.component';
import { EventTicketsComponent } from './event-tickets/event-tickets.component';
import { EventSpeakersComponent } from './event-speakers/event-speakers.component';
import { EventSponsersComponent } from './event-sponsers/event-sponsers.component';
import { EventWorkshopsComponent } from './event-workshops/event-workshops.component';
import { EventAgendaComponent } from './event-agenda/event-agenda.component';
import { EventTeamsComponent } from './event-teams/event-teams.component';
import { EventGallaryComponent } from './event-gallary/event-gallary.component';
import { EventFaqComponent } from './event-faq/event-faq.component';
import { EventCountdownComponent } from './event-countdown/event-countdown.component';
import { EventContactusComponent } from './event-contactus/event-contactus.component';
import { Theme1EventDescriptionComponent } from './theme1/theme1-event-description/theme1-event-description.component';
import { Theme1EventAgendaComponent } from './theme1/theme1-event-agenda/theme1-event-agenda.component';
import { Theme1EventContactusComponent } from './theme1/theme1-event-contactus/theme1-event-contactus.component';
import { Theme1EventCountdownComponent } from './theme1/theme1-event-countdown/theme1-event-countdown.component';
import { Theme1EventFaqComponent } from './theme1/theme1-event-faq/theme1-event-faq.component';
import { Theme1EventGallaryComponent } from './theme1/theme1-event-gallary/theme1-event-gallary.component';
import { Theme1EventIntroComponent } from './theme1/theme1-event-intro/theme1-event-intro.component';
import { Theme1EventSpeakersComponent } from './theme1/theme1-event-speakers/theme1-event-speakers.component';
import { Theme1EventSponsersComponent } from './theme1/theme1-event-sponsers/theme1-event-sponsers.component';
import { Theme1EventTeamsComponent } from './theme1/theme1-event-teams/theme1-event-teams.component';
import { Theme1EventTicketsComponent } from './theme1/theme1-event-tickets/theme1-event-tickets.component';
import { Theme1EventWorkshopsComponent } from './theme1/theme1-event-workshops/theme1-event-workshops.component';
import { Theme1EventFooterComponent } from './theme1/theme1-event-footer/theme1-event-footer.component';
import { Theme1EventHeaderComponent } from './theme1/theme1-event-header/theme1-event-header.component';
import { SharedModule } from 'src/app/shared/shared-module/shared-module';
import { PageSettingModalComponent } from './page-setting-modal/page-setting-modal.component';
import { TicketSettingModalComponent } from './ticket-setting-modal/ticket-setting-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { SideMenuComponent } from './side-menu/side-menu.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CustomPageComponent } from './custom-page/custom-page.component';
import { AddNewPageComponent } from './custom-page/add-new-page/add-new-page.component';
import { ViewEventComponent } from './view-event/view-event.component';
import { EventPageViewComponent } from './event-page-view/event-page-view.component';
import { A11yModule } from '@angular/cdk/a11y';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { OrderByPipe } from '../shared/pipes/common.pipe';
import { BaseModule } from "./base-module";
import { DynamicSelectorComponent } from './dynamic.selector.component';
import { ComponentSettingComponent } from './component-setting/component-setting.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CustomSectionComponent } from './component-setting/custom-section/custom-section.component';
import { MatInputModule } from '@angular/material/input';
import { EventRefundPolicyComponent } from './event-refund-policy/event-refund-policy.component';
import { EditPrivacyPolicyComponent } from './editSettings/edit-privacy-policy/edit-privacy-policy.component';
import { AgmCoreModule } from '@agm/core';
import { environment } from 'src/environments/environment';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { EditFaqComponent } from './EditSettings/edit-faq/edit-faq.component';
import { MatTableModule } from '@angular/material/table';
import { ViewModeDirective } from './EditSettings/editable/view-mode.directive';
import { EditModeDirective } from './EditSettings/editable/edit-mode.directive';
import { EditableOnEnterDirective } from './EditSettings/editable/editable-on-enter.directive';
import { EditableComponent } from './EditSettings/editable/editable.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { DesignerToolbarComponent } from './component-setting/designer-toolbar/designer-toolbar.component';
import { SectionDesignerToolbarComponent } from './component-setting/section-designer-toolbar/section-designer-toolbar.component';
import { SectionBannerDesignerToolbarComponent } from './component-setting/section-banner-designer-toolbar/section-banner-designer-toolbar.component';
import { ButtonDesignerToolbarComponent } from './component-setting/button-designer-toolbar/button-designer-toolbar.component';
import { EventOrganiserComponent } from './event-organiser/event-organiser.component';
import { Them1EventOrganiserComponent } from './theme1/them1-event-organiser/them1-event-organiser.component';
import { Theme1EventRefundPolicyComponent } from './theme1/theme1-event-refund-policy/theme1-event-refund-policy.component';
//import { Theme2EventIntroComponent } from './theme2/theme2-event-intro/theme2-event-intro.component';
import { EditButtonLabelComponent } from './component-setting/edit-button-label/edit-button-label.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { CheckoutAttendeeComponent } from './checkout-attendee/checkout-attendee.component';
import { Theme1CheckoutAttendeeComponent } from './theme1/theme1-checkout-attendee/theme1-checkout-attendee.component';
import { CheckoutPageModalComponent } from './checkout-attendee/checkout-page-modal/checkout-page-modal.component';
import { VideoComponent } from './video/video.component';
import { Theme1VideoComponent } from './theme1/theme1-video/theme1-video.component';
import { MatCardModule } from '@angular/material/card';
import { ContactUsModalComponent } from './contact-us-modal/contact-us-modal.component';
import { AddToCalendarModalComponent } from './add-to-calendar-modal/add-to-calendar-modal.component';
import { ShareEventModalComponent } from './share-event-modal/share-event-modal.component';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { ConfirmationSectionComponent } from './confirmation-section/confirmation-section.component';
import { Theme1ConfirmationSectionComponent } from './theme1/theme1-confirmation-section/theme1-confirmation-section.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ViewAgendaModalComponent } from './event-tickets/view-agenda-modal/view-agenda-modal.component';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { EventMapsComponent } from './event-maps/event-maps.component';
import { CheckoutPageModalConfirmComponent } from './checkout-attendee/checkout-page-modal/checkout-page-modal-confirm/checkout-page-modal-confirm.component';
import { EditEventFormatModelComponent } from './component-setting/edit-event-format-model/edit-event-format-model.component';
// import { Theme2Module } from "./theme2/Theme2.module";
import { Theme2EventTicketsComponent } from './theme2/theme2-event-tickets/theme2-event-tickets.component';
import { Theme2EventAgendaComponent } from './theme2/theme2-event-agenda/theme2-event-agenda.component';
import { Theme2EventFaqComponent } from './theme2/theme2-event-faq/theme2-event-faq.component';
import { Theme2EventContactusComponent } from './theme2/theme2-event-contactus/theme2-event-contactus.component';
import { Theme2EventFooterComponent } from './theme2/theme2-event-footer/theme2-event-footer.component';
import { Theme2EventGallaryComponent } from './theme2/theme2-event-gallary/theme2-event-gallary.component';
import { Theme2EventHeaderComponent } from './theme2/theme2-event-header/theme2-event-header.component';
import { Theme2EventRefundPolicyComponent } from './theme2/theme2-event-refund-policy/theme2-event-refund-policy.component';
import { Theme2EventTeamsComponent } from './theme2/theme2-event-teams/theme2-event-teams.component';
import { Theme2EventSpeakersComponent } from './theme2/theme2-event-speakers/theme2-event-speakers.component';
import { Theme2EventSponsersComponent } from './theme2/theme2-event-sponsers/theme2-event-sponsers.component';
import { Theme2EventIntroComponent } from './theme2/theme2-event-intro/theme2-event-intro.component';
import { Theme2EventCountdownComponent } from './theme2/theme2-event-countdown/theme2-event-countdown.component';
import { Theme2EventDescriptionComponent } from './theme2/theme2-event-description/theme2-event-description.component';
import { Theme2EventOrganiserComponent } from './theme2/theme2-event-organiser/theme2-event-organiser.component';
import { Theme2CheckoutAttendeeComponent } from './theme2/theme2-checkout-attendee/theme2-checkout-attendee.component';
import { Theme2ConfirmationSectionComponent } from './theme2/theme2-confirmation-section/theme2-confirmation-section.component';
import { Theme1CustomPageComponent } from './theme1/theme1-custom-page/theme1-custom-page.component';
import { Theme2CustomPageComponent } from './theme2/theme2-custom-page/theme2-custom-page.component';
import { Theme2VideoComponent } from './theme2/theme2-video/theme2-video.component';
import { Theme2CheckoutPaymentComponent } from './theme2/theme2-checkout-payment/theme2-checkout-payment.component';
import { Theme1CheckoutPaymentComponent } from './theme1/theme1-checkout-payment/theme1-checkout-payment.component';
import { CheckoutPaymentComponent } from './checkout-payment/checkout-payment.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { AddAnchorLinkComponent } from './component-setting/add-anchor-link/add-anchor-link.component';
import { CustomQuestionComponent } from './component-setting/custom-section/custom-question/custom-question.component';
import { Theme2IntroRendorComponent } from './theme2/theme2-intro-rendor/theme2-intro-rendor.component';
@NgModule({
  declarations: [
    EventmakerComponent,
    HeaderComponent,
    FooterComponent,
    EventIntroComponent,
    EventDescriptionComponent,
    EventTicketsComponent,
    EventSpeakersComponent,
    EventSponsersComponent,
    EventWorkshopsComponent,
    EventAgendaComponent,
    EventTeamsComponent,
    EventGallaryComponent,
    EventFaqComponent,
    EventCountdownComponent,
    EventContactusComponent,
    Theme1EventDescriptionComponent,
    Theme1EventAgendaComponent,
    Theme1EventContactusComponent,
    Theme1EventCountdownComponent,
    Theme1EventFaqComponent,
    Theme1EventGallaryComponent,
    Theme1EventIntroComponent,
    Theme1EventSpeakersComponent,
    Theme1EventSponsersComponent,
    Theme1EventTeamsComponent,
    Theme1EventTicketsComponent,
    Theme1EventWorkshopsComponent,
    Theme1EventFooterComponent,
    Theme1EventHeaderComponent,
    PageSettingModalComponent,
    TicketSettingModalComponent,
    SideMenuComponent,
    CustomPageComponent,
    AddNewPageComponent,
    ViewEventComponent,
    EventPageViewComponent,
    DynamicSelectorComponent,
    ComponentSettingComponent,
    CustomSectionComponent,
    EventRefundPolicyComponent,
    EditPrivacyPolicyComponent,
    EditFaqComponent,
    ViewModeDirective,
    EditModeDirective,
    EditableOnEnterDirective,
    EditableComponent,
    DesignerToolbarComponent,
    SectionDesignerToolbarComponent,
    SectionBannerDesignerToolbarComponent,
    ButtonDesignerToolbarComponent,
    EventOrganiserComponent,
    Them1EventOrganiserComponent,
    Theme1EventRefundPolicyComponent,
    Theme1CustomPageComponent,
    //Theme2EventIntroComponent,
    EditButtonLabelComponent,
    CheckoutAttendeeComponent,
    Theme1CheckoutAttendeeComponent,
    CheckoutPageModalComponent,
    ContactUsModalComponent,
    AddToCalendarModalComponent,
    ShareEventModalComponent,
    VideoComponent,
    Theme1VideoComponent,
    ConfirmationSectionComponent,
    Theme1ConfirmationSectionComponent,
    ViewAgendaModalComponent,
    EventMapsComponent,
    CheckoutPageModalConfirmComponent,
    EditEventFormatModelComponent,
    Theme2EventAgendaComponent,
    Theme2EventFaqComponent,
    Theme2EventContactusComponent,
    Theme2EventFooterComponent,
    Theme2EventGallaryComponent,
    Theme2EventHeaderComponent,
    Theme2EventRefundPolicyComponent,
    Theme2EventTeamsComponent,
    Theme2EventSpeakersComponent,
    Theme2EventSponsersComponent,
    Theme2EventTicketsComponent,
    Theme2EventIntroComponent,
    Theme2EventOrganiserComponent,
    Theme2ConfirmationSectionComponent,
    Theme2CheckoutAttendeeComponent,
    Theme2EventCountdownComponent,
    Theme2EventDescriptionComponent,
    Theme2CustomPageComponent,
    Theme2VideoComponent,
    Theme2CheckoutPaymentComponent,
    Theme1CheckoutPaymentComponent,    
    CheckoutPaymentComponent,
    AddAnchorLinkComponent,
    CustomQuestionComponent,
    Theme2IntroRendorComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    MatDialogModule,
    MatSnackBarModule,
    A11yModule,
    CdkAccordionModule,
    ClipboardModule,
    CdkStepperModule,
    CdkTableModule,
    CdkTreeModule,
    DragDropModule,
    MatCheckboxModule,
    MatInputModule,
    MatTableModule,
    CKEditorModule,
    MatButtonToggleModule,
    MatExpansionModule,
    MatCardModule,
    HttpClientModule,
    Ng2TelInputModule,
    YouTubePlayerModule,
   // Theme2Module,
    MatTooltipModule,
    AgmCoreModule.forRoot({
      apiKey: environment.APIKEY
    })
  ],
  exports: [
    MatFormFieldModule,
    //Theme2Module
  ],
  entryComponents: [
    EventPageViewComponent,
    EventIntroComponent,
    YouTubePlayerModule,
    EventDescriptionComponent,
    EventTicketsComponent,
    EventSpeakersComponent,
    EventSponsersComponent,
    EventWorkshopsComponent,
    EventAgendaComponent,
    EventTeamsComponent,
    EventGallaryComponent,
    EventFaqComponent,
    EventCountdownComponent,
    EventContactusComponent, EditPrivacyPolicyComponent, EditFaqComponent,
    AddNewPageComponent, HeaderComponent, Theme1EventHeaderComponent,
    EventRefundPolicyComponent, EventOrganiserComponent,
    Theme1EventDescriptionComponent,
    Theme1EventAgendaComponent,
    Theme1EventContactusComponent,
    Theme1EventCountdownComponent,
    Theme1EventFaqComponent,
    Theme1EventGallaryComponent,
    Theme1EventIntroComponent,
    Theme1EventSpeakersComponent,
    Theme1EventSponsersComponent,
    Theme1EventTeamsComponent,
    Theme1EventTicketsComponent,
    Theme1EventWorkshopsComponent,
    Theme1EventFooterComponent,
    Theme1EventHeaderComponent,
    Them1EventOrganiserComponent,
    Theme1EventRefundPolicyComponent,
    //Theme2EventIntroComponent,
    CheckoutAttendeeComponent,
    Theme1CheckoutAttendeeComponent,
    Theme1CustomPageComponent,
    VideoComponent,
    Theme1VideoComponent,
    ConfirmationSectionComponent,
    Theme1ConfirmationSectionComponent,
    ViewAgendaModalComponent,
    EventMapsComponent,
    Theme2EventAgendaComponent,
    Theme2EventFaqComponent,
    Theme2EventContactusComponent,
    Theme2EventFooterComponent,
    Theme2EventGallaryComponent,
    Theme2EventHeaderComponent,
    Theme2EventRefundPolicyComponent,
    Theme2EventTeamsComponent,
    Theme2EventSpeakersComponent,
    Theme2EventSponsersComponent,
    Theme2EventTicketsComponent,
    Theme2EventIntroComponent,
    Theme2EventOrganiserComponent,
    Theme2ConfirmationSectionComponent,
    Theme2CheckoutAttendeeComponent,
    Theme2EventCountdownComponent,
    Theme2EventDescriptionComponent,
    Theme2CustomPageComponent,
    Theme2VideoComponent,
    Theme2CheckoutPaymentComponent,
    Theme1CheckoutPaymentComponent,
    CheckoutPaymentComponent,
    Theme2IntroRendorComponent
  ]
})
export class EventmakerModule extends BaseModule {
  dynamicComponents = [EventIntroComponent, EventIntroComponent,
    EventDescriptionComponent,
    EventTicketsComponent,
    EventSpeakersComponent,
    EventSponsersComponent,
    EventWorkshopsComponent,
    EventAgendaComponent,
    EventTeamsComponent,
    EventGallaryComponent,
    EventFaqComponent,
    EventCountdownComponent,
    EventContactusComponent, EditPrivacyPolicyComponent, EditFaqComponent,
    AddNewPageComponent, HeaderComponent, Theme1EventHeaderComponent,
    EventRefundPolicyComponent, EventOrganiserComponent,
    Theme1EventDescriptionComponent,
    Theme1EventAgendaComponent,
    Theme1EventContactusComponent,
    Theme1EventCountdownComponent,
    Theme1EventFaqComponent,
    Theme1EventGallaryComponent,
    Theme1EventIntroComponent,
    Theme1EventSpeakersComponent,
    Theme1EventSponsersComponent,
    Theme1EventTeamsComponent,
    Theme1EventTicketsComponent,
    Theme1EventWorkshopsComponent,
    Theme1EventFooterComponent,
    Theme1EventHeaderComponent,
    Them1EventOrganiserComponent,
    Theme1EventRefundPolicyComponent,
    //Theme2EventIntroComponent,
    CheckoutAttendeeComponent,
    Theme1CheckoutAttendeeComponent,
    VideoComponent,
    Theme1VideoComponent,
    ConfirmationSectionComponent,
    Theme1ConfirmationSectionComponent,
    Theme1CustomPageComponent,
    ViewAgendaModalComponent,
    EventMapsComponent,
    Theme1EventHeaderComponent,
    Theme2EventAgendaComponent,
    Theme2EventFaqComponent,
    Theme2EventContactusComponent,
    Theme2EventFooterComponent,
    Theme2EventGallaryComponent,
    Theme2EventHeaderComponent,
    Theme2EventRefundPolicyComponent,
    Theme2EventTeamsComponent,
    Theme2EventSpeakersComponent,
    Theme2EventSponsersComponent,
    Theme2EventTicketsComponent,
    Theme2EventIntroComponent,
    Theme2EventOrganiserComponent,
    Theme2ConfirmationSectionComponent,
    Theme2CheckoutAttendeeComponent,
    Theme2EventCountdownComponent,
    Theme2EventDescriptionComponent,
    Theme2CustomPageComponent,
    Theme2VideoComponent    ,
    Theme2CheckoutPaymentComponent,
    Theme1CheckoutPaymentComponent,
    CheckoutPaymentComponent,
    Theme2IntroRendorComponent
  ];

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
  }

}
