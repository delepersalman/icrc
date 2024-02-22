import { ChangeDetectorRef, Component, OnInit, Output } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { EventEmitter } from 'events';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from '../../shared/services/message.service';
import { RoomType, VirtualEventRoomModel } from '../models/virtualevent.room.model';
import { PagerService } from '../services/pager.service';
import { SharedFireworksComponentService } from '../services/shared.service';
import { VirtualEventService } from '../services/virtualevent.service';

@Component({
  selector: 'fireworks-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    public titleService: Title,
    public sharedService: SharedFireworksComponentService,
    public virtualEventService: VirtualEventService,
    public messageService: MessageService,
    private pagerService: PagerService) {

  }

  resourcesLoading = false;
  currentDownloadUrl: string;
  simpleRooms: VirtualEventRoomModel[];
  multiBoothRoom: VirtualEventRoomModel[];

  speakerPager: any = {};
  speakerPagedItems: any[];

  sponsorPager: any = {};
  sponsorPagedItems: any[];

  handoutsPager: any = {};
  handoutsPagedItems: any[];
  unsubscribeAll: Subject<any> = new Subject();
  @Output() whenLobbyHasData = new EventEmitter();

  showColumn3 = false;

  ngOnInit(): void {

    this.updateLobbyData();
    this.sharedService.onEventInfoUpdate.pipe(takeUntil(this.unsubscribeAll)).subscribe(() => {
      this.updateLobbyData().then(() => {
        this.updatePaging();
      });
    });

    this.sharedService.roomData$.pipe(takeUntil(this.unsubscribeAll)).subscribe((d) => {
      this.updateLobbyData().then(() => {
        this.updatePaging();
      });
    });

    this.sharedService.onHandoutsDocumentLoaded.pipe(takeUntil(this.unsubscribeAll)).subscribe(s => {
      this.sharedService.handoutDocuments = s;
      this.setHandoutsPage(1);
    });

    this.sharedService.onEventSpeakerLoaded.pipe(takeUntil(this.unsubscribeAll)).subscribe(s => {
      this.setSpeakerPage(1);
    });

    this.sharedService.onEventSponsorLoaded.pipe(takeUntil(this.unsubscribeAll)).subscribe(s => {
      this.setSponsorPage(1);
    });

  }

  downloadDocument(event: any, documentUrl: string): void {
    documentUrl = documentUrl.replace('~', '');
    this.currentDownloadUrl = documentUrl;
  }

  setSpeakerPage(page: number): Promise<any> {
    // tslint:disable-next-line: no-shadowed-variable
    const promise = new Promise((resolve, reject) => {
      try {
        if (!this.sharedService.currentRoomData.ShowSpeakers) {
          this.speakerPagedItems = [];
          return;
        }

        // get pager object from service
        this.speakerPager = this.pagerService.getPager(this.sharedService.eventSpeakers.length, page, 4);
        // get current page of items
        this.speakerPagedItems = this.sharedService.eventSpeakers.slice(this.speakerPager.startIndex, this.speakerPager.endIndex + 1);
        resolve(true);
      } catch {
        reject(false);
      }
    });
    return promise;
  }

  setSponsorPage(page: number): Promise<any> {

    // tslint:disable-next-line: no-shadowed-variable
    const promise = new Promise((resolve, reject) => {
      try {
        if (!this.sharedService.currentRoomData.ShowSponsors) {
          this.sponsorPagedItems = [];
          return;
        }
        // get pager object from service
        this.sponsorPager = this.pagerService.getPager(this.sharedService.eventSponsors.length, page, 2);
        // get current page of items
        this.sponsorPagedItems = this.sharedService.eventSponsors.slice(this.sponsorPager.startIndex, this.sponsorPager.endIndex + 1);
        resolve(true);
      } catch {
        reject(false);
      }
    });
    return promise;
  }

  setHandoutsPage(page: number): Promise<any> {

    // tslint:disable-next-line: no-shadowed-variable
    const promise = new Promise((resolve, reject) => {

      try {
        if (!this.sharedService.currentRoomData.AllowHandouts) {
          this.handoutsPagedItems = [];
          return;
        }

        // get pager object from service
        this.handoutsPager = this.pagerService.getPager(this.sharedService.handoutDocuments.length, page, 4);
        // get current page of items
        this.handoutsPagedItems = this.sharedService.handoutDocuments.slice(this.handoutsPager.startIndex, this.handoutsPager.endIndex + 1);
        resolve(true);
      } catch {
        reject(false);
      }
    });
    return promise;
  }

  updateLobbyData(): Promise<any> {

    // tslint:disable-next-line: no-shadowed-variable
    const promise = new Promise((resolve, reject) => {

      try {

        let simpleRoomType = [RoomType.Stage, RoomType.Keynote, RoomType.GreenRoom];
        this.simpleRooms = this.sharedService.virtualEventUser.VirtualEvent.Rooms
          .filter(r => r.IsEnabled && simpleRoomType.indexOf(r.RoomType) !== -1);
        this.multiBoothRoom = this.sharedService.virtualEventUser.VirtualEvent.Rooms
          .filter(r => simpleRoomType.indexOf(r.RoomType) === -1 && r.IsEnabled
            && r.RoomType !== RoomType.Reception && r.RoomType !== RoomType.Handouts && r.RoomType !== RoomType.CustomRoom);

        const isHostOrCoHost = this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser);
        if (!isHostOrCoHost) {
          this.simpleRooms = this.simpleRooms.filter(r => r.RoomType != RoomType.GreenRoom);
        }

        const cuustomRooms = this.sharedService.virtualEventUser.VirtualEvent.Rooms
          .filter(r => r.IsEnabled && r.RoomType === RoomType.CustomRoom);

        if (cuustomRooms.length) {
          const customRoom = {
            RoomName: 'Custom Rooms',
            RoomType: RoomType.CustomRoom,
            VirtualEventBooths: cuustomRooms

          } as VirtualEventRoomModel;
          this.multiBoothRoom = [...this.multiBoothRoom, customRoom];
        }
        resolve(true);
      } catch {
        reject(false);
      }
    });
    return promise;
  }

  updatePaging(): void {
    Promise.all([
      this.setSpeakerPage(1),
      this.setSponsorPage(1),
      this.setHandoutsPage(1)
    ]).then(value => this.setShowHideData());
  }

  setShowHideData(): void {
    this.showColumn3 = this.speakerPagedItems.length > 0 || this.sponsorPagedItems.length > 0 || this.handoutsPagedItems.length > 0;

    if (this.simpleRooms.length || this.multiBoothRoom.length || this.showColumn3) {
      this.whenLobbyHasData.emit('true');
    }

    this._changeDetectorRef.detectChanges();
  }

  getFileNameExtention(fileExtenstion: string) {
    if (!fileExtenstion)
      return fileExtenstion;
    let ext = fileExtenstion.replace('.', '').toUpperCase();
    if (ext == 'DOCX')
      return 'DOC';
    if (ext == 'XLSX' || ext == 'CSV')
      return 'XLS';
    if (ext == 'PPTX')
      return 'PPT';
    if (ext == 'JPEG' || ext == 'PNG')
      return 'JPG';
    return ext;
  }
}
