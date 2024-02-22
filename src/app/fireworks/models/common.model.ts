import { IMicrophoneAudioTrack, ICameraVideoTrack } from 'agora-rtc-sdk-ng';

export enum EnumerationChatSection {
  Group = 'group',
  Private = 'private',
  Room = 'room'
}

export interface TimeSpan {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface Entry {
  created: Date;
  end: Date;
  id: string;
}

export class DialogAudioVideoData {
  Microphones: MediaDeviceInfo[];
  Cameras: MediaDeviceInfo[];
  Speakers: MediaDeviceInfo[];
  DialogAction: 'confirm' | 'cancel'; 
  localAudioEnable: boolean;
  localVideoEnable: boolean;
  LocalAudioTrack: IMicrophoneAudioTrack;
  LocalVideoTrack: ICameraVideoTrack;
}

export interface MetaInfo {
  TotalRecords: number
}

export abstract class BaseSearchModel {
  Search: string;
  PageIndex: number;
  PageSize: number;
}

export abstract class BasePagedListModel<T>{
  Data: T[];
  Meta: MetaInfo;
}

export interface DialogUserIdleData {
  DialogAction: "confirm" | "cancel";
}

export interface VideoProfileSetting {
  Label: string;
  Value: string;
}

export interface UserConnectionInfo {
  UserId: string;
  IsConnected: boolean;
  IpAddress?: any;
}

export interface UserNotificationModel {
  VirtualEventUserNotificationId: number;
  NotificationSentByUserId: number;
  NotificationSentForUserId: number;
  FirstName: string;
  LastName: string;
  FullName: string;
  VirtualEventId: number;
  NotificationDate: Date;
  NotificationContent: string;
  /// <summary>
  /// Alert | Invite | CallMissed | Blocked | UnBlocked , Will change to enum
  /// </summary>
  NotificationType: string;
  ProfileImageUrl: string;
  IsMarkedAsRead: boolean
}

export interface AutoLoginRequest {
  Token: string
}

export class ConfirmDialogComponentData {

  Title: string = 'Please confirm';
  Message: string;
  OkText: string = 'Ok';
  CancelText: string = 'Canel';
}

export class BroadcastDataModel {
  VirtualEventId: number;
  UserIds: number[];
  DataType: string;
  Data: any;
}

export class MediaSettingData {
  localAudioEnable: boolean;
  localVideoEnable: boolean;
  selectedCameraId: string;
  selectedMicrophoneId: string;
  selectedSpeakerId: string;
  selectedSendVideoResolution: any =  "720p";
  selectedReceiveVideoResolution: any = "720p";
}

export class BroadcastNotificationToEvent {
  VirtualEventId: number;
  MessageType: string;
  RoomIds: number[] = [];
  Notification: string;
  NotificationType: string;
  NotificationSentByUserId: number;
}

export class SaveFireworksActivityModel { 
  EntityId: number; 
  VirtualEventUserId: number;
  ActivityTypeId: number; 
  EntityName: string;
}

export enum EnumerationTrackingActivityType {
  JoinFireworksRoom = 1,
  LeaveFireworksRoom = 2,
  FireworksLogin = 3,
  FireworksLogout = 4,
  EntityNameVirtualEvent = 'virtualevent'
}