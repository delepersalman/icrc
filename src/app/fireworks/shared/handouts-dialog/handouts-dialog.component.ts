import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { UserIdleService } from 'angular-user-idle';
import { CalendarPipe } from 'ngx-moment';
import { merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MessageService } from 'src/app/shared/services/message.service';
import { HandoutsDataModel, HandoutsDocumentPreviewDialogData, HandoutsSearchModel } from '../../models/handouts.model';
import { RoomType } from '../../models/virtualevent.room.model';
import { SharedFireworksComponentService } from '../../services/shared.service';
import { VirtualEventService } from '../../services/virtualevent.service';
import { HandoutsDocuementPreviewDialogComponent } from '../filepreview-dialog/filepreview-dialog.component';
import { RoomBaseComponent } from '../roombase.component';
import { ThemingService } from '../_theme/theme.service';

@Component({
  selector: 'fireworks-handouts-dialog',
  templateUrl: './handouts-dialog.component.html',
  styleUrls: ['./handouts-dialog.component.scss']
})
export class HandoutsDialogComponent extends RoomBaseComponent implements OnInit, AfterViewInit {

  resourcesLoading: boolean;
  isRateLimitReached: boolean;
  totalRecords: number;
  displayedColumns: string[] = ['FileName', 'Description', 'RoomType', "Action"];
  docuemntsDataSource: HandoutsDataModel[];
  currentDownloadUrl: string;
  currentPreviewDocumentUrl: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('searchinput') searchInput: ElementRef;

  imageExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
  officeExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt'];
  pdfExtensions = ['.pdf', '.txt'];

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

  ngOnInit() {
    this.sharedService.onRoomDataUpdate.subscribe(rmd => {
      if (this.roomData.VirtualEventRoomId == rmd.VirtualEventRoomId) {
        this.getRoomData(rmd.VirtualEventRoomId, this.loadHandoutData);
      }
    });
  }

  loadHandoutData(that) {
    // If the user changes the sort order, reset back to the first page.
    that.sort.sortChange.subscribe(() => that.paginator.pageIndex = 0);
    that.loadHandoutsData(null);
  }

  ngAfterViewInit() {
    if (this.validatePermissionAndInitializeData) {
      let room = this.sharedService.virtualEventUser.VirtualEvent.Rooms.find(x => x.RoomType == RoomType.Handouts);//TODO
      this.getRoomData(room.VirtualEventRoomId, this.loadHandoutData);
    }
  }

  applyDocumentFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue) {
      let search = filterValue.trim().toLowerCase();
      this.resourcesLoading = true;
      this.loadHandoutsData(search);
    }
  }

  getRoomData(roomId: number, callback: Function) {
    this.resourcesLoading = true;
    //Get Room data
    this.virtualEventService.getEventRoomDetail(this.sharedService.virtualEventUser.VirtualEvent.EventId, roomId).subscribe(rd => {
      if (rd && rd.Data) {
        this.resourcesLoading = false;
        this.roomData = rd.Data;
        this.sharedService.setRoomData(this.roomData);
        callback(this);
      } else {
        this.resourcesLoading = false;
      }
    }, error => {
      this.resourcesLoading = false;
    });
  }

  downloadDocument(event, documentUrl) {
    documentUrl = documentUrl.replace("~", '');
    this.currentDownloadUrl = documentUrl;
  };

  private loadHandoutsData(search: string) {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.resourcesLoading = true;
          var eventId = this.sharedService.virtualEventUser.VirtualEvent.EventId;
          let params = {
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

    documentUrl = documentUrl.replace("~", '');

    //If office doc
    if (this.officeExtensions.indexOf(extenstion) !== -1) {
      this.currentPreviewDocumentUrl = 'https://view.officeapps.live.com/op/view.aspx?src=' + documentUrl;
    } else {
      this.currentPreviewDocumentUrl = documentUrl;
    }

    let dialogData = {
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

      let dialogDataLocal = result as HandoutsDocumentPreviewDialogData;
      console.log('Dialog result:', result);

      if (dialogDataLocal.DialogAction === 'cancel') {

      }
      else if (dialogDataLocal.DialogAction === 'confirm') {

      }
    });
  }
}
