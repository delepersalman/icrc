import { VirtualEventModel } from './virtualevent.model';
import { BaseSearchModel } from './common.model';

export class VirtualEventUserModel {

  VirtualEventUserId: number;
  UserId: string;
  //UserRole: string;
  FirstName: string;
  LastName: string;
  FullName: string;
  Email: string;
  Password: string;
  ProfileImageUrl: string;
  CustomName: string;
  EventAccessToken: string;
  LastLoginIpAddress?: any;
  IsOnline: boolean;
  Title: string;
  Phone: string;
  Description: string;
  UserProfileImage: string;
  UserProfileImageName: string;
  IsEmailEnterRequired: boolean;
  VirtualEvent: VirtualEventModel;
  VirtualEventUserRoles: Array<VirtualEventUserRoles>;

}


export interface UserChatModel {

}

export enum UserRole {
  Host = 'host',
  CoHost = 'co_host',
  Attendee = 'attendee',
  Presenter = 'presenter'
}

export class BlockUnblockUserRequest {
  VirtualEventId: number;
  VirtualEventUserId: number;
}

export class UserNotificationSearchModel extends BaseSearchModel {

  VirtualEventId: number;
  LoadReadMessage: boolean
}
export class ManageUserRoleModel extends BlockUnblockUserRequest {
  VirtualEventRoleId: number;
  VirtualEventRoomId: number;
  RoomName: string;
  IsEnabled: boolean;
  UserIds: number[];
  MemberName: string;
  UserRole: string;
}
export enum EnumerationUserRole {
  Host = 0,
  Co_Host = 1,
  Presenter = 2,
  Attendee = 3
}
export class VirtualEventUserRoles {
  VirtualEventUserId: number;
  VirtualEventRoleId: number;
  CreatedBy: number;
  IsEnabled: boolean;
}
export class FireworksFeatures {
  FeatureCode: string;
  FeatureName: string;
  IsEnabled: boolean;
}

export enum EnumerationFeatures {
  ManageAttendee = 'MNGATTN',
  BreakoutRoom = 'BRKOUTRM',
  ManageBlockUser = 'MNGBLKUSR',
  ManageCoHost = 'MNGCOHOST',
  MuteUser = 'MUTE',
  PrivateChat = 'PRVCHAT',
  InviteToPrivateRoom = 'INVPRVROOM',
  ViewProfile = 'VWPROFILE',
  MuteAllAttendee = 'MUTEALLATTN'
}
export class MoveWaitRoomModel {
  VirtualEventUserId: number[];
  VirtualEventId: number;
  RemoveBy: number;
  RoomId: number;
  IsAllowedToJoinRoom: boolean;
  RoomName: string;
}

export class ChangeRoleResponse {
  Status: boolean;
  SingleRoleCouldNotBeRemoved: boolean
}
