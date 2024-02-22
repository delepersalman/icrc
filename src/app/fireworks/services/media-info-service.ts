import { Injectable } from '@angular/core';
import AgoraRTC, { ICameraVideoTrack, ILocalVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MediaSettingData, VideoProfileSetting } from '../models/common.model';

const localStreamPatternId = 'local_stream_';
const remoteStreamPatternId = 'remote_stream_';
const screenStreamPatternId = 'screen_';

@Injectable({
  providedIn: 'root'
})
export class MediaInfoService {
  onJoinRoomChannel: Subject<void> = new Subject<void>();
  mediaInfo: MediaSettingData = new MediaSettingData();
  mics: MediaDeviceInfo[] = [];
  cameras: MediaDeviceInfo[] = [];
  speakers: MediaDeviceInfo[] = [];
  permissionErrorMessage: string;
  videoProfiles: VideoProfileSetting[] = [
    { Label: "240p", Value: "240p" },
    { Label: "360p", Value: "360p" },
    { Label: "480p", Value: "480p" },
    { Label: "720p", Value: "720p" },
    { Label: "1080p", Value: "720p" }
  ]

  options = {
    appid: environment.agora.appId,
    channel: null,
    uid: null,
    token: null
  };

  localTracks = {
    videoTrack: null,
    audioTrack: null,
    screenTrack: null
  } as LocalTracks;

  localTrackState = {
    videoTrackEnabled: true,
    audioTrackEnabled: true
  }

  constructor() {
    this.setMediaSettingFromLocalStorage();
    this.getDevices();
  }

  public joinRoom() {
    this.onJoinRoomChannel.next();
  }

  public async createLocalVideoTrack(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      if (!this.localTracks.videoTrack && this.mediaInfo.selectedCameraId) {
        AgoraRTC.createCameraVideoTrack({
          encoderConfig: this.mediaInfo.selectedSendVideoResolution,
          cameraId: this.mediaInfo.selectedCameraId,
          optimizationMode: 'detail'
        }).then((videoTrack: ICameraVideoTrack) => {
          this.localTracks.videoTrack = videoTrack;
          resolve(null);
        }, ex => {
          console.error(ex);
          resolve(null);
        });
      } else {
        resolve(null);
      }
    });
    return promise;
  }

  public async createLocalAudioTrack(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      if (!this.localTracks.audioTrack && this.mediaInfo.selectedMicrophoneId) {
        AgoraRTC.createMicrophoneAudioTrack({
          microphoneId: this.mediaInfo.selectedMicrophoneId
        }).then((audioTrack: IMicrophoneAudioTrack) => {
          this.localTracks.audioTrack = audioTrack;
          resolve(null);
        }).catch(ex => {
          console.error(ex);
          resolve(null);
        })
      } else {
        resolve(null);
      }
    });
    return promise;
  }

  public createLocalTrack(): Promise<any> {
    const promise = new Promise(async (resolve, reject) => {
      try {
        await this.createLocalVideoTrack();
        await this.createLocalAudioTrack();
        resolve(null);
      } catch (e) {
        localStorage.removeItem('mediaInfo');
        resolve(null);
      }
    });
    return promise;
  }

  getDevices(): void {
    AgoraRTC.getCameras().then(async devices => {
      if (devices) {
        this.cameras = devices;
        if (this.cameras.length > 0) {
          var isCameraExist = this.cameras.find(c => c.deviceId == this.mediaInfo.selectedCameraId);
          if (!isCameraExist) {
            this.mediaInfo.selectedCameraId = this.cameras[0].deviceId;
          }
        }
      }
    }, (reason) => {
      if (reason.code == 'PERMISSION_DENIED') {
        this.permissionErrorMessage = "Please allow permissions to access your camera/mic.";
      }
      console.error("Get media devices errors", reason);
    });

    AgoraRTC.getMicrophones().then(async devices => {
      if (devices) {

        this.mics = devices.filter(d => d.kind == 'audioinput');
        if (this.mics.length > 0) {
          var isMicExist = this.mics.find(c => c.deviceId == this.mediaInfo.selectedMicrophoneId);
          if (!isMicExist) {
            this.mediaInfo.selectedMicrophoneId = this.mics[0].deviceId;
          }
        }

        //speakers
        this.speakers = devices.filter(d => d.kind == 'audiooutput');
        if (this.speakers.length > 0) {
          var defaultSpeaker = this.speakers.find(c => c.deviceId == this.mediaInfo.selectedSpeakerId);
          if (!defaultSpeaker) {
            this.mediaInfo.selectedSpeakerId = this.speakers[0].deviceId;
          }
        }
      }
    }, (reason) => {
      if (reason.code == 'PERMISSION_DENIED') {
        this.permissionErrorMessage = "Please allow permissions to access your camera/mic.";
      }
      console.error("Get media devices errors", reason);
    });

    AgoraRTC.getPlaybackDevices().then(async devices => {
      if (devices) {
        //speakers
        this.speakers = devices.filter(d => d.kind == 'audiooutput');
        if (this.speakers.length > 0) {
          var defaultSpeaker = this.speakers.find(c => c.deviceId == this.mediaInfo.selectedSpeakerId);
          if (!defaultSpeaker) {
            this.mediaInfo.selectedSpeakerId = this.speakers[0].deviceId;
          }
        }
      }
    }, (reason) => {
      console.error("Get media devices errors", reason);
    });
  }

  public setMediaSettingFromLocalStorage(): void {
    var mediaSettings = this.getMediaSettingFromLocalStorage() as MediaSettingData;
    if (mediaSettings) {
      this.mediaInfo = mediaSettings;
      this.localTrackState.audioTrackEnabled = this.mediaInfo.localAudioEnable;
      this.localTrackState.videoTrackEnabled = this.mediaInfo.localVideoEnable;
    }
  }

  setMediaSettingToLocalStorage(mediaInfo: MediaSettingData): void {
    localStorage.setItem('mediaInfo', JSON.stringify(mediaInfo));
  }

  getMediaSettingFromLocalStorage(): MediaSettingData {
    const data = localStorage.getItem('mediaInfo');
    if (data) {
      return JSON.parse(data) as MediaSettingData;
    }
    return null;
  }

  getLocalPlayerId(uid: string, type: string = 'user'): string {
    if (type == 'user') {
      return localStreamPatternId + uid;
    } else {
      return screenStreamPatternId + uid;
    }
  }

  getRemotePlayerId(uid: string, type: string = 'user'): string {
    if (type == 'user') {
      return remoteStreamPatternId + uid;
    } else {
      return screenStreamPatternId + uid;
    }
  }

  getIdOfScreenUser(id: string) {
    return id.replace(screenStreamPatternId, '');
  }
}

export class LocalTracks {
  videoTrack: ICameraVideoTrack;
  audioTrack: IMicrophoneAudioTrack;
  screenTrack: ILocalVideoTrack;
}
