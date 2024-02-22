import { BaseEntityModel, EventViewModel } from "../event-maker/event-maker-model";

export enum AttendeeRequiredState { Hide = 0, Show = 1, Required = 2 }
export class TicketInfoModel extends BaseEntityModel {
  eventTickets: TicketInfoViewModel[] = [];
  eventDeals: EventDealModel[] = [];
  EventId: number;
}
export class TicketInfoViewModel {
  TicketId: number;
  TQDId: number;
  TicketName: string;
  VenueName: string;
  TicketDescription: string;
  StartDate: Date;
  StartDateText: string;
  TicketTypeId: number;
  SourcePrice: number;
  Price: number;
  Quantity: number;
  Minimum: number;
  Maximum: number;
  Fee: number;
  ShowFee: boolean;
  Amount: number;
  SoldOut: boolean;
  ShowRemaining: boolean;
  RemainingQuantity: number;
  TotalPrice: number;
  GrossTotal: number;
  Available: boolean;
  DateInfoString1: string;
  DateInfoString2: string;
  Priority: number;
  AvailableFrom: Date;
  AvailableTo: Date;
  AttendeeRequiredState: AttendeeRequiredState;
  Address: EventAddressViewModel;
  DisplaySalesStart: boolean;
  DisplaySalesEnd: boolean;
  DisplayDate: boolean;
  WaitlistEnabled: boolean;
  WaitlistMaximum: number;
  ShowMemberTicket: boolean;
  SeatContains: boolean;
  StartDateFormatted: string;
  Quants: number[] = [];
  TicketType: string;
  HasAgeda:boolean;
  IsOrderFree: any;
  OrganizerMasterId: number;
  TextColor: string;
  BGColor: string;
}

export class EventAddressViewModel {
  AddressId: number;
  InternalId: number;
  VenueName: string;
  Address: string;
  MainAddress: string;
  Latitude: string;
  Longitude: string;
}
export class EventTeamModel extends BaseEntityModel {
  eventTeams: EventTeamViewModel[] = [];
}
export class EventTeamViewModel {
  EventId: number;
  TeamId: number;
  EventName: string;
  TeamName: string;
  OrganizerId: number;
  IsActive: boolean;
  CaptainId: number;
  DisplayTeamMembers: boolean;
  TeamMembers: EventTeamMembersModel[];
}

export class EventTeamMembersModel {
  TicketBearerId: number;
  TeamId: number;
  BuyerName: string;
  BuyerEmail: string;
  OrderId: number;
  UserId: string;
  IsDisplayOnPage: boolean;
  IsCaptain: boolean;
}

export class EventDealModel {
  EventDealId: number;
  DealId: number;
  DealTypeId: number;
  Name: string;
  LogoUrl: string;
  SiteUrl: string;
  ngDirective: string;
  Checked: boolean;
  ngDirectiveName: string;
  Title: string;
  Description: string;
}
export class TicketLockRequestModel {
  EventId: number;
  Tickets: TicketLockViewModel[] = [];
  AccessPromoCodeId: number;
  Deals: EventDealModel[] = [];
  AffiliateMemberId: number;
  UserId: string;
  IP: string;
  WaitListId: number;
}
export class TicketLockViewModel {
  LockTicketId: number;
  LockOrderId: string
  TicketQuantityDetailId: number;
  Quantity: number;
  Donate: number;
  Amount: number;
  ECFeeAmount: number;
  ECFeePercent: number;
  ECFeeType: number;
  CustomerFee: number;
}
export class TicketLockResponseModel {
  LockId: number;
  LockCount: number;
  TicketsAvailable: boolean;
  Message: string;
}

export interface PromoCodeResponseModel {
  Success: boolean
  Message: any
  PromoCode: string
  EventId: number
  Amount: number
  Percents: number
  IsOrderFree: boolean
  IsAllTicket: boolean
  Tickets: any[]
  PromoCodeType: number,
  PromoCodeId: number
}
