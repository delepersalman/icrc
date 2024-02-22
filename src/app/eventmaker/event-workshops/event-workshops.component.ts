import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import Swiper from 'swiper/bundle';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'theme1-event-workshops',
  templateUrl: './event-workshops.component.html',
  styleUrls: ['./event-workshops.component.scss']
})
export class EventWorkshopsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    const swiper = new Swiper('.swiper-container', {
      effect: "coverflow",
      grabCursor: true,
      centeredSlides: true,
      loop: true,
      // slidesPerView: 2,
      coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 600,
        modifier: 1,
        slideShadows: false
      },
      pagination: {
        el: ".swiper-pagination"
      },
      breakpoints: {
        640: {
          slidesPerView: 1,
        },
        768: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 2,
        },
      }
    });
  }

}
