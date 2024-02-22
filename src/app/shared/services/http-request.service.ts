import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

const apiUrl = `${environment.apiBaseUrl}`;

@Injectable({
  providedIn: 'root'
})
export class HttpRequestService {

  constructor(private http: HttpClient) { }

  requestHeader = {
    headers: new HttpHeaders(),
    params: {}
  }

  get<T>(serviceEndpoint: string, params: HttpParams): Observable<T> {
    let url = `${apiUrl}${serviceEndpoint}`;
    this.requestHeader.params = params
    return this.http.get<T>(url, this.requestHeader);
  }

  post<T>(serviceEndpoint: string, data: any): Observable<T> {
    let url = `${apiUrl}${serviceEndpoint}`;
    return this.http.post<T>(url, data, this.requestHeader);
  }

  postAsCompleteUrl<T>(url: string, data: any): Observable<T> {
    return this.http.post<T>(url, data, this.requestHeader);
  }

  getAsCompleteUrl<T>(url: string): Observable<T> {
    return this.http.get<T>(url, this.requestHeader);
  }
}
