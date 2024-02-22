import { Component, OnInit } from '@angular/core';
import { SharedFireworksComponentService } from '../../services/shared.service';

@Component({
  selector: 'fireworks-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss']
})
export class SplashScreenComponent implements OnInit {

  constructor(public sharedService: SharedFireworksComponentService) { }

  ngOnInit(): void {
  }

}
