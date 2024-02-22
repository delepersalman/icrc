import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, publish } from 'rxjs/operators';
import { SilentAuctionModel } from 'src/app/shared/models/silent-auction-model';
import { ApiResponse } from '../../shared/models/api.response.model';
import { HttpRequestService } from '../../shared/services/http-request.service';
import { BasePagedListModel, BroadcastDataModel, BroadcastNotificationToEvent, UserConnectionInfo, UserNotificationModel, SaveFireworksActivityModel } from '../models/common.model';
import { HandoutsDataModel, HandoutsSearchModel } from '../models/handouts.model';
import { HistoricalMessageData, HistoricalMessageRequestModel, MemberAttributes } from '../models/rtm.model';
import { EventScheduleModel, EventSpeakerModel, EventSponsorModel, VirtualEventModel } from '../models/virtualevent.model';
import { AddUserToRoomResponse, BreakoutRoomModel, RoomType, VirtualEventPrivateRoomModel, VirtualEventRoomModel } from '../models/virtualevent.room.model';
import { BlockUnblockUserRequest, ChangeRoleResponse, FireworksFeatures, ManageUserRoleModel, MoveWaitRoomModel, UserNotificationSearchModel, VirtualEventUserModel } from '../models/virtualevent.user.model';
import { SavePollUserAnswer } from './../models/virtualevent.room.model';

@Injectable()
export class VirtualEventService {

  public eventAccessToken: string;
  public browserSessionId: string;

  constructor(private httpService: HttpRequestService) { }

  public setEventAccessToken(token: string) {

    if (!token)
      throw new Error('Invalid token');

    this.eventAccessToken = token;
  }

  public setBrowserSessionId(sessionId) {

    if (!sessionId)
      throw new Error('Invalid sessionId');

    this.browserSessionId = sessionId;
  }

  public getEventUserDetail(eventId, loadBooths = false) {
    var params = new HttpParams().set("eventId", eventId);
    params = params.set("accessToken", this.eventAccessToken);
    params = params.set("browserSessionId", this.browserSessionId);

    if(loadBooths){
      params = params.set('loadBooths', 'true');
    }

    return this.httpService.get<ApiResponse<VirtualEventUserModel>>("fireworks/virtualEvent/GetVirtualEventUserDetail", params)
      .pipe(map(res => res));
  }

  public getEventUserDetailById(eventId, virtualEventUserId) {
    var params = new HttpParams().set("eventId", eventId);
    params = params.set("virtualEventUserId", virtualEventUserId);
    params = params.set("accessToken", this.eventAccessToken);
    params = params.set("browserSessionId", this.browserSessionId);
    return this.httpService.get<ApiResponse<VirtualEventUserModel>>("fireworks/virtualEvent/GetVirtualEventUserDetailById", params)
      .pipe(map(res => res));
  }

  public getEventRoomDetail(eventId, roomId) {
    var params = new HttpParams();
    params = params.set("accessToken", this.eventAccessToken);
    params = params.set("browserSessionId", this.browserSessionId);
    params = params.set("eventId", eventId);
    params = params.set("roomId", roomId);
    return this.httpService.get<ApiResponse<VirtualEventRoomModel>>('fireworks/virtualEvent/GetVirtualEventRoomDetail', params)
      .pipe(map(resp => resp));
  }

  public getEventPollDetail(pollId, roomId, virtualEventUserId, pushResult) {
    var params = new HttpParams();
    params = params.set("accessToken", this.eventAccessToken);
    params = params.set("browserSessionId", this.browserSessionId);
    params = params.set("pollId", pollId);
    params = params.set("roomId", roomId);
    params = params.set("virtualEventUserId", virtualEventUserId);
    params = params.set("pushResult", pushResult);
    return this.httpService.get<ApiResponse<VirtualEventRoomModel>>('fireworks/virtualEvent/GetVirtualEventPollDetail', params)
      .pipe(map(resp => resp));
  }

  public createPrivateRoom(roomData: VirtualEventPrivateRoomModel) {
    return this.httpService
      .post<ApiResponse<VirtualEventPrivateRoomModel>>('fireworks/virtualEvent/CreatePrivateRoom', roomData)
      .pipe(map(resp => resp));
  }

  public updateVirtualEventUser(virtualEventUser: VirtualEventUserModel) {
    return this.httpService
      .post<ApiResponse<VirtualEventUserModel>>('fireworks/virtualEvent/UpdateVirtualEventUser', virtualEventUser)
      .pipe(map(resp => resp));
  }

  public uploadImages(uploadData) {
    return this.httpService
      .post<ApiResponse<any>>('api/Image/UploadImages', uploadData)
      .pipe(map(resp => resp));
  }

