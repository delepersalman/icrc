import { Injectable } from '@angular/core';
import { SharedFireworksComponentService } from './shared.service';

@Injectable()
export class SharedRoomActionService {

  sharedService: SharedFireworksComponentService = null;

  constructor(service: SharedFireworksComponentService) {
    this.sharedService = service;
  }


}

