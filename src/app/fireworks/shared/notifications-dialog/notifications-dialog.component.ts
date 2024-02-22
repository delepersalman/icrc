import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, of, Observable, merge } from 'rxjs';
import { catchError, finalize, startWith, switchMap, map, filter } from 'rxjs/operators';
import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { UserNotificationModel } from '../../models/common.model';
import { VirtualEventService } from '../../services/virtualevent.service';
import { SharedFireworksComponentService } from '../../services/shared.service';
import { MessageService } from '../../../shared/services/message.service';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'fireworks-notifications-dialog',
  templateUrl: './notifications-dialog.component.html',
  styleUrls: ['./notifications-dialog.component.scss'],
})
export class NotificationsDialogComponent implements OnInit, AfterViewInit {
  resourcesLoading: boolean;
  isRateLimitReached: boolean;
  totalRecords: number;
  displayedColumns: string[] = [
    'VirtualEventUserNotificationId',
    'SentBy',
    'Description',
    'SentDate',
    'Status',
  ];
  userNotifications: UserNotificationModel[];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('searchinput') searchInput: ElementRef;
  txtNotificationSearch: string;
  chkReadNotification: boolean = true;
  selection = new SelectionModel<UserNotificationModel>(true, []);
  showMarkAllAsReadButton: boolean;

  constructor(
    protected virtualEventService: VirtualEventService,
    protected sharedService: SharedFireworksComponentService,
    protected messageService: MessageService
  ) { }

  ngOnInit(): void { }

  applyNotificationFilter() {
    this.resourcesLoading = true;
    this.loadNotificationData();
  }

  ngAfterViewInit() {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    this.loadNotificationData();

    this.selection.changed.asObservable().subscribe(s => {
      this.showMarkAllAsReadButton = this.selection.selected.length > 0;
    });
  }

  private loadNotificationData(showLoader: boolean = true) {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.resourcesLoading = showLoader;
          var virtualEventId = this.sharedService.virtualEventUser.VirtualEvent
            .VirtualEventId;
          return this.virtualEventService.getUserNotifications(
            virtualEventId,
            this.txtNotificationSearch,
            this.paginator.pageIndex,
            this.paginator.pageSize,
            this.chkReadNotification
          );
        }),
        map((response) => {
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
      )
      .subscribe((data) => {
        this.userNotifications = data;
      });
  }

  markNotificationAsRead(notificationId: number = null) {
    let notificationIds = [];

    if (notificationId) {
      notificationIds.push(notificationId);
    } else {
      this.selection.selected.forEach((s) =>
        notificationIds.push(s.VirtualEventUserNotificationId)
      );
    }

    if (notificationIds.length > 0) {
      this.resourcesLoading = true;
      this.virtualEventService.updateNotificationReadStatus(notificationIds, true).subscribe((result) => {
        if (result) {
          this.resourcesLoading = false;
          this.messageService.showSuccessMessage(
            'Notification(s) marked as read.'
          );
          this.loadNotificationData(false);
          this.sharedService.refreshNotificationsData(true);
        } else {
          this.resourcesLoading = false;
          this.messageService.showErrorMessage(
            'An error occurred while updating notification status.'
          );
        }
      },
        (error) => {
          this.resourcesLoading = false;
          this.messageService.showErrorMessage(
            'An error occurred while updating notification status.'
          );
        }
      );
    }
  }

  loadReadNotification(event: MatCheckboxChange): void {
    this.loadNotificationData();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.userNotifications.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.userNotifications.forEach((row) => this.selection.select(row));
  }
}

