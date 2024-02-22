import { ECImageViewModel } from "./ec-image-model";
import { CurrencyViewModel } from "./currency-view-model";

export class SilentAuctionModel {
    AuctionId: number;
    Title: string;
    AuctionImage: ECImageViewModel;
    Description: string;
    StartDate: Date;
    EndDate: Date;
    ExtensionDate: Date;
    TotalBids: number;
    HighestBids: number;
    TimeRemaining: number;
    TotalHoursLeft:number;
    Status: string;
    Currency: CurrencyViewModel;
    Deleted: boolean;
    Active: boolean;
    TimeZone: string;
    TimezoneAbrivation: string;
    UrlLeftPart: string;
    AuctionCustomUrl: string;
    FullAuctionUrl: string;
    countdownFormat: string = 'h\'h\':m\'m\':s\'s\'';
}