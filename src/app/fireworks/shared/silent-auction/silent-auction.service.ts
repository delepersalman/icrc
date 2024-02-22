import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, publish } from 'rxjs/operators';
import { ApiResponse } from 'src/app/shared/models/api.response.model';
import { SilentAuctionModel } from 'src/app/shared/models/silent-auction-model';
import { HttpRequestService } from '../../../shared/services/http-request.service';
import { VirtualEventService } from '../../services/virtualevent.service';


@Injectable()
export class SilentAuctionService {

  public eventAccessToken: string;
  public browserSessionId: string;

  constructor(private virtualEventService: VirtualEventService) { }

  public getSilentAuctions(eventId: string): Observable<ApiResponse<SilentAuctionModel[]>> {
    return this.virtualEventService.getSilentAuctions(eventId);
  }
}
