import { Component, OnInit, OnDestroy } from '@angular/core';
import { DialogAudioVideoData, MediaSettingData } from '../../models/common.model';
import { MatDialogRef } from '@angular/material/dialog';
import { SharedFireworksComponentService } from '../../services/shared.service';
import AgoraRTC, { } from 'agora-rtc-sdk-ng';
import { Subject } from 'rxjs';
import { MessageService } from '../../../shared/services/message.service';
import { MediaInfoService } from '../../services/media-info-service';

@Component({
  selector: 'fireworks-media-setting-dialog',
  templateUrl: './media-setting-dialog.component.html',
  styleUrls: ['./media-setting-dialog.component.scss']
})
export class MediaSettingDialogComponent implements OnInit, OnDestroy {
  dialogData: DialogAudioVideoData = new DialogAudioVideoData();

  preLocalStramContainerId: string = 'pre-local-player';
  destroy$ = new Subject();
  resourcesLoading: boolean = true;
  currentVolumn: number = 0;
  intervalMicrophoneLevel: any;

  constructor(private dialogRef: MatDialogRef<MediaSettingDialogComponent>,
    public sharedService: SharedFireworksComponentService,
    protected messageService: MessageService, public mediaInfoService: MediaInfoService
  ) {
    this.dialogData.Microphones = this.mediaInfoService.mics;
    this.dialogData.Cameras = this.mediaInfoService.cameras;
    this.dialogData.Speakers = this.mediaInfoService.speakers;
    var mediaSettings = this.mediaInfoService.getMediaSettingFromLocalStorage();
    this.dialogData.localAudioEnable = mediaSettings ? mediaSettings.localAudioEnable : true;
    this.dialogData.localVideoEnable = mediaSettings ? mediaSettings.localVideoEnable : true;
  }

  ngOnInit() {
    if (this.mediaInfoService.cameras.length == 0 || this.mediaInfoService.mics.length == 0) {
      this.mediaInfoService.getDevices();
    }
    this.createPreLocalTrack().then(async () => {
      if (this.dialogData.LocalAudioTrack) {
        if (!this.dialogData.localAudioEnable) {
          await this.dialogData.LocalAudioTrack.setEnabled(false);
        } else {
          this.intervalMicrophoneLevel = setInterval(() => {
            this.currentVolumn = this.dialogData.LocalAudioTrack.getVolumeLevel() * 100;
          }, 250);
        }
      }

      if (this.dialogData.LocalVideoTrack) {
        if (!this.dialogData.localVideoEnable) {
          await this.dialogData.LocalVideoTrack.setEnabled(false);
        }
        this.playLocalVideo();
      }
    })
    this.resourcesLoading = false;
  }

  playLocalVideo(): void {
    var el = document.getElementById(this.preLocalStramContainerId);
    el.innerHTML = '';
    this.dialogData.LocalVideoTrack.play(el);
  }

  populateMediaInfo(): void {
    try {
      if (this.mediaInfoService.cameras.length == 0 || this.mediaInfoService.mics.length == 0) {
        this.mediaInfoService.getDevices();
      }
      this.dialogData = {
        Cameras: this.mediaInfoService.cameras,
        Microphones: this.mediaInfoService.mics,
        Speakers: this.mediaInfoService.speakers
      } as DialogAudioVideoData;
      this.mediaInfoService.setMediaSettingFromLocalStorage();

    } catch (e) {
      this.messageService.showErrorMessage('An error occurred while getting media device information.');
    }
  }

  private createPreLocalVideoTrack(): Promise<any> {
    const promise = new Promise((resolve: any, reject: any) => {
      if (!this.dialogData.LocalVideoTrack && this.mediaInfoService.mediaInfo.selectedCameraId) {
        AgoraRTC.createCameraVideoTrack({
          encoderConfig: this.mediaInfoService.mediaInfo.selectedSendVideoResolution,
          cameraId: this.mediaInfoService.mediaInfo.selectedCameraId,
          optimizationMode: 'detail'
        }).then(videoTrack => {
          this.dialogData.LocalVideoTrack = videoTrack;
          resolve(null);
        }).catch(ex => {
          this.dialogData.localVideoEnable = false;
          console.log(ex);
          resolve(null);
        });
      } else {
        this.dialogData.localVideoEnable = false;
        resolve(null);
      }
    });
    return promise;
  }

