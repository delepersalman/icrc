import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DatePipe, formatDate } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, ComponentFactoryResolver, ComponentRef, Injectable, QueryList, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';
import { ButtonDesignerToolbarComponent } from 'src/app/eventmaker/component-setting/button-designer-toolbar/button-designer-toolbar.component';
import { DesignerToolbarComponent } from 'src/app/eventmaker/component-setting/designer-toolbar/designer-toolbar.component';
import { ECImageViewModel } from '../models/ec-image/ec-image-model';
import { EventDateViewModel, EventmakerSectionModel, ngStyleModel, ScheduleFrequency, SectionPropertyModel } from '../models/event-maker/event-maker-model';
import { HttpRequestService } from './http-request.service';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GlobalService {
    eventEndDate: any;
    onLogoDetailChagne: Subject<any> = new Subject<any>();
    onBannerDetailChagne: Subject<any> = new Subject<any>();
    onChangeFaviconDetails: Subject<any> = new Subject<any>();
    onShowLoader: Subject<boolean> = new Subject<boolean>();
    onShowToast: Subject<any> = new Subject<any>();
    onAutoSaved: Subject<any> = new Subject<any>();
    onFieldDataChanged: Subject<any> = new Subject<any>();
    onDesignChanged: Subject<any> = new Subject<any>();
    isEditMode: Subject<any> = new Subject<any>();
    onPromoCodeChanged: Subject<any> = new Subject<any>();
    onPromoCodeRemoved: Subject<any> = new Subject<any>();
    onTicketLoadedAfterPromoCodeChanged: Subject<any> = new Subject<any>();
    onRegistrationClosed: Subject<any> = new Subject<any>();
    onSaved: Subject<any> = new Subject<any>();
    private componentRef: ComponentRef<any>;
    constructor(private httpRequest: HttpRequestService, private resolver: ComponentFactoryResolver) { }

    showLoader(show) {
        this.onShowLoader.next(show);
    }
    autoSaved(value) {
        this.onAutoSaved.next(value);
    }
    showToast(message, type) {
        this.onShowToast.next({ message: message, type: type });
    }
    changeLogoDetails(data) {
        this.onLogoDetailChagne.next(data);
    }
    changeDesign(data) {
        this.onDesignChanged.next(data);
    }
    SetEditMode(data) {
        this.isEditMode.next(data);
    }
    changeBannerDetails(data) {
        this.onBannerDetailChagne.next(data)
    }
    changeFaviconDetails(data) {
        this.onChangeFaviconDetails.next(data)
    }
    setPromoCode(code: string) {
        this.onPromoCodeChanged.next(code);
    }
    setTicketLoadedAfterPromoCodeChanged(status: boolean) {
        this.onTicketLoadedAfterPromoCodeChanged.next(status);
    }
    removePromoCode() {
        this.onPromoCodeRemoved.next();
    }
    changeFieldData(value) {
        this.onFieldDataChanged.next(value);
    }
    registrationClosed(value) {
        this.onRegistrationClosed.next(value);
    }
    saved(value) {
        this.onSaved.next(value);
    }
    monthlyWeekList = [
        { Name: "First", Value: 1 },
        { Name: "Second", Value: 2 },
        { Name: "Third", Value: 3 },
        { Name: "Fourth", Value: 4 },
        { Name: "Fifth", Value: 5 }
    ];

    ordinalSuffix(i) {
        var j = i % 10,
            k = i % 100;
        if (j == 1 && k != 11) {
            return i + "st";
        }
        if (j == 2 && k != 12) {
            return i + "nd";
        }
        if (j == 3 && k != 13) {
            return i + "rd";
        }
        return i + "th";
    }

    getEventDateTimeInfoString(dateInfo: EventDateViewModel, showTimeZone: any, dateFormat: string, isEndDateEnabled: any = false, isDateEnabled: any = false) {
        var result = "";
        var timezone = "";
        if (showTimeZone && dateInfo.TimeZoneShortName)
            timezone = " " + dateInfo.TimeZoneShortName;
        if (ScheduleFrequency[dateInfo.Frequency].toLowerCase() === "single") {
            if (dateFormat)
                result = this.CustomFormatDate(dateInfo.StartDateTime, dateFormat, dateInfo.TimeZoneShortName) + timezone;
            else
                result = this.FormatDateTimeWithWeekday(dateInfo.StartDateTime) + timezone;

            if (dateInfo.EndDateTime !== dateInfo.StartDateTime) {
                if ((isDateEnabled && isEndDateEnabled) || isDateEnabled) {
                    if (dateFormat) {
                        result = result + (isEndDateEnabled ? ' to ' + this.CustomFormatDate(dateInfo.EndDateTime, dateFormat, dateInfo.TimeZoneShortName) + timezone : '');
                    } else {
                        result = result + (isEndDateEnabled ? ' to ' + this.FormatDateTimeWithWeekday(dateInfo.EndDateTime) + timezone : '');
                    }
                } else if (!isDateEnabled && isEndDateEnabled) {
                    result = this.FormatDateTimeWithWeekday(dateInfo.EndDateTime) + timezone
                }
            }

        }
        else if (ScheduleFrequency[dateInfo.Frequency].toLowerCase() === "monthly") {
            if (dateInfo.MonthlyDay)
                result = "Monthly, every " + this.ordinalSuffix(dateInfo.MonthlyDay) + " day of month, "
                    + this.FormatTime(dateInfo.NextDateTime) + timezone + " to " + this.FormatTime(dateInfo.EndDateTime) + timezone
                    + ", From " + this.CustomFormatDate(dateInfo.NextDateTime, dateFormat, dateInfo.TimeZoneShortName) + " to " + this.CustomFormatDate(dateInfo.EndDateTime, dateFormat, dateInfo.TimeZoneShortName);
            else
                result = "Monthly, every " + this.monthlyWeekList[dateInfo.MonthlyWeekNum].Name + " week of month ("
                    + dateInfo.Weekdays.join(', ') + "), " + this.FormatTime(dateInfo.NextDateTime) + timezone + " to " + this.FormatTime(dateInfo.EndDateTime) + timezone
                    + ", From " + this.FormatDate(dateInfo.NextDateTime) + " to " + this.FormatDate(dateInfo.EndDateTime);
        }
        else if (ScheduleFrequency[dateInfo.Frequency].toLowerCase() === "daily") {
            result = "Daily, " + this.FormatTime(dateInfo.NextDateTime) + timezone + " to " + this.FormatTime(dateInfo.EndDateTime) + timezone
                + ", From " + this.FormatDate(dateInfo.NextDateTime) + " to " + this.FormatDate(dateInfo.EndDateTime);
        }
        else if (ScheduleFrequency[dateInfo.Frequency].toLowerCase() === "custom") {
            result = dateInfo.CustomDatesString;
        }
        else {
            result = 'Weekly, (' + dateInfo.Weekdays.join(', ') + ') ' + this.FormatTime(dateInfo.NextDateTime) + timezone + ' to '
                + this.FormatTime(dateInfo.EndDateTime) + timezone + ', From ' + this.FormatDate(dateInfo.NextDateTime) + " to " + this.FormatDate(dateInfo.EndDateTime);
        }
        return result;
    }

    FormatDateTimeWithWeekday(date) {
        var myDate = new Date(date);
        if (Object.prototype.toString.call(date) !== '[object Date]')
            myDate = new Date(myDate.getTime() + myDate.getTimezoneOffset() * 60000);
        var options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        return myDate.toLocaleDateString('en-US', options);
    }
    CustomFormatDate(date, dateFormat, TimeZoneShortName) {
        var myDate = new Date(date);
        myDate = new Date(myDate.getTime() + myDate.getTimezoneOffset() * 60000);
        return formatDate(myDate, dateFormat, 'en-US');
    }
    FormatDate(date) {
        var myDate = new Date(date);
        myDate = new Date(myDate.getTime() + myDate.getTimezoneOffset() * 60000);
        var options = { year: 'numeric', month: 'numeric', day: 'numeric' };
        return myDate.toLocaleDateString('en-US', options);
    }

    FormatTime(date) {
        var myDate = new Date(date);
        myDate = new Date(myDate.getTime() + myDate.getTimezoneOffset() * 60000);
        var options = { hour: 'numeric', minute: 'numeric' };
        return myDate.toLocaleTimeString('en-US', options);
    }

    setUTC(date) {
        if (date.length == 19)
            return date + "Z";
        return date;
    }

    uploadImages(fd: FormData) {
        return this.httpRequest.post<ECImageViewModel[]>("api/image/UploadImages", fd);
    }

    deleteImage(data: string) {
        var pareams = new HttpParams().append("json", data);
        return this.httpRequest.get<any>("api/image/DeleteImage", pareams);
    }
    closeToolBar() {
        let classList = document.getElementsByClassName('Clicked');
        if (classList.length > 0) {
            for (let i = 0; i < classList.length; i++) {
                classList[i].classList.remove('Clicked');
            }
        }
    }
    clearToolBar(dynComponents:  any, e: any){      
            dynComponents.forEach(element => {
              if (e.target !== element.element.nativeElement && e.target.parentElement && e.target.parentElement.parentElement && e.target.parentElement.parentElement.nodeName !== 'BUTTON' && e.target.parentElement.parentElement.nodeName !== "DESIGNER-TOOLBAR") {
                element.clear();
                return;
              }
            });
    }
    showHideButtonToolbar(event: any, prop: SectionPropertyModel, ngStyle: ngStyleModel) {
        this.closeToolBar();
        ngStyle.Editable = prop.IsEditable;
        ngStyle.Target = event.target;
        ngStyle.PropertyName = prop.Name;
        ngStyle.TextFormat = prop.TextFormat;
        ngStyle.TextDecoration = prop.TextDecoration;
        ngStyle.FontStyle = prop.FontStyle
        ngStyle.bgColor = prop.BGColor;
        ngStyle.textColor = prop.Color;
        ngStyle.TextAlignment = prop.TextAlignment;
        ngStyle.FontWeight = prop.FontWeight;
        ngStyle.CustomName = prop.CustomPropertyName;
        event.target.classList.add('Clicked');
    }
    showHideToolbar(event: any, prop: SectionPropertyModel, ngStyle: ngStyleModel, target?: ViewContainerRef, section?: any, Isbutton: boolean = false, isDateFormateEnabled: boolean = false, websiteDetails: any = undefined): ngStyleModel {
        ngStyle.CustomName = prop.CustomPropertyName;
        ngStyle.EventmakerWebsiteComponentId = prop.EventmakerWebsiteComponentId;
        ngStyle.Editable = prop.IsEditable;
        ngStyle.IsDateFormateEnabled = isDateFormateEnabled;
        ngStyle.CustomDateFormat = prop.CustomDateFormat;
        ngStyle.FieldId = prop.FieldId;
        ngStyle.FontStyleList = section.FontStyleList;
        ngStyle.AnchorLink = prop.AnchorLink;
        ngStyle.SectionName = section.ModuleName;
        ngStyle.Target = event.target;               
        ngStyle.PropertyName = prop.Name;
        ngStyle.TextFormat = prop.TextFormat;
        ngStyle.TextDecoration = prop.TextDecoration;
        ngStyle.bgColor = prop.BGColor;
        ngStyle.textColor = prop.Color;
        ngStyle.CheckoutBGColor= prop.CheckoutBGColor;
        ngStyle.HoverColor = prop.HoverColor;
        ngStyle.TextAlignment = prop.TextAlignment;
        ngStyle.FontWeight = prop.FontWeight;
        ngStyle.FontSize = prop.FontSize ? prop.FontSize : 0;
        ngStyle.BGImage = prop.BGImage;
        ngStyle.FontStyle = prop.FontStyle;  
        if (section.EditMode) {
            let classList = event.target.parentElement.getElementsByClassName('Clicked');
            if (classList.length > 0) {
                for (let i = 0; i < classList.length; i++) {
                    classList[i].classList.remove('Clicked');
                }
            }
            if (prop.expanded) {
                // clear old message
                target.clear();
                prop.expanded = false;
            } else {
                let childComponent: any = (Isbutton ? this.resolver.resolveComponentFactory(ButtonDesignerToolbarComponent) : this.resolver.resolveComponentFactory(DesignerToolbarComponent));
                this.componentRef = target.createComponent(childComponent);
                this.componentRef.instance.ngStyle = ngStyle;
                this.componentRef.instance.eventTextFormatAlignment.subscribe(val => {
                    ngStyle = val;
                    this.changeAlignment(event, section, ngStyle);
                    target.clear();
                    // prop.expanded = false;
                });
                this.saved(false);
                //  event.target.classList.add('Clicked');
                            
                const rect = event.target.getBoundingClientRect();
                if (rect.left > window.innerWidth / 2) {
                    setTimeout(function () {
                        if(event.target.nextSibling.style){
                        event.target.nextSibling.style.right = 0;
                        event.target.nextSibling.style.display = 'inline-block';
                        }
                    }, 400);
                } else {
                    setTimeout(function () {
                        if(event.target.nextSibling.style){
                        event.target.nextSibling.style.left = 0;
                        event.target.nextSibling.style.display = 'inline-block';
                        }
                    }, 400);
                }

                prop.expanded = true;
                return ngStyle;
            }
        }

    }
    changeAlignment(event, section: any, ngStyle: ngStyleModel, isDrop: boolean = false) {
        // ngStyle = event;
        section.EventmakerWebsiteComponentId = ngStyle.EventmakerWebsiteComponentId;
        section.SectionProperties.forEach(a => {

            if (a.Name === ngStyle.PropertyName && (ngStyle.FieldId && (ngStyle.PropertyName !=="TicketCheckoutBox" && ngStyle.PropertyName !== "AgendaBox" && ngStyle.PropertyName !== "TicketBox" && ngStyle.PropertyName !== "OrganiserBox" && ngStyle.PropertyName !== "SpeakerBox" && ngStyle.PropertyName !== "SponsorBox" && ngStyle.PropertyName !== "Question" && ngStyle.PropertyName !== "Answer")? (a.DataFieldId === ngStyle.FieldId):true)) {
                section.PropertyName = ngStyle.PropertyName;
                this.applySyle(ngStyle, a);
            }
            a.SiblingList.filter(x => x.Name == ngStyle.PropertyName).forEach(sibLing => {
                a.TextAlignment = ngStyle.TextAlignment;
                if (sibLing.Name == ngStyle.PropertyName) {
                    this.applySyle(ngStyle, sibLing);
                }
            });
        });
        if (!ngStyle.PropertyName && !isDrop && ngStyle.ChangeType) {
            if (ngStyle.ChangeType === 'Reset' && ngStyle.SectionType === 'SectionBanner') {
                section.SectionBGColor = "";
                section.BannerSectionBorder = "";
                section.BannerSectionPadding = "";
                section.SectionBGImage = null;
                section.SectionBGImageId = 0;
            }else if (ngStyle.ChangeType === 'Reset' && ngStyle.SectionType !== 'SectionBanner') {
                section.BGImage = null;
                section.ModuleBGColor = "";
                section.ModuleTextColor = "";
                section.ModuleBGImageId = 0;
                section.SectionPadding = "";
                section.CheckoutBGColor = "";
                section.SectionBorder = "";  
            }
            else if (ngStyle.ChangeType === 'TextColor') {
                section.ModuleTextColor = ngStyle.sectionTextColor;
            }
            else if (ngStyle.ChangeType === 'SectionPadding' && ngStyle.SectionType === 'SectionBanner') {
                section.BannerSectionPadding = ngStyle.BannerSectionPadding;
            }
            else if (ngStyle.ChangeType === 'SectionBorder' && ngStyle.SectionType === 'SectionBanner') {
                section.BannerSectionBorder = ngStyle.BannerSectionBorder;
            }
            else if (ngStyle.ChangeType === 'SectionPadding' && ngStyle.SectionType !== 'SectionBanner') {
                section.SectionPadding = ngStyle.SectionPadding;
            }
            else if (ngStyle.ChangeType === 'SectionBorder' && ngStyle.SectionType !== 'SectionBanner') {
                section.SectionBorder = ngStyle.SectionBorder;
            }            
            else {
                if (ngStyle.SectionType === 'SectionBanner') {
                    if (ngStyle.ChangeType === 'BGColor') {
                        section.SectionBGColor = ngStyle.BannerSectionBGColor;
                        section.SectionBGImage = null;
                    }
                    else if (ngStyle.ChangeType === 'BGImage') {
                        section.SectionBGImage = ngStyle.BGImage;
                        section.SectionBGColor = "";
                        section.SectionBGImageId = ngStyle.BGImage?.ECImageId;
                    }
                }
                else {
                    if (ngStyle.ChangeType === 'BGColor') {
                        section.ModuleBGColor = ngStyle.bgColor;
                        section.BGImage = null;
                    }
                    else if (ngStyle.ChangeType === 'BGImage') {
                        section.BGImage = ngStyle.BGImage;
                        section.ModuleBGColor = "";
                        section.BGImageId = ngStyle.BGImage?.ECImageId;
                    }
                }
            }

        }
        this.changeDesign(section);
        this.saved(false);
        this.closeToolBar();
    }
    applySyle(ngStyle, prop) {
        if (ngStyle.ChangeType === "Reset") {
            prop.CustomPropertyName = ngStyle.CustomName;
            prop.CustomDateFormat = "";
            prop.AnchorLink = "";
            prop.FieldId = ngStyle.FieldId;
            prop.TextFormat = "";
            prop.TextDecoration = "";
            prop.HoverColor = ""; 
            prop.FontSize = 0;
            prop.FontStyle = "";
            prop.BGColor = "";
            prop.Color = "";
            prop.TextAlignment = "";
            prop.FontWeight = "";
            prop.BGImageId = 0;
            prop.CheckoutBGColor = "";
            prop.BGImage = null;
        }
        else {
            prop.CustomPropertyName = ngStyle.CustomName;
            prop.CustomDateFormat = ngStyle.CustomDateFormat;
            prop.AnchorLink = ngStyle.AnchorLink;
            prop.FieldId = ngStyle.FieldId;
            prop.TextFormat = ngStyle.TextFormat;
            prop.FontStyle = ngStyle.FontStyle;
            prop.FontSize = ngStyle.FontSize ? ngStyle.FontSize : 0;
            prop.TextDecoration = ngStyle.TextDecoration;
            prop.Color = ngStyle.textColor;
            prop.HoverColor = ngStyle.HoverColor;
            prop.CheckoutBGColor = ngStyle.CheckoutBGColor;
            prop.TextAlignment = ngStyle.TextAlignment;
            prop.FontWeight = ngStyle.FontWeight;
            if (ngStyle.ChangeType === 'BTNBGImage') {
                prop.BGImage = ngStyle.BGImage;
                prop.BGImageId = ngStyle.BGImage?.ECImageId;
                prop.BGColor = "";
            }
            else if (ngStyle.bgColor) {
                prop.BGColor = ngStyle.bgColor;
                prop.BGImage = null;
                prop.BGImageId = 0;
            }
        }
    }

    drop(event: CdkDragDrop<string[]>, Section: any) {
        if (Section.EditMode)
            moveItemInArray(Section.SectionProperties, event.previousIndex, event.currentIndex);
    }
    onChange(value, prop, Section: any) {
        Section.SectionProperties.forEach((a: SectionPropertyModel) => {
            if (a.Name == prop.Name) {
                a.CustomPropertyName = value.trim();
                this.changeDesign(Section);
                this.closeToolBar();
            }
        });
    }
    changeDetected(event, section, ngStyle: any, cd: ChangeDetectorRef, ChangeType: any = undefined) {
        if((event.target && event.target.offsetParent) && (event.target.offsetParent.innerText === "format_color_fill"|| event.target.offsetParent.innerText === "padding" || event.target.offsetParent.innerText === "border_all" || event.target.offsetParent.innerText === "image" || event.target.offsetParent.innerText === "refresh")){
        if (section && section.EditMode) {
            ngStyle = new ngStyleModel();
            ngStyle.SectionType = ChangeType;        
            ngStyle.bgColor = section.ModuleBGColor;          
            ngStyle.BannerSectionBGColor = section.SectionBGColor;
            ngStyle.sectionTextColor = section.ModuleTextColor;
            ngStyle.SectionBorder = section.SectionBorder;
            ngStyle.SectionPadding = section.SectionPadding;
        }
        return ngStyle;
    }else{
        return ngStyle;
    }
    }
    parseYouTube(str) {
        // link : //youtube.com/watch?v=Bo_deCOd1HU
        // share : //youtu.be/Bo_deCOd1HU
        // embed : //youtube.com/embed/Bo_deCOd1HU

        var re = /\/\/(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch\?v=|embed\/)?([a-z0-9_\-]+)/i;
        var matches = re.exec(str);
        return matches && matches[1];
    }
    getSectionStyleString(sectionName: any) {
        let styleString: any;
        if (!sectionName)
            return styleString;
        else {
            styleString = ((sectionName.ModuleTextColor ? "color:" + sectionName.ModuleTextColor + ";" : '') +
                (sectionName.ModuleBGColor ? "background:" + sectionName.ModuleBGColor + ";" : '') +
                (sectionName.BGImage?.ImagePath ? "background:url(" + environment.domainUrl + '/' + sectionName.BGImage?.ImagePath + ");" : '')+
                (sectionName.SectionPadding ? "padding: " + sectionName.SectionPadding + ";" : '')+
                (sectionName.SectionBorder ? "border: " + sectionName.SectionBorder + ";" : '')
            )
            return styleString;
        }
    }
    getBannerSectionStyleString(sectionName: any) {
        let styleString: any;
        if (!sectionName)
            return styleString;
        else {
            styleString = ((sectionName.SectionBGColor ? `background:${sectionName.SectionBGColor};` : '') +
                (sectionName.SectionBGImage?.ImagePath ? `background:url(${environment.domainUrl}/${sectionName.SectionBGImage?.ImagePath});` : '')+
                (sectionName.BannerSectionPadding ? "padding: " + sectionName.BannerSectionPadding + ";" : '')+
                (sectionName.BannerSectionBorder ? "border: " + sectionName.BannerSectionBorder + ";" : '')
            );
            return styleString;
        }
    }
    getStyleString(fieldName: SectionPropertyModel) {
        let styleString: any;
        if (!fieldName)
            return styleString;
        else {
            styleString = ((fieldName.BGColor ? "background-color:" + fieldName.BGColor + ";" : '') +
                (fieldName.BGImage?.ImagePath ? "background-image:url(" + environment.domainUrl + '/' + fieldName.BGImage?.ImagePath + ");" : '') +
                (fieldName.Color ? "color:" + fieldName.Color + ";" : '') +
                (fieldName.TextFormat ? "font-style:" + fieldName.TextFormat + ";" : '') +
                (fieldName.TextDecoration ? "text-decoration:" + fieldName.TextDecoration + ";" : '') +
                (fieldName.FontWeight ? "font-weight:" + fieldName.FontWeight + ";" : '') +
                (fieldName.TextAlignment ? "text-align:" + fieldName.TextAlignment + ";" : '') +
                (fieldName.FontSize > 0 ? "font-size:" + fieldName.FontSize + "px;" : '') +
                (fieldName.FontStyle ? "font-family:" + fieldName.FontStyle + "" : '')
            )
            return styleString;
        }
    }
    getEventUrl(name,event: any){
        let eventName = event.EventTitle.replace(' ',"-").toLowerCase();
        return environment.domainUrl.concat("/e/",eventName,"-",event.EventId,"/",name);
    }
}