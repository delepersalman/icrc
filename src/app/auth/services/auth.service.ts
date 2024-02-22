import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, mapTo, map } from 'rxjs/operators';
import { HttpErrorHandler, HandleError } from '../../shared/services/http-error-handler.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

import { TokenStorageService } from './token.storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private handleError: HandleError;

  redirectUrl: string;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler,
    private toeknStorageService: TokenStorageService
  ) {
    this.handleError = this.httpErrorHandler.createHandleError('AuthService')
  }

  login(data: any): Observable<any> {
    return this.http
      .post(environment.apiBaseUrl + 'account/login', data)
      .pipe(map(resp => { this.toeknStorageService.saveToken('tokenforuser'); return resp }));
  }

  isAuthenticated() {
    const token = this.toeknStorageService.getToken();
    if (token) {
      return true;
    }
    return false;
  }

  logout() {
    this.toeknStorageService.removeToken();
  }
}
