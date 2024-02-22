import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from '../../file-upload/file-upload.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    FileUploadComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatTabsModule,
    MatListModule,
    MatDialogModule,
    MatInputModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  exports: [
    FormsModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatTabsModule,
    MatListModule,
    MatDialogModule,
    MatInputModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatSelectModule,
    FileUploadComponent,
    ReactiveFormsModule
  ],
})
export class SharedModule { }
