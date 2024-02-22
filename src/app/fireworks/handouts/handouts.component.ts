import { AfterViewInit, Component, ViewChild, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { VirtualEventService } from '../services/virtualevent.service';
import { RoomType } from '../models/virtualevent.room.model';
import { HandoutsDataModel, HandoutsDocumentPreviewDialogData, HandoutsSearchModel } from '../models/handouts.model';
import { HandoutsDocuementPreviewDialogComponent } from '../shared/filepreview-dialog/filepreview-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedFireworksComponentService } from '../services/shared.service';
import { RoomBaseComponent } from '../shared/roombase.component';
import { MessageService } from '../../shared/services/message.service';
import { CalendarPipe } from 'ngx-moment';
import { UserIdleService } from 'angular-user-idle';
import { catchError, finalize, startWith, switchMap, map, filter, takeUntil } from 'rxjs/operators';
import { merge, of, Subscription } from 'rxjs';
import { ThemingService } from '../shared/_theme/theme.service';
@Component({
  selector: 'fireworks-handouts',
  templateUrl: './handouts.component.html',
  styleUrls: ['./handouts.component.scss']
})
export class HandoutsComponent extends RoomBaseComponent implements AfterViewInit {

  resourcesLoading: boolean;
  isRateLimitReached: boolean;
  totalRecords: number;
  displayedColumns: string[] = ['Extension', 'FileName', 'Description', 'RoomType', 'Action'];
  docuemntsDataSource: HandoutsDataModel[];
  currentDownloadUrl: string;
  currentPreviewDocumentUrl: any;
  imageExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
  officeExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt'];
  pdfExtensions = ['.pdf', '.txt'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('searchinput') searchInput: ElementRef;

  constructor(
    public route: ActivatedRoute,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public titleService: Title,
    public sharedService: SharedFireworksComponentService,
    public virtualEventService: VirtualEventService,
    public messageService: MessageService,
    public amCalendar: CalendarPipe,
    public userIdle: UserIdleService,
    public router: Router,
    public themeService: ThemingService
  ) {
    super(dialog, sharedService, messageService, virtualEventService, router, themeService);
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    if (this.validatePermissionAndInitializeData) {
      const room = this.sharedService.virtualEventUser.VirtualEvent.Rooms.find(x => x.RoomType === RoomType.Handouts); // TODO
      if (!room) {
        this.noRoomAccess = true;
        return;
      }
      this.getRoomData(room.VirtualEventRoomId, this.loadHandoutData);
      this.subscribeRoomUpdate(room);
    }
  }

  loadHandoutData(that): void {
    // If the user changes the sort order, reset back to the first page.
    that.sort.sortChange.subscribe(() => that.paginator.pageIndex = 0);
    that.loadHandoutsData(null);
  }

  applyDocumentFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue) {
      const search = filterValue.trim().toLowerCase();
      this.resourcesLoading = true;
      this.loadHandoutsData(search);
    }
  }

  getRoomData(roomId, callback: Function): void {

    // Get Room data
    this.virtualEventService.getEventRoomDetail(this.sharedService.virtualEventUser.VirtualEvent.EventId, roomId).subscribe(rd => {
      if (rd && rd.Data) {
        this.resourcesLoading = false;
        this.roomData = rd.Data;
        this.roomData.RoomChannelName = 'fireworks.room.' + this.roomData.StreamId;
        this.sharedService.setRoomData(this.roomData);
      }
      callback(this);
    }, error => {
      console.log(error);
    });
  }

  downloadDocument(event, documentUrl): void {
    documentUrl = documentUrl.replace('~', '');
    this.currentDownloadUrl = documentUrl;
  }

  private loadHandoutsData(search: string): void {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.resourcesLoading = true;
          const eventId = this.sharedService.virtualEventUser.VirtualEvent.EventId;
          const params = {
            RoomId: null,
            Search: search,
            EventId: eventId,
            PageIndex: this.paginator.pageIndex,
            PageSize: this.paginator.pageSize
          } as HandoutsSearchModel;
          return this.virtualEventService.getHandoutDocuments(params);
        }),
        map(response => {
          this.resourcesLoading = false;
          this.isRateLimitReached = false;
          this.totalRecords = response.Data.Meta.TotalRecords;
          return response.Data.Data;
        }),
        catchError(() => {
          this.resourcesLoading = false;
          this.isRateLimitReached = true;
          return of([]);
        })
      ).subscribe(data => this.docuemntsDataSource = data);
  }

  openPreviewDocumentDialog(extenstion, documentUrl): void {

    documentUrl = documentUrl.replace('~', '');
    documentUrl = 'http://localhost:10359' + documentUrl;

    // If office doc
    if (this.officeExtensions.indexOf(extenstion) !== -1) {
      this.currentPreviewDocumentUrl = 'https://view.officeapps.live.com/op/view.aspx?src=' + documentUrl;
    } else {
      this.currentPreviewDocumentUrl = documentUrl;
    }

    const dialogData = {
      PreviewDocumentUrl: this.currentPreviewDocumentUrl,
      IsOfficeDoc: this.officeExtensions.indexOf(extenstion) !== -1,
      IsPdfDoc: this.pdfExtensions.indexOf(extenstion) !== -1,
      IsImageDoc: this.imageExtensions.indexOf(extenstion) !== -1
    } as HandoutsDocumentPreviewDialogData;

    let dialogConfig = new MatDialogConfig();
    dialogConfig = {
      width: '80vw',
      maxHeight: '100vh',
      minHeight: '80vh',
      data: dialogData,
      hasBackdrop: false
    };

    const dialogRef = this.dialog.open(HandoutsDocuementPreviewDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {

      const dialogDataLocal = result as HandoutsDocumentPreviewDialogData;
      console.log('Dialog result:', result);

      if (dialogDataLocal.DialogAction === 'cancel') {

      }
      else if (dialogDataLocal.DialogAction === 'confirm') {

      }
    });
  }
}
