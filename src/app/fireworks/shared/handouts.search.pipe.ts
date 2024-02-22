
import { Pipe, PipeTransform } from '@angular/core';
import { HandoutsDataModel } from '../models/handouts.model';
@Pipe({
  name: 'handouts_search'
})
export class HandoutsSearchPipe implements PipeTransform {

  transform(value: HandoutsDataModel[], args?: any): any {
    if (!args) {
      return value;
    }
    return value.filter((val) => {
      let rVal = (val.FileName.toLocaleLowerCase().includes(args));
      return rVal;
    });
  }
}
