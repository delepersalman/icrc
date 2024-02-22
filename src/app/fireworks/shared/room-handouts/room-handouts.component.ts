import { AfterViewInit, Component, OnInit, HostListener, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { HandoutsDataModel, HandoutsSearchModel } from '../../models/handouts.model';
import { VirtualEventRoomModel } from '../../models/virtualevent.room.model';
import { SharedFireworksComponentService } from '../../services/shared.service';
import { VirtualEventService } from '../../services/virtualevent.service';

@Component({
  selector: 'fireworks-room-handouts',
  templateUrl: './room-handouts.component.html',
  styleUrls: ['./room-handouts.component.scss']
})
export class RoomHandoutsComponent implements AfterViewInit, OnInit {

  resourcesLoading: boolean = true;
  currentDownloadUrl: string;
  currentPreviewDocumentUrl: any;
  txtHandoutsSearch: string;
  handoutDocuemnts: HandoutsDataModel[] = [];

  roomData: VirtualEventRoomModel;


  constructor(
    public route: ActivatedRoute,
    public dialog: MatDialog,
    public titleService: Title,
    public snackBar: MatSnackBar,
    public sharedService: SharedFireworksComponentService,
    public virtualEventService: VirtualEventService,
    private renderer: Renderer2
  ) {

  }

  @ViewChild('scrollMe') selectedTab: ElementRef;
  updateScrollHeight(): void {
    if (this.selectedTab && this.selectedTab.nativeElement) {
      const rightTopHeader = document.getElementsByClassName('tabButtonOuter')[0] as any;
      const scrollHeight = window.innerHeight - (rightTopHeader.offsetHeight);
      this.renderer.setStyle(this.selectedTab.nativeElement, 'height', scrollHeight + 'px');
    }
  }

  ngOnInit() {
    this.resourcesLoading = true;
    setTimeout(() => {
      this.resourcesLoading = false;
    }, 10000);
    try {
      if (this.sharedService.virtualEventUser && this.sharedService.virtualEventUser.VirtualEvent) {
        this.sharedService.onRoomDataUpdate.subscribe(rmd => {
          if (this.roomData) {
            this.getHandOutData(this.roomData.VirtualEventRoomId);
          }
        });
        this.sharedService.roomData$.subscribe(res => {
          if (res) {
            this.roomData = res;
            this.getHandOutData(res.VirtualEventRoomId);
          }
        });
      }
    } catch (e) {
      this.resourcesLoading = false;
    }
  }

  getHandOutData(roomId: any) {
    let params = {
      RoomId: roomId,
      Search: null,
      EventId: this.sharedService.virtualEventUser.VirtualEvent.EventId,
      PageIndex: 0,
      PageSize: 100
    } as HandoutsSearchModel;
    this.virtualEventService.getHandoutDocuments(params).subscribe(d => {
      if (d) {
        this.handoutDocuemnts = d.Data.Data;
        this.resourcesLoading = false;
        this.sharedService.onHandoutsDocumentLoaded.next(this.handoutDocuemnts);
      }
    });
    this.updateScrollHeight();
  }

  downloadDocument(event, documentUrl) {
    documentUrl = documentUrl.replace("~", '');
    this.currentDownloadUrl = documentUrl;
  };

  @HostListener('window:resize', ['$event'])
  sizeChange(): void {
    this.updateScrollHeight();
  }

  ngAfterViewInit() {
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
