import { HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { HttpRequestService } from '../http-request.service';
import { PromoCodeResponseModel, TicketLockRequestModel, TicketLockResponseModel } from '../../models/event/event-model';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class EventCheckoutService {
  constructor(private httpRequest: HttpRequestService) { }
  onPromoCodeApplied: EventEmitter<any> = new EventEmitter<any>();
  postTickets(data) {
    var d = JSON.stringify(data);
    return this.httpRequest.postAsCompleteUrl<TicketLockResponseModel>(environment.domainProxyUrl + "/TicketPurchase/LockTickets", { json: d });
  }

  checkPromoCode(eventId: number, code: string) {
    return this.httpRequest.getAsCompleteUrl<PromoCodeResponseModel>(environment.domainProxyUrl + `/eventmanagement/CheckAccessPromocode?eventId=${eventId}&promoCode=${code}`);
  }

  changePromoCode(eventId: number, code: string) {
    return this.httpRequest.getAsCompleteUrl<PromoCodeResponseModel>(environment.domainProxyUrl + `/eventmanagement/CheckAccessPromocode?eventId=${eventId}&promoCode=${code}`);
  }
}