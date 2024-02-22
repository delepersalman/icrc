import { ChangeDetectorRef, Component, Input, OnInit,QueryList, Renderer2, ViewChildren,ViewContainerRef } from '@angular/core';
import { indexOf } from 'lodash-es';
import { ECImageViewModel } from 'src/app/shared/models/ec-image/ec-image-model';
import { EventGalleryModel, ngStyleModel, SectionPropertyModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';
import Swiper from 'swiper/bundle';

@Component({
  selector: 'theme1-event-gallary',
  templateUrl: './theme1-event-gallary.component.html',
  styleUrls: ['./theme1-event-gallary.component.scss']
})
export class Theme1EventGallaryComponent implements OnInit {
  @Input() eventGalleryData: EventGalleryModel;
  heading: SectionPropertyModel = new SectionPropertyModel();
  gallerySwiper: Swiper;
  ngStyle:ngStyleModel = new ngStyleModel();
  zoomButton: SectionPropertyModel = new SectionPropertyModel();
  @ViewChildren('appendItem', { read: ViewContainerRef })
  public dynComponents: QueryList<ViewContainerRef>;
  constructor(private globalService: GlobalService, private cd: ChangeDetectorRef) { }
domainUrl:string;
currentImageIndex = 0;
lightBox = document.createElement('div');
  ngOnInit(): void {  
    this.ngStyle.sectionTextColor =  this.eventGalleryData.ModuleTextColor;
    this.ngStyle.sectionBgColor = this.eventGalleryData.ModuleBGColor;
    this.domainUrl = environment.domainUrl;
    setTimeout(() => {
      this.gallerySwiper = new Swiper('#gallerySwiper', {
        slidesPerView: 5,
        spaceBetween: 10,
        loop: false,
        observer: true,
        // observeParents: true,
        breakpoints: {
          320: {
            slidesPerView: 1,
          },
          640: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 3,
          },
          1024: {
            slidesPerView: 5,
          },
          1680: {
            slidesPerView: 5,
          },
        },
        pagination: {
          el: ".swiper-pagination"
        },
      });
    }, 100);
  }
  changeAlignment(event){
    this.globalService.changeAlignment(event, this.eventGalleryData, this.ngStyle)
    this.cd.detectChanges();
  }
  ChangeDetect(event, section) {
    this.ngStyle = this.globalService.changeDetected(event, section, this.ngStyle, this.cd);
    this.cd.detectChanges();
  }
  showHideToolbar(event: any, prop: SectionPropertyModel) {
    this.dynComponents.map(
      (vcr: ViewContainerRef, index: number) => {
        vcr.clear();
        prop.expanded = false;
        if (vcr.element.nativeElement.innerText == event.target.innerText) {
          this.globalService.showHideToolbar(event, prop, this.ngStyle, vcr, this.eventGalleryData);
          prop.expanded = true;
        }
      })
  }

  openLightbox(images, durl){
    if(!this.zoomButton)
    return;
    let indexG;
    if(typeof images === 'object'){
      indexG = this.eventGalleryData.eventGallery.indexOf(images);
    }else {
      indexG = images;
    }
    const imgSrc = this.eventGalleryData.eventGallery[indexG].ImagePath;
    this.currentImageIndex = indexG;

    this.lightBox.classList.add('modal');
    document.getElementById('lighboxWrapper').appendChild(this.lightBox);
    
    const modalImg = document.createElement('img');
    modalImg.setAttribute('src', durl+imgSrc);
    this.lightBox.innerHTML = '';
    this.lightBox.appendChild(modalImg);
    this.lightBox.classList.add('open');
    document.getElementById('lighboxWrapper').classList.add('active');

    this.updateControls(this.eventGalleryData.eventGallery);

  }

  prevBtn(durl){
    this.currentImageIndex--;
      this.openLightbox(this.currentImageIndex, durl);
  }
  nextBtn(durl){
    this.currentImageIndex++;
      this.openLightbox(this.currentImageIndex, durl);
  }

  updateControls(images){
    if (this.currentImageIndex === 0) {
      document.getElementById('prev-btn').classList.add('disabled');
    } else {
      document.getElementById('prev-btn').classList.remove('disabled');
    }

    if (this.currentImageIndex === images.length - 1) {
      document.getElementById('next-btn').classList.add('disabled');
    } else {
      document.getElementById('next-btn').classList.remove('disabled');
    }
  }
  ngDoCheck():void{
    if(this.eventGalleryData.ComponentId){
      this.heading= this.eventGalleryData.SectionProperties.filter(a=>a.Name == 'GalleryHeading')[0];
      this.zoomButton = this.eventGalleryData.SectionProperties.filter(a => a.Name == 'EnableImageZoomDialog')[0];
     // this.Ques= this.eventGalleryData.SectionProperties.filter(a=>a.Name == 'Question')[0];
     // this.Ans= this.eventGalleryData.SectionProperties.filter(a=>a.Name == 'Answer')[0];
    }
  }
  closeLightbox(event){
    this.lightBox.classList.remove('open');
    document.getElementById('lighboxWrapper').classList.remove('active');
  }
  getStyleString(fieldName: SectionPropertyModel) {
    return this.globalService.getStyleString(fieldName);
  }
  getSectionStyleString(sectionName) {
    return this.globalService.getSectionStyleString(sectionName);
  }
}
