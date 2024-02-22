import { ECImageViewModel } from '../ec-image/ec-image-model';
import { TicketLockResponseModel } from '../event/event-model';

export class WebSafeFont {
    WebSafeFontId: number;
    Name: string;
    Value: string;
    Type: string;
}

export class EventViewModel {
    EventId: number;
    EventTitle: string;
}

export class EventWebsiteModel {
    WebsiteDetailId: number;
    Event: EventViewModel = new EventViewModel();
    TemplateId: number;
    WebsiteUrl: string;
    WebsiteType: string;
    WebSafeFontId: number;
    FontStyle: string;
    FontSource: string;
    ThemeColors: EventmakerTemplateColorModel[] = [];
    FontType: string;
    CustomCss: string;
    HeaderFixed: boolean;
    AutoSaved: boolean;
    LogoImageId: number;
    Active: boolean;
    Deleted: boolean;
    LogoDetails: LogoDetailModel = new LogoDetailModel();
    Favicon: ECImageViewModel = new ECImageViewModel();
    BannerDetails: BannerDetailModel = new BannerDetailModel();
    LogoType: string;
    BannerType: string;
    BannerSize: number;
    BannerTypeId: number;
    FontList: WebSafeFont[] = [];
    EventPages: EventmakerPageModel[] = [];
    EventCustomPages: CustomPageModel[] = []
    SelectedComponents: number[] = [];
    TicketLockResponse: TicketLockResponseModel;
    TickerId: number = 0;
    DateInfo: EventDateViewModel;
    OnlineEvent: boolean;
    KmaEventId: number;
    State: EventTicketState;
    Discount: any;
}
export class SectionPropertyModel {
    EventmakerPagePropertyId: number;
    Name: string;
    LabelName: string;
    Type: string;
    TextFormat: string;
    TextAlignment: string;
    BGColor: string;
    BGImageId: number;
    BGImage: ECImageViewModel = new ECImageViewModel();
    FontSize: number
    FontWeight: string;
    Color: string;
    HoverColor: string;
    TextDecoration: string;
    FontStyle: string ='';
    ImagePath: string;
    CustomCss: string;
    CustomPropertyName: string;
    DisplayOrder: number;
    Active: boolean;
    Deleted: boolean;
    ShowOnHeader: boolean;
    IsEditable: boolean;
    IsSystemProperty: boolean;
    EventmakerWebsiteComponentId: number;
    SiblingList: SectionPropertyModel[];
    expanded: boolean = false;
    Url: string;
    CustomDateFormat: string;
    FieldId: number;
    DataFieldId: number;
    AnchorLink: string;
    CheckoutBGColor: string;
}
export class UploadType {
    Name: string;
    checked: boolean;
}
export class SectionPropertyRequestModel {
    SelectedPropertiess: number[] = [];
    EventmakerWebsiteComponentId: number;
    CustomPropertyName: string;
    ShowOnHeader: boolean;
    IsSystemProperty: boolean;
    CustomPageId: number;
    EventId: number;
    Type:string;
    TicketId: number;
}

export class EventmakerPageModel {
    PageSections: EventmakerSectionModel[] = [];
    WebsitePageId: number;
    PageName: string;
    PageSystemName: string;
    IsSystemPage: boolean;
    EventMakerId: number;
    IsExpanded: boolean = false;
}
export class EventmakerSectionModel {
    PageId: number;
    PageTitle: string;
    Selected: boolean;
    Active: boolean;
    Deleted: boolean;
    DisplayOrder: number;
    PageSystemName: string
    IsSystemModule: boolean;
    HomePageActive:boolean=true;
    HasProperties: boolean;
    ShowOnHeader: boolean;
    EventId: number;
    BGColor: string;
    TextColor: string;
    BGImageId: number;
    BGImage: ECImageViewModel = new ECImageViewModel();   
    SectionBGColor: string;
    SectionBGImageId: number;
    SectionBGImage: ECImageViewModel = new ECImageViewModel();
    SectionPadding: string;
    SectionBorder: string;
    BannerSectionPadding: string;
    BannerSectionBorder: string;
    EventmakerPagePropertyDesigns: SectionPropertyModel[]
    CustomPageData: CustomPageModel = new CustomPageModel();
    EventMakerWebsitePageId: number;
    OrganizerId: number;
    CustomSectionName: string;
    PropertyName: string;
}