  public addUpdateUserToPrivateRoom(roomData: VirtualEventPrivateRoomModel) {
    return this.httpService
      .post<ApiResponse<AddUserToRoomResponse>>('fireworks/virtualEvent/AddUserToPrivateRoom', roomData)
      .pipe(map(resp => resp));
  }

  public savePollUserAnswer(pollAnswer) {

    return this.httpService
      .post<ApiResponse<SavePollUserAnswer>>('fireworks/virtualEvent/SavePollUserAnswer', pollAnswer)
      .pipe(map(resp => resp));
  }

  public linkedInCall() {
    return this.httpService.get<any>('fireworks/LinkedIn/LinkedInProfile', null).pipe(map(resp => resp));
    // return this.httpService.get<any>('/fireworks/LinkedIn/LinkedInProfile',null);
    // const myConnectableObservable: ConnectableObservable<any> = this.httpService.post('fireworks/LinkedIn/LinkedInProfile', null).pipe(publish()) as ConnectableObservable<any>;
    // myConnectableObservable.connect();
  }

  public getPrivateRoomDetail(eventId: number, streamId: string) {
    var params = new HttpParams();
    params = params.set("accessToken", this.eventAccessToken);
    params = params.set("browserSessionId", this.browserSessionId);
    params = params.set("eventId", eventId.toString());
    params = params.set("roomStreamId", streamId);
    return this.httpService
      .get<ApiResponse<VirtualEventPrivateRoomModel>>('fireworks/virtualEvent/GetPrivateRoomDetail', params)
      .pipe(map(resp => resp));
  }

  public getHandoutDocuments(params: HandoutsSearchModel) {

    return this.httpService
      .post<ApiResponse<BasePagedListModel<HandoutsDataModel>>>('fireworks/virtualEvent/HandoutDocuments', params)
      .pipe(map(resp => resp));
  }

  public updateUserActivity(activityData: any) {
    return this.httpService
      .post<ApiResponse<any>>('fireworks/virtualEvent/updateUserActivity', activityData)
      .pipe(map(resp => resp));
  }

  public updateNotificationReadStatus(notificationIds: number[], status: boolean) {
    let d = { notificationIds: notificationIds, isMarkedAsRead: status };
    return this.httpService
      .post<ApiResponse<any>>('fireworks/virtualEvent/UpdateNotificationReadStatus', d)
      .pipe(map(resp => resp));
  }

  public getUserConnectionInfo(virtualEventUserId: number) {
    var params = new HttpParams();
    params = params.set("accessToken", this.eventAccessToken);
    params = params.set("browserSessionId", this.browserSessionId);
    params = params.set("virtualEventUserId", virtualEventUserId.toString());
    return this.httpService
      .get<ApiResponse<UserConnectionInfo>>('fireworks/virtualEvent/GetUserConnectionInfo', params)
      .pipe(map(resp => resp));
  }

  public GetAllEventUsers(eventId: number) {
    var params = new HttpParams();
    params = params.set("accessToken", this.eventAccessToken);
    params = params.set("browserSessionId", this.browserSessionId);
    params = params.set("eventId", eventId.toString());
    return this.httpService
      .get<ApiResponse<MemberAttributes[]>>('fireworks/virtualEvent/GetAllEventUsers', params)
      .pipe(map(resp => resp));
  }

  public getChatHistory(model: HistoricalMessageRequestModel) {

    return this.httpService.post<ApiResponse<HistoricalMessageData>>('fireworks/VirtualEvent/GetChatHistory', model)
      .pipe(map(resp => resp));;
  }


  public blockUser(virtualEventId: number, virtualEventUserId: string) {

    let data = { VirtualEventId: virtualEventId, VirtualEventUserId: Number(virtualEventUserId) } as BlockUnblockUserRequest;

    return this.httpService
      .post<ApiResponse<boolean>>('fireworks/virtualEvent/BlockUser', data)
      .pipe(map(resp => resp));
  }

  public unblockUser(virtualEventId: number, virtualEventUserId: string) {

    let data = { VirtualEventId: virtualEventId, VirtualEventUserId: Number(virtualEventUserId) } as BlockUnblockUserRequest;

    return this.httpService
      .post<ApiResponse<boolean>>('fireworks/virtualEvent/UnblockUser', data)
      .pipe(map(resp => resp));
  }

  public getBlockedUserIds(virtualEventId: number) {
    var params = new HttpParams();
    params = params.set("accessToken", this.eventAccessToken);
    params = params.set("browserSessionId", this.browserSessionId);
    params = params.set("virtualEventId", virtualEventId.toString());
    return this.httpService
      .get<ApiResponse<string[]>>('fireworks/virtualEvent/GetBlockedUserIds', params)
      .pipe(map(resp => resp));
  }


