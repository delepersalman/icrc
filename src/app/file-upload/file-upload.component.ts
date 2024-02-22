import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ECImageViewModel } from '../shared/models/ec-image/ec-image-model';
import { GlobalService } from '../shared/services/global-service';
@Component({
  selector: 'file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  imageData: ECImageViewModel = new ECImageViewModel();
  @Input() inputImageList: ECImageViewModel[] = [];
  timeout = 10;
  @Input() multiple: boolean = false;
  domainUrl:string;
  @Output() onImageSelect: EventEmitter<any> = new EventEmitter<any>();
  constructor(private gloableService: GlobalService) { }

  ngOnInit(): void {
this.domainUrl = environment.domainUrl;
  }

  validateImage(file): boolean {
    var ValidImageTypes = ["image/gif", "image/jpeg", "image/png", "image/x-icon"];
    if (ValidImageTypes.indexOf(file.type) > -1) {
      if (file.size <= 4 * 1024 * 1024)
        return true;
      else {
        alert("Sorry, your image is over 4MB, please try an image under 4MB");
      }
    } else {
      alert("Uploaded file is not an image!")
    }
    return false;
  };

  onFileChange(event) {
    if (event.target.files && event.target.files.length) {
      let files = event.target.files;
      this.timeout = this.multiple ? files.length * 10 : 10;
      var fd = new FormData();
      for (let file of files) {
        if (this.validateImage(file)) {
          fd.append('files', file);
          this.gloableService.uploadImages(fd).subscribe((res: ECImageViewModel[]) => {
            if (res) {        
              this.inputImageList.push(res[0]);
              this.onImageSelect.emit(res);
            }
          })
        }
      }
    }
  }

  deleteImage(image, deleteFrom) {
    if (image) {
      this.gloableService.deleteImage(JSON.stringify(image)).subscribe(res => {
        if (res) {
          this.inputImageList.splice(this.inputImageList.indexOf(image), 1);
          this.onImageSelect.emit(this.inputImageList);
        }
      })
    }
  }
}
