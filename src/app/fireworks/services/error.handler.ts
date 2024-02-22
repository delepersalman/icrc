
import { ErrorHandler, Injectable, Injector} from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {

    constructor(private injector: Injector) {
    }

    handleError(error) {

        let router = this.injector.get(Router);
        console.log('URL: ' + router.url);
        console.error('An error occurred:', error.message);
   }
}
