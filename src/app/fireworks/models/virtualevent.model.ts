import { VirtualEventRoomModel } from './virtualevent.room.model';
import { ECImageViewModel } from 'src/app/shared/models/ec-image-model';
import { SilentAuctionModel } from 'src/app/shared/models/silent-auction-model';

export interface VirtualEventModel {
  EventId: number;
  VirtualEventId: number;
  OrganizerId: number;
  UserId?: any;
  EventTitle: string;
  EventUrl: string;
  EventStartDateUtc: Date;
  EventEndDateUtc: Date;
  ShortDescription: string;
  BoardBackgroundColor: string;
  BoardTextColor: string;
  TimeZoneId: number;
  Rooms: VirtualEventRoomModel[];
  EventDatesInfo: EventDatesInfo;
  EventSponsors: EventSponsorModel[];
  EventSpeakers: EventSpeakerModel[];
  Attendees: EventAttendeeModel[];
  Schedules: EventScheduleModel[];
  EventChannelName: string;
  EnableRoomJumping: boolean;
  EnableSilentAuction: boolean;
  Image: ECImageViewModel;
  AttendeeLabel: string;
  OrganizerName: string;
  EnableBreakoutRooms: boolean;
  SpeakerLabel: string;
  ScheduleLabel: string;
  SponsorLabel: string;
  DisplayMemberCountToAttendees: boolean;
  DisplayPeopleSectionToAttendees: boolean;
  GlobalAudioVideoMute: boolean;
  ShowSpeakers: boolean;
  ShowSponsors: boolean;
  ShowSchedules: boolean;
  SilentAuctions: SilentAuctionModel[];

  ShowBackgroundImage: boolean;
  BackgroundImageName: string;
  BackgroundImagePath: string;
  ShowDonationButton: string;
  ButtonText: string;
  ButtonLink: string;
  AllowHandouts: boolean;
  EnableFireworksActivity: boolean;
}


export interface EventDatesInfo {
  Summary: string;
  StartDate: Date;
  EndDate: Date;
  StartDateUtc: Date;
  EndDateUtc: Date;
  EventTimeZone: EventTimeZone;
}

export interface EventTimeZone {
  EventTimeZoneId: string;
  DisplayName: string;
  StandardName: string;
  DaylightName: string;
  BaseUtcOffset: string;
  AdjustmentRules?: any;
  SupportsDaylightSavingTime: boolean;
}

export interface EventSponsorModel {
  ECMemberId: number;
  MemberName: string;
  FirstName:string;
  LastName :string;
  Title:string;
  WebsiteURL: string;
  Description:string;
  ImagePath: string;
}

export interface EventSpeakerModel {
  ECMemberId: number;
  MemberName: string;
  FirstName:string;
  LastName :string;
  Description: string;
  ImagePath: string;
  Title: string;
}

export interface EventAttendeeModel {
  EventAttendeeId: number;
  FullName: string;
  FirstName: string;
  LastName: string;
  Email: string;
  TicketName: string;
  ProfileImageUrl: string;
}

export interface EventScheduleModel {
  EventScheduleId: number;
  RoomType: string;
  RoomName: string;
  VirtualEventRoomId: number;
  Title: string;
  Description: string;
  StartDate: Date;
  EndDate: Date;
  StartDateUtc: Date;
  EndDateUtc: Date;
  Duration: string;
  ScheduleStatus: number;
}