export default class CustomPageModel {
    PageId: number;
    PageTitle: string;
    Description: string;
    PageImages: ECImageViewModel[] = [];
    VideoUrl: string;
    CustomPageActionLink: CustomPageLinkButtons[] = [];
    Selected: boolean;
    UserId: string;
    Active: boolean = true;
    Deleted: boolean = false;
    ActionLinkId: 0;
    CustomPageId: 0;
    ActionLinkName: string;
    ActionLinkUrl: '';
    ActionLinkTarget:string;
    ActionLinkCSS: ''
    ShowOnHeader: boolean;
    IsSystemModule: boolean;
    CustomPageData: CustomPageModel | undefined;
    EventMakerWebsiteId: number;
    EventMakerWebsitePageId: number;
    selectedComponents: number[] = [];
    EventmakerWebsiteComponentId: number;
    PageSystemName: string;
    EventId: number;
    UploadType: number;
    CustomSectionName: string;
    WebsiteType: string;
}
export class ComponentOrderModel {
    SelectedComponents: number[] = [];
    EventMakerWebsiteId: number;
    EventId: number;
}
export enum EventTicketState { Price = 0, NotAvailable = 1, SoldOut = 2, RegistrationClosed = 3 }
export class ContactUsModel {
    Name: string
    Email; string
    PhoneNoWithoutCode: string
    PhoneNo: string
    cCode: string;
    CompanyName: string
    JobTitle: string
    Message: string;
    EventId: number;
    OrganizerId: number
}
export class BaseEntityModel {
    ModuleName: string;
    ShowOnHeader: boolean
    ComponentId: number;
    EventmakerWebsiteComponentId: number;
    EditMode: boolean;
    ModuleBGColor: string;
    ModuleTextColor: string;
    ModuleBGImageId: number;
    Active: boolean;
    Deleted: boolean;
    BGImage: ECImageViewModel = new ECImageViewModel();
    SectionProperties: SectionPropertyModel[];
    ThemeName: string;
    EventId:number;
    FontStyleList:any[];
    SectionBGColor: string;
    SectionBGImageId: number;
    SectionBGImage: ECImageViewModel = new ECImageViewModel();
    SectionPadding: string;
    SectionBorder: string;
    BannerSectionPadding: string;
    BannerSectionBorder: string;
    SectionTitle: string;
}
export class CustomPageLinkButtons {
    ActionLinkId: number;
    CustomPageId: number;
    ActionLinkName: string;
    ActionLinkUrl: string;
    ActionLinkTarget: string;
    ActionLinkCSS: string;
}
export class ngStyleModel {
    TextDecoration: string;
    TextFormat: string;
    FontWeight: string;
    FontSize: number;
    FontStyle: string;
    FontStyleList : [];
    textColor: string;
    bgColor: string;
    HoverColor: string;
    TextAlignment: string;
    changeBackground: string;
    sectionBgColor: string;
    sectionTextColor: string;
    BGImage: ECImageViewModel = new ECImageViewModel();
    SectionBGImage: ECImageViewModel = new ECImageViewModel();
    textBtnColor: string;
    btnBgColor: string;
    PropertyName: string;
    CustomName: string;
    Target: any;
    Editable: boolean;
    SectionName: string;
    IsDateFormateEnabled: boolean;
    CustomDateFormat: string;
    FieldId: number;
    ChangeType: string;
    EventmakerWebsiteComponentId: number;
    AnchorLink: string;
    SectionPadding: string;
    SectionBorder: string;
    SectionTitle: string;
    SectionType: string;
    CheckoutBGColor: string;
    websiteDetails:any;
    BannerSectionPadding: string;
    BannerSectionBorder: string;
    BannerSectionBGColor: string;
    TicketTypeId:number;
}

export class EventIntroModel extends BaseEntityModel {
    EventID: number;
    EventType: string;
    EventCategory: string;
    EventSubCategory: string;
    EventTitle: string;
    TimeZone: string;
    EventUrl: string;
    EventStatus: string;
    AddressStatus: string;
    VenueName: string;
    Address: string;
    Address1: string;
    Latitude: string;
    Longitude: string;
    OnlineEvent: boolean;
    PriceRange: string;
    ButtonText: string;
    ImageUrl: string;
    DateInfo: EventDateViewModel;
    EventDescription: string;
    ViewsLikes: ViewIncreamentModel;
    ViewsVotes: ViewIncreamentModel;
    EventDateTimeInfoString: string;
    AvailableDates: EventDateViewModel[]
    Lat: string;
    Long: string;
}
export class EventCheckoutModel extends BaseEntityModel {
    EventId: number;
    EventCustomPages: EventmakerPageModel
}
export class EventFooter extends BaseEntityModel{
    
}
export class ViewIncreamentModel {
    Processed: boolean;
    AlreadyProcessed: boolean;
    Count: number
}
export class EventCheckoutSettingModel extends BaseEntityModel {
    EstartDate: Date;
    EventTitle: string;
    Memberships: [];
    memberEnabled: false;
    StateList:[];
    Tickets: any[] = [];
    TimeLimit: number;
    TotalAmount: number;
    VenueName: "";
    PurchaseInfo:any;
    VariableChargeGroups: any;
    UserQuestions: any;   
    WebsiteId: number =0; 
}

export enum ScheduleFrequency { Single, Monthly, Weekly, Daily, Custom }

export class EventDateViewModel {

