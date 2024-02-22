import { ECImageViewModel } from 'src/app/shared/models/ec-image-model';
import { MemberAttributes } from './rtm.model';

export enum MediaType {
  Image = 'image',
  Video = 'video'
}

export enum VideoSource {
  Youtube = 'youtube',
  Vimeo = 'vimeo',
  Wistia = 'wistia',
  SproutVideo = 'sproutvideo',
  Bigmarker = 'bigmarker',
  Eventcombo = 'eventcombo'
}

export enum RoomType {

  Reception = 'reception',
  Stage = 'stage',
  Networking = 'networking',
  Session = 'session',
  Expo = 'expo',
  CustomRoom = 'customroom',
  Keynote = 'keynoteroom',
  Handouts = 'handouts',
  PrivateRoom = 'privateroom',
  Breakout = 'breakout',
  GreenRoom = 'greenroom',
  SessionBooth = 'session_booth',
  ExpoBooth = 'expo_booth',
  NetworkingBooth = 'networking_booth'
}


export interface VirtualEventRoomModel {
  VirtualEventRoomId: number;
  RoomName: string;
  RoomType: RoomType;
  Description: string;
  MediaType: MediaType;
  EventId: number;
  StreamId: string;
  AllowGroupChat: boolean;
  AllowPrivateChat: boolean;
  AllowHandouts: boolean;
  AllowPollsAndSurvey: boolean;
  AllowGuestInvite: boolean;
  AllowOneToOneNetworking: boolean;
  AllowRecording: boolean;
  VideoSource: string;
  VideoUrl: string;
  CreatedDateUtc: Date;
  UpdatedDateUtc?: Date;
  VirtualEventScheduleId?: any;
  SelectedSchedule?: any;
  ShowSpeakers: boolean;
  ShowSponsors: boolean;
  ShowAttendees: boolean;
  ShowSchedules: boolean;
  GrandSponsorId: number;
  GrandSponsorUrl: string;
  GrandSponsorName: string;
  BoardBackgroundColor: string;
  BoardTextColor: string;
  VirtualEventBooths: any[];
  VirtualEventPolls: any[];
  RoomChannelName: string;
  EnableAttendeeView: boolean;
  VirtualEventUserId: number;
  RoomCloseCountDown: number;
  RoomEndTime: number;
  MaximumParticipants: number;
  FirstScheduleStartDateUtc: Date;
  FirstScheduleEndDateUtc: Date;
  IsAllowedToJoinRoom: boolean;
  WaitRoomRemoveBy: number;
  IsEnabled: boolean;
  DisplayMemberCountToAttendees: boolean;
  DisplayPeopleSectionToAttendees: boolean;
  GlobalMuteEnable: boolean;
  ShowBackgroundImage: boolean;
  BackgroundImage: ECImageViewModel;
  RoomImage: ECImageViewModel;
}

export interface VirtualEventPrivateRoomModel {
  VirtualEventPrivateRoomId: number;
  RoomName: string;
  VirtualEventUserId: number;
  StreamId: string;
  AllowHandouts: boolean;
  AllowPollsAndSurvey: boolean;
  AllowGuestInvite: boolean;
  AllowRecording: boolean;
  ParticipantIds: string;
  VirtualEventId: number;
  IsRoomOpen: boolean;
  RoomEndTime: number;
  RoomCloseCountDownTime: number;
  RoomParticipants: MemberAttributes[];
  Checked: boolean;
  EventChannelName: string;
  RoomChannelName: string;
  RoomSignalingChannelName: string;
  ParticipantAccessToken: string;
  IsAllowedToJoinRoom: boolean;
  WaitRoomRemoveBy: number;
}

export type IPoll = {
  RoomId: number;
  Question: string;
  DisplayNow: boolean;
  IsRequired: boolean;
  UserId: string;
  VirtualEventPollAnswers: any[];
};

export interface SavePollUserAnswer {
  PollAnswer: string;
  Percentage: number;
}

export interface AddUserToRoomResponse {
  Status: boolean;
  IsAlreadyAdded: boolean;
}

export class BreakoutRoomModel {
  VirtualEventId: number;
  AttendeePerBreakout: number;
  BreakoutAttendeeAllocationType = 'Automatic';
  BroadcastDataToParticipants: boolean;
  Rooms: VirtualEventPrivateRoomModel[];
}

export enum RoomBaseAction {
  OpenBreakoutRooms = 'OpenBreakoutRooms',
  BroadcastMessageToBreakout = 'BroadcastMessageToBreakout',
  CloseBreakoutRooms = 'CloseBreakoutRooms',
  MoveAttendee = 'MoveAttendee',
  Kickout = 'Kickout',
  GetRoomName = 'GetRoomName',
  SetRoomName = 'SetRoomName',
  BroadcastMessageToRooms = 'BroadcastMessageToRooms',
  MuteUser = 'MuteUser',
  UnMuteUser = 'UnMuteUser',
  AllowUnmuteUser = 'AllowUnmuteUser',
  RejoinFromWaitRoom = 'RejoinFromWaitRoom',
  MuteUnMuteAllAttendees = 'MuteUnMuteAllAttendees',
  RaiseHand = "RaiseHand",
  ApproveRejectRaiseHand = "ApproveRejectRaiseHand",
  OnJoinRoom = 'OnJoinRoom',
  OnLeaveRoom = 'OnLeaveRoom',
  OnRequestBroadcastRoomInfo = 'OnRequestBroadcastRoomInfo'
}

export enum EventcomboAction {
  PurchaseTicket = 'PurchaseTicket',
  EventConfig = 'EventConfig',
  RoomData = 'RoomData',
  BoothData = 'BoothData',
  ChangeRole = 'ChangeRole',
  PollData = 'PollData',
  ManageUserRole = 'ManageUserRole',
  PeopleUpdate = 'PeopleUpdate'
}
