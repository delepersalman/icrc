import { UserRole, VirtualEventUserRoles } from './virtualevent.user.model';
import { ClientRole, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';


declare namespace RtmStatusCode {
  export enum ConnectionChangeReason {
    LOGIN = "LOGIN",
    LOGIN_SUCCESS = "LOGIN_SUCCESS",
    LOGIN_FAILURE = "LOGIN_FAILURE",
    LOGIN_TIMEOUT = "LOGIN_TIMEOUT",
    INTERRUPTED = "INTERRUPTED",
    LOGOUT = "LOGOUT",
    BANNED_BY_SERVER = "BANNED_BY_SERVER",
    REMOTE_LOGIN = "REMOTE_LOGIN"
  }
  export enum ConnectionState {
    DISCONNECTED = "DISCONNECTED",
    CONNECTING = "CONNECTING",
    CONNECTED = "CONNECTED",
    RECONNECTING = "RECONNECTING",
    ABORTED = "ABORTED"
  }
  export enum LocalInvitationState {
    IDLE = "IDLE",
    SENT_TO_REMOTE = "SENT_TO_REMOTE",
    RECEIVED_BY_REMOTE = "RECEIVED_BY_REMOTE",
    ACCEPTED_BY_REMOTE = "ACCEPTED_BY_REMOTE",
    REFUSED_BY_REMOTE = "REFUSED_BY_REMOTE",
    CANCELED = "CANCELED",
    FAILURE = "FAILURE"
  }
  export enum RemoteInvitationState {
    INVITATION_RECEIVED = "INVITATION_RECEIVED",
    ACCEPT_SENT_TO_LOCAL = "ACCEPT_SENT_TO_LOCAL",
    REFUSED = "REFUSED",
    ACCEPTED = "ACCEPTED",
    CANCELED = "CANCELED",
    FAILURE = "FAILURE"
  }
  export enum LocalInvitationFailureReason {
    UNKNOWN = "UNKNOWN",
    PEER_NO_RESPONSE = "PEER_NO_RESPONSE",
    INVITATION_EXPIRE = "INVITATION_EXPIRE",
    PEER_OFFLINE = "PEER_OFFLINE",
    NOT_LOGGEDIN = "NOT_LOGGEDIN"
  }
  export enum RemoteInvitationFailureReason {
    UNKNOWN = "UNKNOWN",
    PEER_OFFLINE = "PEER_OFFLINE",
    ACCEPT_FAILURE = "ACCEPT_FAILURE",
    INVITATION_EXPIRE = "INVITATION_EXPIRE"
  }
  export enum PeerOnlineState {
    ONLINE = "ONLINE",
    UNREACHABLE = "UNREACHABLE",
    OFFLINE = "OFFLINE"
  }
  export enum PeerSubscriptionOption {
    ONLINE_STATUS = "ONLINE_STATUS"
  }
  export enum MessageType {
    TEXT = "TEXT",
    RAW = "RAW",
    IMAGE = "IMAGE",
    FILE = "FILE"
  }
}

export interface ChannelAttributeProperties {
  value: string;

  lastUpdateUserId: string;

  lastUpdateTs: number;
}

export interface AttributesMap {

  [key: string]: string;
}
export interface ChannelAttributes {
  [key: string]: ChannelAttributeProperties;
}

interface ChannelAttributeOptions {
  enableNotificationToChannelMembers?: boolean;
}

declare type ListenerType<T> = [T] extends [(...args: infer U) => any]
  ? U
  : [T] extends [void]
  ? []
  : [T];
declare class EventEmitter<TEventRecord = {}> {
  static defaultMaxListeners: number;
  on<P extends keyof TEventRecord, T>(
    this: T,
    event: P,
    listener: (...args: ListenerType<TEventRecord[P]>) => void
  ): this;

  once<P extends keyof TEventRecord, T>(
    this: T,
    event: P,
    listener: (...args: ListenerType<TEventRecord[P]>) => void
  ): this;

  off<P extends keyof TEventRecord, T>(
    this: T,
    event: P,
    listener: (...args: any[]) => any
  ): this;

  removeAllListeners<P extends keyof TEventRecord, T>(this: T, event?: P): this;
  listeners<P extends keyof TEventRecord, T>(this: T, event: P): Function[];
  rawListeners<P extends keyof TEventRecord, T>(this: T, event: P): Function[];
  listenerCount<P extends keyof TEventRecord, T>(this: T, event: P): number;
}

export interface RtmTextMessage {
  text: string;
  messageType?: 'TEXT';
  rawMessage?: never;
  description?: never;
}

export interface RtmRawMessage {
  rawMessage: Uint8Array;
  description?: string;
  messageType?: 'RAW';
  text?: never;
}

export interface RtmImageMessage {

  width: number;

  height: number;

  fileName: string;

  description: string;

  thumbnail: Blob | undefined;

  thumbnailWidth: number;

  thumbnailHeight: number;

  size: number;

  mediaId: string;

  messageType: 'IMAGE';
}

export interface RtmFileMessage {

  fileName: string;

  description: string;

  thumbnail: Blob | undefined;

  size: number;

  mediaId: string;

  messageType: 'FILE';
}

export type RtmMessage =
  | RtmTextMessage
  | RtmRawMessage
  | RtmFileMessage
  | RtmImageMessage;

interface PeerMessageSendResult {
  hasPeerReceived: boolean;
}

interface SendMessageOptions {
  enableOfflineMessaging?: boolean;
  enableHistoricalMessaging?: boolean;
}

interface ReceivedMessageProperties {
  serverReceivedTs: number;
  isOfflineMessage: boolean;
  isHistoricalMessage: boolean;
}

export interface PeersOnlineStatusMap {
  [peerId: string]: keyof typeof RtmStatusCode.PeerOnlineState;
}

export declare namespace RtmEvents {
  export interface RtmChannelEvents {
    ChannelMessage: (
      message: RtmMessage,
      memberId: string,
      messagePros: ReceivedMessageProperties
    ) => void;

    MemberLeft: (memberId: string) => void;

    MemberJoined: (memberId: string) => void;

    AttributesUpdated: (attributes: ChannelAttributes) => void;
    MemberCountUpdated: (memberCount: number) => void;
  }

  export interface RemoteInvitationEvents {
    RemoteInvitationCanceled: (content: string) => void;

    RemoteInvitationRefused: () => void;

    RemoteInvitationAccepted: () => void;

    RemoteInvitationFailure: (
      reason: keyof typeof RtmStatusCode.RemoteInvitationFailureReason
    ) => void;
  }

  export interface LocalInvitationEvents {
    LocalInvitationAccepted: (response: string) => void;
    LocalInvitationRefused: (response: string) => void;
    LocalInvitationReceivedByPeer: () => void;
    LocalInvitationCanceled: () => void;
    LocalInvitationFailure: (
      reason: keyof typeof RtmStatusCode.LocalInvitationFailureReason
    ) => void;
  }

  export interface RtmClientEvents {
    MessageFromPeer: (
      message: RtmMessage,
      peerId: string,
      messageProps: ReceivedMessageProperties
    ) => void;
    ConnectionStateChanged: (
      newState: keyof typeof RtmStatusCode.ConnectionState,
      reason: keyof typeof RtmStatusCode.ConnectionChangeReason
    ) => void;
    RemoteInvitationReceived: (remoteInvitation: RemoteInvitation) => void;

    TokenExpired: () => void;

    PeersOnlineStatusChanged: (status: PeersOnlineStatusMap) => void;
  }
}

export declare class LocalInvitation extends EventEmitter<
  RtmEvents.LocalInvitationEvents
> {
  readonly response: string;

  readonly state: keyof typeof RtmStatusCode.LocalInvitationState;

  content: string;

  readonly calleeId: string;

  channelId: string;

  send(): void;

  cancel(): void;
  on<EventName extends keyof RtmEvents.LocalInvitationEvents>(
    eventName: EventName,
    listener: (
      ...args: ListenerType<RtmEvents.LocalInvitationEvents[EventName]>
    ) => any
  ): this;
}

export declare class RemoteInvitation extends EventEmitter<
  RtmEvents.RemoteInvitationEvents
> {
  readonly channelId: string;

  readonly callerId: string;

  readonly content: string;

  readonly state: keyof typeof RtmStatusCode.RemoteInvitationState;

  response: string;

  accept(): void;

  refuse(): void;

  on<EventName extends keyof RtmEvents.RemoteInvitationEvents>(
    eventName: EventName,
    listener: (
      ...args: ListenerType<RtmEvents.RemoteInvitationEvents[EventName]>
    ) => any
  ): this;
}

export declare class RtmChannel extends EventEmitter<
  RtmEvents.RtmChannelEvents
> {
  readonly channelId: string;

  sendMessage(
    message: RtmMessage,
    messageOptions?: SendMessageOptions
  ): Promise<void>;

  join(): Promise<void>;

  leave(): Promise<void>;

  getMembers(): Promise<string[]>;

  on<EventName extends keyof RtmEvents.RtmChannelEvents>(
    eventName: EventName,
    listener: (
      ...args: ListenerType<RtmEvents.RtmChannelEvents[EventName]>
    ) => any
  ): this;
}

type LogFilterType = {
  error: boolean;
  warn: boolean;
  info: boolean;
  track: boolean;
  debug: boolean;
};

interface RtmParameters {
  enableLogUpload?: boolean;

  logFilter?: LogFilterType;
}

interface PeersOnlineStatusResult {
  [peerId: string]: boolean;
}
interface ChannelMemberCountResult {
  [channelId: string]: number;
}

interface MediaOperationProgress {

  currentSize: number;

  totalSize: number;
}

interface MediaTransferHandler {
  cancelSignal?: AbortSignal;

  onOperationProgress?: (event: MediaOperationProgress) => void;
}

export interface RtmClient extends EventEmitter<RtmEvents.RtmClientEvents> {
  login(options: { uid: string; token?: string }): Promise<void>;

  logout(): Promise<void>;

  sendMessageToPeer(
    message: RtmMessage,
    peerId: string,
    options?: SendMessageOptions
  ): Promise<PeerMessageSendResult>;

  createChannel(channelId: string): RtmChannel;
  createLocalInvitation(calleeId: string): LocalInvitation;

  setLocalUserAttributes(attributes: AttributesMap): Promise<void>;

  addOrUpdateLocalUserAttributes(attributes: AttributesMap): Promise<void>;

  deleteLocalUserAttributesByKeys(attributeKeys: string[]): Promise<void>;

  clearLocalUserAttributes(): Promise<void>;

  getUserAttributes(userId: string): Promise<AttributesMap>;

  getUserAttributesByKeys(
    userId: string,
    attributeKeys: string[]
  ): Promise<AttributesMap>;

  queryPeersOnlineStatus(peerIds: string[]): Promise<PeersOnlineStatusResult>;

  renewToken(token: string): Promise<void>;

  setParameters(params: RtmParameters): void;

  getChannelMemberCount(
    channelIds: string[]
  ): Promise<ChannelMemberCountResult>;

  getChannelAttributes(channelId: string): Promise<ChannelAttributes>;

  getChannelAttributesByKeys(
    channelId: string,
    keys: string[]
  ): Promise<ChannelAttributes>;

  clearChannelAttributes(
    channelId: string,
    options?: ChannelAttributeOptions
  ): Promise<void>;

  deleteChannelAttributesByKeys(
    channelId: string,
    attributeKeys: string[],
    options?: ChannelAttributeOptions
  ): Promise<void>;

  addOrUpdateChannelAttributes(
    channelId: string,
    attributes: AttributesMap,
    options?: ChannelAttributeOptions
  ): Promise<void>;

  setChannelAttributes(
    channelId: string,
    attributes: AttributesMap,
    options?: ChannelAttributeOptions
  ): Promise<void>;

  subscribePeersOnlineStatus(peerIds: string[]): Promise<void>;

  unsubscribePeersOnlineStatus(peerIds: string[]): Promise<void>;

  queryPeersBySubscriptionOption(
    option: keyof typeof RtmStatusCode.PeerSubscriptionOption
  ): Promise<string[]>;

  createMediaMessageByUploading(
    payload: Blob,
    params?: {
      fileName?: string;
      description?: string;
      thumbnail?: Blob | undefined;
      messageType?: 'FILE';
    },
    transHandler?: MediaTransferHandler
  ): Promise<RtmFileMessage>;

  createMediaMessageByUploading(
    payload: Blob,
    params?: {
      width?: number;
      height?: number;
      fileName?: string;
      description?: string;
      thumbnail?: Blob | undefined;
      thumbnailWidth?: number | undefined;
      thumbnailHeight?: number | undefined;
      messageType?: 'IMAGE';
    },
    transHandler?: MediaTransferHandler
  ): Promise<RtmImageMessage>;

  downloadMedia(
    mediaId: string,
    transHandler?: MediaTransferHandler
  ): Promise<Blob>;


  createMessage<T extends RtmMessage>(message: Partial<T>): T;

  on<EventName extends keyof RtmEvents.RtmClientEvents>(
    eventName: EventName,
    listener: (
      ...args: ListenerType<RtmEvents.RtmClientEvents[EventName]>
    ) => any
  ): this;
}

declare namespace AgoraRTM {
  const LOG_FILTER_OFF: LogFilterType;
  const LOG_FILTER_ERROR: LogFilterType;
  const LOG_FILTER_INFO: LogFilterType;
  const LOG_FILTER_WARNING: LogFilterType;
  const VERSION: string;

  const BUILD: string;

  const END_CALL_PREFIX: string;

  function createInstance(appId: string, params?: RtmParameters): RtmClient;
  const ConnectionChangeReason: typeof RtmStatusCode.ConnectionChangeReason;
  const ConnectionState: typeof RtmStatusCode.ConnectionState;
  const LocalInvitationFailureReason: typeof RtmStatusCode.LocalInvitationFailureReason;
  const LocalInvitationState: typeof RtmStatusCode.LocalInvitationState;
  const RemoteInvitationState: typeof RtmStatusCode.RemoteInvitationState;
  const RemoteInvitationFailureReason: typeof RtmStatusCode.RemoteInvitationFailureReason;
  const MessageType: typeof RtmStatusCode.MessageType;
  const PeerOnlineState: typeof RtmStatusCode.PeerOnlineState;
  const PeerSubscriptionOption: typeof RtmStatusCode.PeerSubscriptionOption;
}



export class ChatMessage {
  rtmMessage: RtmTextMessage;
  time: any;
  senderId: string;
  senderName: string;

  receiverId: string;
  receiverName: string;
  profileImageUrl: string;
  self: boolean;
  alt: string;
}

export interface MemberAttributes extends IAgoraRTCRemoteUser {
  VirtualEventUserId: string;
  FullName: string;
  FirstName: string;
  LastName: string;
  Title: string;
  Alt: string;
  Online: boolean;
  ChannelRole: string;
  IsScreenClient: boolean;
  ProfileImageUrl: string,
  InvitationMessage: string,
  PlayerId: string;
  IsBlocked: boolean;
  AllowUnblock: boolean;
  LinkId: string;
  PinnedToMainView: boolean;
  CurrentRoom: string;
  CurrentRoomId:number;
  VirtualEventUserRoles: Array<VirtualEventUserRoles>;
  RoleChangeMessage: string;
  ActionName: string;
  IsMicrophoneMuted: boolean;
  FitScreenText: string;
  IsSpeaking: boolean;
  IsAllowedUmuting: boolean;
  PinText: string;
}


export interface HistoricalMessage {
  Dst: string;
  Message_type: string;
  Ms: any;
  Payload: string;
  Src: string;
  FullName: string,
  ProfileImageUrl: string //TODO
}

export interface HistoricalMessageData {
  Code: string;
  Messages: HistoricalMessage[];
  Result: string;
}

export interface HistoricalMessageRequestModel {
  Source: string;
  Destination: string;
  StartDate: Date;
  EndDate: Date;
  Order: string;
  PageIndex: number;
  PageSize: number;
  IsPrivateMessage: boolean,
  EventId: number
}

