import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import CustomPageModel, { EventAgendaModel, EventCheckoutSettingModel, EventDescriptionModel, EventFAQModel, EventIntroModel, EventRefundPolicyDescriptionModel, EventSpeakerModel, EventSponsorModel, EventWebsiteModel, SectionPropertyModel, SectionPropertyRequestModel } from '../../models/event-maker/event-maker-model';
import { HttpRequestService } from '../http-request.service';
import { ECImageViewModel } from 'src/app/shared/models/ec-image/ec-image-model'
import { EventDealModel, EventTeamViewModel, TicketInfoViewModel } from '../../models/event/event-model';
import { GlobalConstants } from 'src/app/eventmaker/globals';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class EventMakerService {

  constructor(private httpRequest: HttpRequestService) {

  }

  getEventWebsiteDetail(eventId) {
    var params = new HttpParams().set("eventId", eventId);
    return this.httpRequest.get<EventWebsiteModel>("api/eventmaker/GetWebsiteDetail", params);
  }

  getEventIntro(eventId) {
    var params = new HttpParams().set("eventId", eventId);
    return this.httpRequest.get<EventIntroModel>("api/eventmaker/GetEventIntro", params);
  }
  getEventVotes(eventId) {
    var params = new HttpParams().set("eventId", eventId);
    return this.httpRequest.get<EventIntroModel>("api/eventmaker/VotesEvent", params);
  }
  getEventFavorite(eventId) {
    var params = new HttpParams().set("eventId", eventId);
    return this.httpRequest.get<EventIntroModel>("api/eventmaker/AddFavorite", params);
  }

  getEventDescription(eventId) {
    var params = new HttpParams().set("eventId", eventId);
    return this.httpRequest.get<EventDescriptionModel>("api/eventmaker/GetEventDescription", params);
  }
  getEventRefundPolicy(eventId) {
    var params = new HttpParams().set("eventId", eventId);
    return this.httpRequest.get<EventRefundPolicyDescriptionModel>("api/eventmaker/GetEventRefundPolicy", params);
  }
  getEventAgenda(eventId, TicketId = "0") {
    var params = new HttpParams().set("eventId", eventId).set("ticketId", TicketId);
    return this.httpRequest.get<EventAgendaModel>("api/eventmaker/GetEventAgenda", params);
  }
  getEventSponsor(eventId) {
    var params = new HttpParams().set("eventId", eventId);
    return this.httpRequest.get<EventSponsorModel[]>("api/eventmaker/GetEventSponsors", params);
  }

  getEventSpeaker(eventId) {
    var params = new HttpParams().set("eventId", eventId);
    return this.httpRequest.get<EventSpeakerModel[]>("api/eventmaker/GetEventSpeakers", params);
  }

  getEventFAQ(eventId) {
    var params = new HttpParams().set("eventId", eventId);
    return this.httpRequest.get<EventFAQModel[]>("api/eventmaker/GetEventFAQ", params);
  }

  getEventGallery(eventId) {
    var params = new HttpParams().set("eventId", eventId);
    return this.httpRequest.get<ECImageViewModel[]>("api/eventmaker/GetEventGallery", params);
  }

  getEventTickets(eventId, promoCode?: string, isAccessCodeFromUrl?: any) {
    var params = new HttpParams().set("eventId", eventId);
    if (promoCode) {
      params = params.append("promoCode", promoCode);
      params.append('isAccessCodeFromUrl', isAccessCodeFromUrl);
    }     
    return this.httpRequest.get<TicketInfoViewModel[]>("api/eventmaker/GetEventTickets?isAccessCodeFromUrl="+isAccessCodeFromUrl, params);
  }

  getEventDeals(eventId) {
    var params = new HttpParams().set("eventId", eventId);
    return this.httpRequest.get<EventDealModel[]>("api/eventmaker/GetEventDeals", params);
  }

  getEventTeams(eventId) {
    var params = new HttpParams().set("eventId", eventId);
    return this.httpRequest.get<EventTeamViewModel[]>("api/eventmaker/GetEventTeams", params);
  }
  getEventPurchaseInfo(eventId) {
    var params = new HttpParams().set("eventId", eventId)
    return this.httpRequest.get<EventCheckoutSettingModel>("api/eventmaker/GetPurchaseInfo", params);
  }
  saveWebsiteDetails(data) {
    data.Active = true;
    return this.httpRequest.post<EventWebsiteModel>("api/eventmaker/SaveEventWebsiteDetail", data);
  }

  saveCustomPage(data) {
    return this.httpRequest.post<CustomPageModel>("api/eventmaker/SaveCustomPageInfo", data);
  }
  resetAllSetting(websiteDetail: EventWebsiteModel) {
    return this.httpRequest.post<boolean>("api/eventmaker/ResetSetting?eventId=" + websiteDetail.Event.EventId + "&WebsiteDetailId=" + websiteDetail.WebsiteDetailId, { eventId: websiteDetail.Event.EventId, WebsiteDetailId: websiteDetail.WebsiteDetailId });
  }
  saveWebComponentOrder(data) {
    return this.httpRequest.post<EventWebsiteModel>("api/eventmaker/SaveWebsiteComponents", data);
  }
  saveSectionData(data) {
    return this.httpRequest.post<SectionPropertyRequestModel>("api/eventmaker/SaveSectionProperties", data);
  }
  saveEventDescription(data) {
    return this.httpRequest.post<EventDescriptionModel>("api/eventmaker/SaveEventDescription", data);
  }
  deleteCustomPage(data) {
    return this.httpRequest.post<CustomPageModel>("api/eventmaker/DeleteCustomSection", data);
  }
  getSetionProperties(sectionId, IsCustom, WebsiteDetailId, ticketId=0, IsCustomizationEnabledForData =0) {
    var params = new HttpParams().set("sectionId", sectionId)
    .set("IsCustom", IsCustom)
    .set("WebsiteId", WebsiteDetailId)
    .set("ticketId", ticketId.toString())
    .set("IsCustomizationEnabledForData", IsCustomizationEnabledForData.toString());;
    return this.httpRequest.get<SectionPropertyModel[]>("api/eventmaker/GetSectionProperties", params);
  }
  sendContactusEmail(data) {
    return this.httpRequest.post<boolean>("api/eventmaker/SendContactEmail", data);
  }
  saveCustomFieldData(data) {
    return this.httpRequest.post<boolean>("api/eventmaker/SaveCustomFieldData", data);
  }
  MapComponentBaseData<T>(sectionData: any, eventCustomPages, FontStyleList:any[]): any {
    sectionData.SectionProperties = eventCustomPages.EventmakerPagePropertyDesigns;
    sectionData.EditMode = GlobalConstants.EditMode;
    sectionData.ComponentId = eventCustomPages.PageId;
    sectionData.ModuleBGColor = eventCustomPages.BGColor;
    sectionData.ModuleTextColor = eventCustomPages.TextColor;
    sectionData.BGImage = eventCustomPages.BGImage;
    sectionData.ModuleBGImageId = eventCustomPages.BGImageId;
    sectionData.FontStyleList = FontStyleList;
    sectionData.SectionBGColor = eventCustomPages.SectionBGColor;
    sectionData.SectionBGImage = eventCustomPages.SectionBGImage;
    sectionData.SectionBGImageId = eventCustomPages.SectionBGImageId;
    sectionData.SectionPadding = eventCustomPages.SectionPadding;
    sectionData.SectionBorder = eventCustomPages.SectionBorder;
    sectionData.BannerSectionPadding = eventCustomPages.BannerSectionPadding;
    sectionData.BannerSectionBorder = eventCustomPages.BannerSectionBorder;
    sectionData.ModuleName = eventCustomPages.PageSystemName;
    sectionData.EventmakerWebsiteComponentId = eventCustomPages.EventmakerWebsiteComponentId;
    return sectionData;
  }
}