  private createPreLocalAudioTrack(): Promise<any> {
    const promise = new Promise((resolve: any, reject: any) => {
      if (!this.dialogData.LocalAudioTrack && this.mediaInfoService.mediaInfo.selectedMicrophoneId) {
        AgoraRTC.createMicrophoneAudioTrack({
          microphoneId: this.mediaInfoService.mediaInfo.selectedMicrophoneId
        }).then(audioTrack => {
          this.dialogData.LocalAudioTrack = audioTrack;
          resolve(null);
        }).catch(ex => {
          this.dialogData.localAudioEnable = false;
          console.error(ex);
          resolve(null);
        });
      } else {
        this.dialogData.localAudioEnable = false;
        resolve(null);
      }
    });
    return promise;
  }

  private async createPreLocalTrack(): Promise<any> {
    try {
      const promise = new Promise(async (resolve: any) => {
        await this.createPreLocalVideoTrack();
        await this.createPreLocalAudioTrack();
        resolve(null);
      });
      return promise;
    } catch (e) {
      console.error(e);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
    setTimeout(async () => {
      if (this.dialogData.LocalVideoTrack) {
        await this.dialogData.LocalVideoTrack.setEnabled(false);
      }
      if (this.dialogData.LocalAudioTrack) {
        await this.dialogData.LocalAudioTrack.setEnabled(false);
      }
    }, 1000);

    if (this.intervalMicrophoneLevel) {
      clearInterval(this.intervalMicrophoneLevel);
    }

    this.stopPlayingTestSound();
  }

  async toggleMicOnClick() {
    if (!this.dialogData.LocalAudioTrack) {
      await this.createPreLocalAudioTrack();
    }
    if (this.dialogData && this.dialogData.LocalAudioTrack) {
      if (!this.dialogData.localAudioEnable) {
        if (!this.sharedService.allowUnmuteMyself) {
          if (!this.sharedService.isHostOrCoHost(this.sharedService.virtualEventUser)
            && !this.sharedService.isPresenter(this.sharedService.virtualEventUser)) {
            this.messageService.showSuccessMessage('You are not allowed to unmute.');
            return;
          }
        }
        this.dialogData.localAudioEnable = true;
        await this.dialogData.LocalAudioTrack.setEnabled(true);

        if (this.intervalMicrophoneLevel) {
          clearInterval(this.intervalMicrophoneLevel);
        }

        this.intervalMicrophoneLevel = setInterval(() => {
          this.currentVolumn = this.dialogData.LocalAudioTrack.getVolumeLevel() * 100;
        }, 250);

      } else {
        this.dialogData.localAudioEnable = false;
        await this.dialogData.LocalAudioTrack.setEnabled(false);
      }
    } else {
      this.dialogData.localAudioEnable = false;
      this.messageService.showErrorMessage("It appears your mic is being used by another application or not accessible, please provide permissions under settings.");
    }
  }

  async toggleVideoOnClick() {
    if (!this.dialogData.LocalVideoTrack) {
      await this.createPreLocalVideoTrack();
    }
    if (this.dialogData && this.dialogData.LocalVideoTrack) {
      if (!this.dialogData.localVideoEnable) {
        this.dialogData.localVideoEnable = true;
        await this.dialogData.LocalVideoTrack.setEnabled(true);
        this.playLocalVideo();
      } else {
        this.dialogData.localVideoEnable = false;
        await this.dialogData.LocalVideoTrack.setEnabled(false);
      }
    } else {
      this.messageService.showErrorMessage("It appears your camera is being used by another application or not accessible, please provide permissions under settings.");
      this.dialogData.localVideoEnable = false;
    }
  }

  private getSelectedMicId(): string {
    var micLabel = this.mediaInfoService.localTracks.audioTrack.getMediaStreamTrack().label;
    var mic = this.dialogData.Microphones.find(m => m.label == micLabel);
    if (mic) {
      return mic.deviceId;
    }
    return "";
  }

  private getSelectedCamId(): string {
    var camLabel = this.mediaInfoService.localTracks.videoTrack.getMediaStreamTrack().label;
    var cam = this.dialogData.Cameras.find(m => m.label == camLabel);
    if (cam) {
      return cam.deviceId;
    }
    return "";
  }

  async action(button: 'confirm' | 'cancel') {
    if (button == 'confirm') {
      var mediaInfo = {
        localAudioEnable: this.dialogData.localAudioEnable,
        localVideoEnable: this.dialogData.localVideoEnable,
        selectedCameraId: this.mediaInfoService.mediaInfo.selectedCameraId,
        selectedMicrophoneId: this.mediaInfoService.mediaInfo.selectedMicrophoneId,
        selectedReceiveVideoResolution: this.mediaInfoService.mediaInfo.selectedReceiveVideoResolution,
        selectedSendVideoResolution: this.mediaInfoService.mediaInfo.selectedSendVideoResolution
      } as MediaSettingData;
      this.mediaInfoService.setMediaSettingToLocalStorage(mediaInfo);
      this.sharedService.setDialogAudioVideoData({} as DialogAudioVideoData);
      if (this.sharedService.roomClientConnected) {
        if (this.mediaInfoService.localTracks.audioTrack) {
          var micId = this.getSelectedMicId();
          if (micId != this.mediaInfoService.mediaInfo.selectedMicrophoneId) {
            await this.mediaInfoService.localTracks.audioTrack.setDevice(this.mediaInfoService.mediaInfo.selectedMicrophoneId);
          }
          if (mediaInfo.localAudioEnable) {
            this.sharedService.fwRoom.unMuteAudio();
          } else {
            this.sharedService.fwRoom.muteAudio();
          }
        }

        if (this.mediaInfoService.localTracks.videoTrack) {

          var camId = this.getSelectedCamId();

          if (camId != this.mediaInfoService.mediaInfo.selectedMicrophoneId) {
            await this.mediaInfoService.localTracks.videoTrack.setDevice(this.mediaInfoService.mediaInfo.selectedCameraId);
          }

          if (mediaInfo.localVideoEnable) {
            this.sharedService.fwRoom.unmuteVideo();
          } else {
            this.sharedService.fwRoom.muteVideo();
          }
          var roomMember = this.sharedService.roomMembers.find(m => m.VirtualEventUserId.toString() == this.sharedService.virtualEventUser.VirtualEventUserId.toString());
          if (roomMember) {
            roomMember.hasAudio = this.mediaInfoService.localTrackState.audioTrackEnabled;
            roomMember.hasVideo = this.mediaInfoService.localTrackState.videoTrackEnabled;
          }
        }
      }
      else {
        this.mediaInfoService.localTrackState.audioTrackEnabled = mediaInfo.localAudioEnable;
        this.mediaInfoService.localTrackState.videoTrackEnabled = mediaInfo.localVideoEnable;
      }
    }
    this.dialogRef.close();
  }

  async onCameraSelectionChange(e: any): Promise<void> {
    if (!this.dialogData.LocalVideoTrack) {
      await this.createPreLocalTrack();
    }
    if (this.dialogData.LocalVideoTrack) {
      await this.dialogData.LocalVideoTrack.setEnabled(true);
      this.dialogData.localVideoEnable = true;
      await this.dialogData.LocalVideoTrack.setDevice(this.mediaInfoService.mediaInfo.selectedCameraId).catch(ex => {
        this.messageService.showErrorMessage("It appears your camera is being used by another application or not accessible, please provide permissions under settings.");
        var camId = this.getSelectedCamId();
        this.mediaInfoService.mediaInfo.selectedCameraId = camId;
      });
    }
  }

  async onMicrophoneSelectionChange(): Promise<void> {
    if (this.dialogData.localAudioEnable) {
      await this.dialogData.LocalAudioTrack.setEnabled(true);
      this.dialogData.localAudioEnable = true;
    }
    await this.dialogData.LocalAudioTrack.setDevice(this.mediaInfoService.mediaInfo.selectedMicrophoneId);

    if (this.intervalMicrophoneLevel) {
      clearInterval(this.intervalMicrophoneLevel);
    }
    this.intervalMicrophoneLevel = setInterval(() => {
      this.currentVolumn = this.dialogData.LocalAudioTrack.getVolumeLevel() * 100;
    }, 250);
  }

  onSendVideoResolutionSelectionChange(): void {
    if (this.dialogData.localVideoEnable) {
      this.dialogData.LocalVideoTrack.setEncoderConfiguration(this.mediaInfoService.mediaInfo.selectedSendVideoResolution);
    }
  }

  onReceiveVideoResolutionSelectionChange(): void {
    console.log(this.dialogData, 'selectionChange')
  }

  onSpeakerSelectionChange(): void {
    this.dialogData.LocalAudioTrack.setPlaybackDevice(this.mediaInfoService.mediaInfo.selectedSpeakerId);
  }

  showMicIcon(): boolean {
    return this.sharedService.isPresenter(this.sharedService.virtualEventUser) || this.sharedService.allowUnmuteMyself;
  }

  showVideoIcon(): boolean {
    return this.sharedService.isPresenter(this.sharedService.virtualEventUser);
  }

  isSoundPlaying: boolean = false;
  audioPlayer: HTMLAudioElement;
  playTestSound() {
    this.audioPlayer = new Audio('./assets/fireworks/audio/sample-music.mp3');
    this.audioPlayer.play();
    this.isSoundPlaying = true;
  }

  stopPlayingTestSound() {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.currentTime = 0;
      this.isSoundPlaying = false;
      this.audioPlayer = null;
    }
  }
}
