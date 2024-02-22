import { Component, OnInit, Input, Inject, ElementRef, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';
import { VirtualEventService } from '../services/virtualevent.service';
import { RoomType } from '../models/virtualevent.room.model';
import { DialogAudioVideoData } from '../models/common.model';
import { Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'fireworks-backstage',
  templateUrl: './backstage.component.html',
  styleUrls: ['./backstage.component.scss']
})
export class BackStageComponent implements OnInit {

  constructor(
    public route: ActivatedRoute,
    public dialog: MatDialog,
    public titleService: Title,
    public snackBar: MatSnackBar,
    public virtualEventService: VirtualEventService
  ) {
  }

  ngOnInit(): void {
    
  }
}