  public addUserNotification(model: UserNotificationModel) {
    return this.httpService
      .post<ApiResponse<boolean>>('fireworks/virtualEvent/AddUserNotification', model)
      .pipe(map(resp => resp));
  }

  public SaveAndBroadcastNotification(model: BroadcastNotificationToEvent) {
    return this.httpService
      .post<ApiResponse<boolean>>('fireworks/virtualEvent/SaveAndBroadcastNotification', model)
      .pipe(map(resp => resp));
  }

  public getUserNotifications(virtualEventId: number, search: string, pageNo: number, pageSize: number, loadReadMessage: boolean) {
    let params = { Search: search, VirtualEventId: virtualEventId, PageIndex: pageNo, PageSize: pageSize, LoadReadMessage: loadReadMessage } as UserNotificationSearchModel;
    return this.httpService
      .post<ApiResponse<BasePagedListModel<UserNotificationModel>>>('fireworks/virtualEvent/GetUserNotifications', params)
      .pipe(map(resp => resp));
  }

  public createBreakoutRooms(roomData: BreakoutRoomModel) {
    return this.httpService
      .post<ApiResponse<BreakoutRoomModel>>('fireworks/virtualEvent/CreateBreakoutRooms', roomData).pipe(map(resp => resp));
  }

  public deleteBreakoutRooms(roomIds: number[], virtualEventUserId: number) {
    var model = {
      RoomIds: roomIds,
      VirtualEventUserId: virtualEventUserId
    }
    return this.httpService
      .post<ApiResponse<any>>('fireworks/virtualEvent/DeleteBreakoutRooms', model).pipe(map(resp => resp));
  }

  public getBreakoutRooms(virtualEventUserId, virtualEventId) {
    var params = new HttpParams();
    params = params.set('virtualEventUserId', virtualEventUserId);
    params = params.set('virtualEventId', virtualEventId);
    params = params.set("accessToken", this.eventAccessToken);
    params = params.set("browserSessionId", this.browserSessionId);
    return this.httpService
      .get<ApiResponse<BreakoutRoomModel>>('fireworks/virtualEvent/GetBreakoutRooms', params).pipe(map(resp => resp));
  }

  public setSession() {
    var params = new HttpParams();
    params = params.set("accessToken", this.eventAccessToken);
    params = params.set("browserSessionId", this.browserSessionId);
    return this.httpService
      .post<ApiResponse<any>>('fireworks/virtualEvent/SetSession', params)
      .pipe(map(resp => resp));
  }

  public getSession() {
    var params = new HttpParams();
    params = params.set("accessToken", this.eventAccessToken);
    params = params.set("browserSessionId", this.browserSessionId);
    return this.httpService
      .get<ApiResponse<any>>('fireworks/virtualEvent/GetSession', params)
      .pipe(map(resp => resp));
  }
  public broadcastClientDataToEventClients(clientData: BroadcastDataModel) {
    return this.httpService
      .post<ApiResponse<any>>('fireworks/virtualEvent/BroadcastDataToEventClients', clientData)
      .pipe(map(resp => resp));
  }
  public getBreakoutRoomDetail(roomId: number) {
    var params = new HttpParams();
    params = params.set("accessToken", this.eventAccessToken);
    params = params.set("browserSessionId", this.browserSessionId);
    params = params.set("roomId", roomId.toString());
    return this.httpService
      .get<ApiResponse<VirtualEventPrivateRoomModel>>('fireworks/virtualEvent/GetBreakoutRoomDetail', params)
      .pipe(map(resp => resp));
  }

  public manageUserRole(manageUserRoleModel: ManageUserRoleModel) {
    return this.httpService
      .post<ApiResponse<ChangeRoleResponse>>('fireworks/virtualEvent/ManageUserRole', manageUserRoleModel)
      .pipe(map(resp => resp));
  }
  public getAllowedUserFeatures(virtualEventUserId: string) {
    var params = new HttpParams();
    params = params.set("accessToken", this.eventAccessToken);
    params = params.set("browserSessionId", this.browserSessionId);
    params = params.set('virtualEventUserId', virtualEventUserId);
    return this.httpService
      .get<ApiResponse<FireworksFeatures[]>>('fireworks/virtualEvent/GetAllowedUserFeatures', params)
      .pipe(map(resp => resp));
  }
  public GetEventUserDetail(eventId: number, virtualEventUserId: string) {
    var params = new HttpParams();
    params = params.set("accessToken", this.eventAccessToken);
    params = params.set("browserSessionId", this.browserSessionId);
    params = params.set("eventId", eventId.toString());
    params = params.set("virtualEventUserId", virtualEventUserId);
    return this.httpService
      .get<ApiResponse<MemberAttributes>>('fireworks/virtualEvent/GetEventUserDetail', params)
      .pipe(map(resp => resp));
  }

