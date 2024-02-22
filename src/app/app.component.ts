import { Component } from '@angular/core';
import { GlobalService } from './shared/services/global-service';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ThemePalette } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isResourceLoading: false;
  showLoader: boolean = false;
  color: ThemePalette = 'accent';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 30;
  constructor(private _globalService: GlobalService, private _snackBar: MatSnackBar) {
    this._globalService.onShowLoader.subscribe(show => {
      this.showLoader = show;
    })
    this._globalService.onShowToast.subscribe((data: any) => {
      this.openToasMessage(data.message, data.type);
    })
  }
  openToasMessage(message, type) {
    this._snackBar.open(message, 'close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: [type]
    });
  }
}
