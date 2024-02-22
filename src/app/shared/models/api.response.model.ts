
export enum StatusCode {

  Ok = 200,
  BadRequest = 400,
  Error = 500
  //TODO
}

export interface ApiResponse<T> {

  Version: string,
  StatusCode: StatusCode,
  Messages: string[],
  Data: T
}