    IsNewDate: boolean;
    Frequency: ScheduleFrequency;
    StartDateTime: Date;
    NextDateTime: Date;
    EndDateTime: Date;
    MonthlyDay: number;
    MonthlyWeekNum: number;
    CustomDatesString: string;
    TimeZoneShortName: string;
    TimeZone: any;
    UtcStartDate: Date;
    UtcNextDate: Date;
    UtcEndDate: Date;
    Weekdays: [];
    IsDateNull:boolean;
}

export class HeaderModel extends BaseEntityModel {
    Url: string;
}
export class EventDescriptionModel extends BaseEntityModel {
    EventID: number;
    EventDescription: string;
    ImageUrl: string;
    Organizer: OrganizerInfoViewModel = new OrganizerInfoViewModel();
}
export class EventRefundPolicyDescriptionModel extends BaseEntityModel {
    EventID: number;
    EventPolicyDescription: string;
}
export class CustomPageSesstionModel extends BaseEntityModel {
    eventCustomPages: EventmakerSectionModel
}
export class EventAgendaModel extends BaseEntityModel {
    AgendaTitle: string;
    AgendaList: AgendaModel[] = [];;
}
export class AgendaModel {
    Speakers: EventSpeakerModel[] = [];
    Sponsors: EventSponsorModel[] = [];
    TicketList: string[] = [];
    ScheduleId: number = 0;
    Title: string;
    Description: string;
    EndDateUnix: number;
    StartDateUnix: number
    StartDateUTC: Date;
    EndDateUTC: Date;
    StartDate: Date;
    EndDate: Date;
    Path: string;
    ImageName: string;
    RoomName: string;
    Duration: number;
    DurationText: string;
    Time: string;
    EndTime: string;
    TimeZoneName: string;
    VenueName: string;
    Address: string;
    EventId: number;
    EventName: string;
    FireworksUrl: string;
    IsFireworkEnable: boolean;
    PurchasedQuantity: number;
    BGColor: string;
}
export class EventCountdownModel extends BaseEntityModel {
    timerData: any
}

export class OrganizerInfoViewModel extends BaseEntityModel {
    OrganizerId: number;
    OrganizerName: string;
    ImageUrl: string;
    BannerImageUrl: string;
    WebsiteUrl: string;
    FBLink: string;
    LinkdeInLink: string;
    TwitterLink: string;
    InstagramUrl: string;
    HasMembership: boolean;
    ContactUrl: string;
    ProfileUrl: string;
    JoinMembershipUrl: string;
    BGColor: string;
    TextColor: string;
}

export class EventSponsorModel extends BaseEntityModel {
    EventSponsorId: number;
    EventId: number;
    ECImageId: number;
    ImagePath: string;
    ImageName: string;
    SponsorName: string;
    SponsorUrl: string;
    TextColor: string;
    BGColor: string;
    CategoryName: string;
}
export class EventGalleryModel extends BaseEntityModel {
    eventGallery: ECImageViewModel[] = [];

}
export class EventSponsors extends BaseEntityModel {
    eventSponsors: EventSponsorModel[] = [];
}
export class EventSpeakerModel extends BaseEntityModel {
    EventSpeakerId: number;
    EventId: number;
    ECImageId: number;
    ImagePath: string;
    ImageName: string;
    SpeakerName: string;
    Title: string;
    Description: string;
    TextColor: string;
    BGColor: string;
    CategoryName: string;
}
export class EventSpeakers extends BaseEntityModel {
    eventSpeakers: EventSpeakerModel[] = [];
}

export class EventFAQModel extends BaseEntityModel {
    EventFaqId: number;
    Question: string;
    Answer: string;
    isExpanded: boolean = false;
    TextFormat: string;
    TextAlignment: string;
    BGColor: string;
    FontSize: number
    FontStyle: string;
    FontWeight: string;
    Color: string;
    TextDecoration: string;
    AnswerTextFormat: string;
    AnswerTextAlignment: string;
    AnswerBGColor: string;
    AnswerFontSize: number
    AnswerFontFamily: string;
    AnswerFontWeight: string;
    AnswerColor: string;
    AnswerTextDecoration: string;
    AnswerFontStyle: string;
}
export class EventFAQListModel extends BaseEntityModel {
    eventFAQs: EventFAQModel[] = [];
}

export class LogoDetailModel {
    Image: ECImageViewModel = new ECImageViewModel();
    ImageUrl: string;
    Text: string;
    LogoHeight: number;
    LogoWidth: number;
    LogoTypeId: number
}
export class BannerDetailModel {
    BannerType: number;
    Image: ECImageViewModel = new ECImageViewModel();
    ImageUrl: string;
    BannerSize: number;
}
export class EventmakerTemplateColorModel {
    ColorId: number;
    Color: string;
    ColorName: string;
    TemplateId: number;
    Active: boolean;
    Deleted: boolean;
}