  checkAndGetUserBreakoutRoom(virtualEventId: number) {
    var params = new HttpParams();
    params = params.set("virtualEventId", virtualEventId.toString());
    params = params.set("accessToken", this.eventAccessToken);
    params = params.set("browserSessionId", this.browserSessionId);
    return this.httpService
      .get<ApiResponse<VirtualEventPrivateRoomModel>>('fireworks/virtualEvent/checkAndGetUserBreakoutRoom', params)
      .pipe(map(resp => resp));
  }
  public moveToWaitRoom(moveToWaitRoom: MoveWaitRoomModel) {
    let data = { moveToWaitRoom };
    return this.httpService
      .post<ApiResponse<boolean>>('fireworks/virtualEvent/MoveToWaitRoom', moveToWaitRoom)
      .pipe(map(resp => resp));
  }

  public EnableDisableGlobalMute(roomId: number, status: boolean, roomType: RoomType) {
    var params = new HttpParams();
    params = params.set("roomId", roomId.toString());
    params = params.set("status", status.toString());
    params = params.set("roomType", roomType.toString());
    params = params.set("accessToken", this.eventAccessToken);
    params = params.set("browserSessionId", this.browserSessionId);
    return this.httpService
      .get<ApiResponse<boolean>>('fireworks/virtualEvent/EnableDisableGlobalMute', params)
      .pipe(map(resp => resp));
  }


  public GetSpeakers(eventId: number) {
    var params = new HttpParams();
    params = params.set("accessToken", this.eventAccessToken);
    params = params.set("browserSessionId", this.browserSessionId);
    params = params.set("eventId", eventId.toString());
    return this.httpService
      .get<ApiResponse<EventSpeakerModel[]>>('fireworks/virtualEvent/GetSpeakers', params)
      .pipe(map(resp => resp));
  }

  public GetSponsers(eventId: number) {
    var params = new HttpParams();
    params = params.set("accessToken", this.eventAccessToken);
    params = params.set("browserSessionId", this.browserSessionId);
    params = params.set("eventId", eventId.toString());
    return this.httpService
      .get<ApiResponse<EventSponsorModel[]>>('fireworks/virtualEvent/GetSponsers', params)
      .pipe(map(resp => resp));
  }

  public GetSchedules(eventId: number) {
    var params = new HttpParams();
    params = params.set("accessToken", this.eventAccessToken);
    params = params.set("browserSessionId", this.browserSessionId);
    params = params.set("eventId", eventId.toString());
    return this.httpService
      .get<ApiResponse<EventScheduleModel[]>>('fireworks/virtualEvent/GetSchedules', params)
      .pipe(map(resp => resp));
  }

  public SaveFireworksActivity(fireworksActivityData: SaveFireworksActivityModel){
    return this.httpService
      .post<ApiResponse<any>>('fireworks/virtualEvent/SaveFireworksActivity', fireworksActivityData)
      .pipe(map(resp => resp));
  }
  public getLobbyDetail(eventId: string): Observable<ApiResponse<VirtualEventUserModel>> {
    let params = new HttpParams().set('eventId', eventId);
    params = params.set('accessToken', this.eventAccessToken);
    params = params.set('browserSessionId', this.browserSessionId);
    params = params.set('loadBooths', 'true');
    return this.httpService.get<ApiResponse<VirtualEventUserModel>>('fireworks/virtualEvent/GetVirtualEventUserDetail', params)
      .pipe(map(res => res));
  }

  public getSilentAuctions( eventId: string): Observable<ApiResponse<SilentAuctionModel[]>> {
    let params = new HttpParams();
    params = params.set('accessToken', this.eventAccessToken);
    params = params.set('browserSessionId', this.browserSessionId);
    params = params.set('eventId', eventId);
    return this.httpService.get<ApiResponse<SilentAuctionModel[]>>
    ('fireworks/virtualEvent/GetSilentAuctions', params)
      .pipe(map(resp => resp));
  }

  public getMemberDocuments(params: HandoutsSearchModel) {

    return this.httpService
      .post<ApiResponse<BasePagedListModel<HandoutsDataModel>>>('fireworks/virtualEvent/MemberDocuments', params)
      .pipe(map(resp => resp));
  }

}



