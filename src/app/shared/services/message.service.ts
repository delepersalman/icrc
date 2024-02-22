import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';


@Injectable()
export class MessageService {

  constructor(private snackBar: MatSnackBar) {

  }
  // TODO
  messages: string[] = [];

  add(message: string, autoHide: boolean = true) {
    if (message) {
      this.openSnackBar(message, 'x', autoHide, 'default-message');
    }
  }

  showSuccessMessage(message: string, autoHide: boolean = true) {
    if (message) {
      this.openSnackBar(message, 'x', true, 'success-message');
    }
  }

  showErrorMessage(message: string, autoHide: boolean = true) {
    this.openSnackBar(message, 'x', true, 'error-message');
  }

  private openSnackBar(message: string, action: string, autoHide: boolean = true, panelClass: string) {
    this.snackBar.open(message, action, {
      duration: autoHide ? 10000 : undefined,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      politeness: 'polite',
      panelClass: ['mat-toolbar', panelClass]
    });
  }

  public playNewMessageTone() {
    const audio = new Audio();
    audio.src = './assets/fireworks/audio/new-message.mp3';
    audio.load();
    audio.play();
  }

  public playUserJoinEventTone() {
    const audio = new Audio();
    audio.src = './assets/fireworks/audio/user-joined.mp3';
    audio.load();
    audio.play();
  }

  public playSampleMusic() {
    const audio = new Audio();
    audio.src = './assets/fireworks/audio/sample-music.mp3';
    audio.load();
    audio.play();
  }

  public playUserLeftEventTone() {

  }
}
