import { Component, Input, OnInit } from '@angular/core';
import { SilentAuctionModel } from 'src/app/shared/models/silent-auction-model';
import { environment } from 'src/environments/environment';
import { SharedFireworksComponentService } from '../../services/shared.service';
import { SilentAuctionService } from './silent-auction.service';

@Component({
  selector: 'silent-auction',
  templateUrl: './silent-auction.component.html',
  styleUrls: ['./silent-auction.component.scss']
})
export class SilentAuctionComponent implements OnInit {

  @Input() eventId: string;

  dataLoading = false;
  domainUrl = environment.domainUrl;
  silentAuctionsData: SilentAuctionModel[] = [];
  silentAuctions: SilentAuctionModel[] = [];
  constructor(
    public sharedService: SharedFireworksComponentService,
    private silentAuctionService: SilentAuctionService) {

      const eventId = this.sharedService.virtualEventUser.VirtualEvent.EventId.toString();
      this.dataLoading = true;
      this.silentAuctionService.getSilentAuctions(eventId).subscribe(s => {
        this.dataLoading = false;
        this.silentAuctionsData = s.Data;
        this.silentAuctions = s.Data;
        this.silentAuctions.forEach(sa => {
          this.setCountdownFormat(sa);
        });
      }, (error) => {
        this.dataLoading = false;
       });
  }

  ngOnInit(): void {

  }

  searchSilentAuctions(ev: any): void {
    this.silentAuctions = this.silentAuctionsData.filter(sa => sa.Title.toLowerCase().indexOf(ev.target.value) >= 0);
  }

  setCountdownFormat(sa: SilentAuctionModel): void {
    if (sa.TimeRemaining > 0 && !sa.countdownFormat) {
      sa.TotalHoursLeft = (sa.TimeRemaining / 60 / 60);
      if (sa.TimeRemaining > (24 * 60 * 60)) { // Greater than a day
        sa.countdownFormat = 'd\'d\':h\'h\':m\'m\':s\'s\'';
      } else if (sa.TimeRemaining > (60 * 60)) { // Greater than an hour
        sa.countdownFormat = 'h\'h\':m\'m\':s\'s\'';
      }
      else if (sa.TimeRemaining > 60) { // Greater than a minute
        sa.countdownFormat = 'm\'m\':s\'s\'';
      }
    }
  }

  onCountdownFinish(sa: SilentAuctionModel) {

  }
}
