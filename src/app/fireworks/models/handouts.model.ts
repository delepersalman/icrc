import { BaseSearchModel } from './common.model';

export interface HandoutsDataModel {

  Id: number;
  Extension: string;
  FileName: string;
  Description: string;
  RoomType: string;
  FilePath: string;
  FileGuid: string;
  RoomName: string;
}

export interface HandoutsDocumentPreviewDialogData {
  PreviewDocumentUrl: any;
  DialogAction: string;
  IsOfficeDoc: boolean;
  IsPdfDoc: boolean;
  IsImageDoc: boolean;
}

export class HandoutsSearchModel extends BaseSearchModel {

  EventId: number;
  RoomId?: number
}
