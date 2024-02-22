
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { MessageService } from '../services/message.service';
import { ApiResponse } from '../models/api.response.model';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(protected messageService: MessageService) {

  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        retry(1),
        catchError((error: HttpErrorResponse) => {
          if (error && error.error) {
            var errorData = error.error as ApiResponse<any>;
            if (errorData.Messages.length > 0) {

              let message = errorData.Messages.join();
              //TODO
              if (message.indexOf('This URL is being used by someone') > -1) {
                this.messageService.showErrorMessage(message, false);
              }
              else {
                this.messageService.showErrorMessage(message);
              }
            }
          }
          return throwError(error);
        })
      )
  }
}
