import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import CustomPageModel, { BaseEntityModel, ComponentOrderModel, EventmakerPageModel, EventmakerTemplateColorModel, EventWebsiteModel } from '../../shared/models/event-maker/event-maker-model';
import { EventMakerService } from '../../shared/services/event-maker/event-maker.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from '../../shared/services/global-service';
import { ECImageViewModel } from '../../shared/models/ec-image/ec-image-model';
import { PageSettingModalComponent } from '../page-setting-modal/page-setting-modal.component';
import { AddNewPageComponent } from '../custom-page/add-new-page/add-new-page.component';
import { ViewEventService } from '../service/view-event.service';
import { Subject, Subscription } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { X } from '@angular/cdk/keycodes';
import { ComponentSettingComponent } from '../component-setting/component-setting.component';
import { CustomSectionComponent } from '../component-setting/custom-section/custom-section.component';
import { takeUntil } from 'rxjs/operators';
import { ConfirmDialogComponent } from 'src/app/fireworks/shared/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogComponentData } from 'src/app/fireworks/models/common.model';
import { environment } from 'src/environments/environment';
import { CheckoutPageModalComponent } from '../checkout-attendee/checkout-page-modal/checkout-page-modal.component';
export interface StyleArr {
  name: string;
  id: number;
}
export interface LogoUploadType {
  name: string;
  id: number;
  checked: boolean;
}

@Component({
  selector: 'side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent implements OnInit, OnDestroy {
  customStyle: any;
  eventWebsiteDetail: EventWebsiteModel = new EventWebsiteModel();
  webSiteMenu: any[] = [];
  styleSheet: any;
  link: any;
  fontType: string[] = ['Web Safe Fonts', 'Custom Font'];
  logoType: string[] = ['Upload Logo', 'Enter URL','Enter Text' ,'No Logo'];
  bannerType: string[] = ['Upload Banner', 'Enter URL', 'No Banner'];
  subscription: Subscription;
  logoImages: ECImageViewModel[] = [];
  bannerImages: ECImageViewModel[] = [];
  eventSelectedpages: EventmakerPageModel[] = [];
  favIcon: ECImageViewModel[] = [];
  EventPage: EventmakerPageModel = new EventmakerPageModel();
  previewUrl: string;
  destroy$ = new Subject();
  domainUrl: string;
  public screenWidth: any;
  public screenHeight: any;
  @Input() outputEvent: any;
  panelOpenState = false;
  collapsedHeight = '500px';
  checkoutPages: string[] = ['Header', 'Banner', 'Tickets', 'Checkout', 'footer'];
  SectionModel: BaseEntityModel = new BaseEntityModel();
  ThemeColors: any[] = [];
  CustomFieldData: any[] = [];
  BannerSize:boolean;
  isSaved = true;
  PropertyName: string;
  constructor(private dialog: MatDialog, private _eventmakerService: EventMakerService, private _router: ActivatedRoute, private _globalService: GlobalService, private _viewEventService: ViewEventService, private router: Router) {
  }

  ngOnInit() {
    this._router.params.subscribe(params => {
      this.eventWebsiteDetail.Event.EventId = params['eventId']
      this.ThemeColors.push({ id: 1, Color: '#000000' });
      this.ThemeColors.push({ id: 2, Color: '#000000' })
      this.ThemeColors.push({ id: 3, Color: '#000000' });
      this.ThemeColors.push({ id: 4, Color: '#000000' });
      this.ThemeColors.push({ id: 5, Color: '#000000' });
    });
    this.getWebsitedetails();     
    this._globalService.onSaved.subscribe(res=>{
      this.isSaved = res;
    })
    this._globalService.onDesignChanged.subscribe(res => {
      this.EventPage.PageSections.forEach(eee => {
        if (eee.PageId == res.ComponentId) {
          if(eee.PageSystemName === 'checkout-attendee' || eee.PageSystemName === 'event-tickets' || eee.PageSystemName === 'event-speakers' || eee.PageSystemName === 'event-sponsors' || eee.PageSystemName === 'event-organiser' || eee.PageSystemName === 'event-faq' || eee.PageSystemName === 'event-agenda'){
            eee.EventmakerPagePropertyDesigns.forEach(item => {
              if(item.FieldId && item.FieldId>0){
                if(this.CustomFieldData.filter(a=>a.FieldId == item.FieldId && a.FieldName ==item.Name).length === 0)
                {
                 let fielData = {
                  FieldId: item.FieldId, 
                  FieldName:item.Name,
                  BGColor:item.BGColor,
                  CheckoutBGColor:item.CheckoutBGColor,
                  TextColor: item.Color,
                  TextAlignment: item.TextAlignment,
                  TextDecoration: item.TextDecoration,
                  TextFormat: item.TextFormat,
                  FontWeight: item.FontWeight,
                  FontStyle: item.FontStyle,
                  FontSize: item.FontSize,
                  }
                this.CustomFieldData.push(fielData)
                }
                else{
                  for (let index = 0; index < this.CustomFieldData.length; index++) {
                    if(this.CustomFieldData[index].FieldId === item.FieldId && this.CustomFieldData[index].FieldName === item.Name){
                      this.CustomFieldData[index].BGColor = item.BGColor;
                      this.CustomFieldData[index].TextColor = item.Color;
                      this.CustomFieldData[index].CheckoutBGColor = item.CheckoutBGColor;
                    this.CustomFieldData[index].TextAlignment = item.TextAlignment;
                    this.CustomFieldData[index].TextDecoration = item.TextDecoration
                    this.CustomFieldData[index].FontWeight = item.FontWeight;
                    this.CustomFieldData[index].FontStyle = item.FontStyle
                    this.CustomFieldData[index].FontSize = item.FontSize?item.FontSize:0;
                    }
                  }                  
                }
              }
            }); 
          }
          if(this.CustomFieldData.length>0){
            let data = {CustomFieldData: this.CustomFieldData, EventId: this.eventWebsiteDetail.Event.EventId};
            this._eventmakerService.saveCustomFieldData(data).subscribe(res =>{
              this._globalService.changeFieldData(this.CustomFieldData);
              this.CustomFieldData = [];
            });           
          }
          eee.EventmakerPagePropertyDesigns = res.SectionProperties
          eee.BGColor = res.ModuleBGColor;
          eee.TextColor = res.ModuleTextColor;
          eee.PageId = res.ComponentId;
          eee.BGImage = res.BGImage;
          eee.BGImageId = res.BGImage?.ECImageId;   
          eee.SectionBGColor = res.SectionBGColor;
          eee.SectionBorder = res.SectionBorder;
          eee.SectionPadding = res.SectionPadding;
          eee.BannerSectionBorder = res.BannerSectionBorder;
          eee.BannerSectionPadding = res.BannerSectionPadding;
          eee.SectionBGImage = res.SectionBGImage;
          eee.SectionBGImageId = res.SectionBGImage?.ECImageId; 
          this.PropertyName =  res.PropertyName;
        }
      });
      this.onAutoSaved();
    });
    this._globalService.onAutoSaved.subscribe(res => {
      if (res && this.eventWebsiteDetail.AutoSaved) {
        this.saveUserChanges((this.PropertyName === 'DateInfo'?true:1));
      }
    });
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
  }
  setDefaultBanner(type, value) {
    this.eventWebsiteDetail.BannerTypeId = value;
    if (type === 'No Banner') {
      this.eventWebsiteDetail.BannerDetails.ImageUrl = "";
      this.eventWebsiteDetail.BannerDetails.Image = null;
      if (this.eventWebsiteDetail.AutoSaved) {
        this.saveUserChanges(false);
      }
    }   
  }
  setDefaultLogo(type, value) {
    this.eventWebsiteDetail.LogoDetails.LogoTypeId = value;
    if (type === 'No Banner') {
      this.eventWebsiteDetail.LogoDetails.ImageUrl = "";
      this.eventWebsiteDetail.LogoDetails.Image = null;
      this.eventWebsiteDetail.LogoDetails.Text = "";
      if (this.eventWebsiteDetail.AutoSaved) {
        this.saveUserChanges(false);
      }
    }
  }
  selected: any;
  select(item,webPage) {
    this.selected = item;
    this.setFocus(item.PageSystemName.toLowerCase(), webPage.PageSystemName);
  };
  isActive(item) {
    return this.selected === item;
  };
  setFocus(id,pageSystemName) {
    if (id === 'home') {
      this.router.navigate(['eventmaker', this.eventWebsiteDetail.Event.EventId]);      
      return;
    }
    try {
     let stiCLass = document.getElementsByClassName('stick-to-top');
      if (stiCLass.length > 0) {
        for (let i = 0; i < stiCLass.length; i++) {
          stiCLass[i].classList.remove('stick-to-top');
        }
      }
      if(this.eventWebsiteDetail.WebsiteType === 'Multiple' && pageSystemName == "event"){
        // try { window.parent.postMessage("urlChanged_"+id,'*'); } catch { }
        if(id !== 'event-header' && id !== 'event-contactus'){
         this.router.navigate(['eventmaker', this.eventWebsiteDetail.Event.EventId, id]);
         setTimeout(() => {
          const errorField = document.getElementById(id);
          if(errorField)
          errorField.scrollIntoView({ behavior: "smooth", inline: "nearest" }); 
        }, 500);
        }
        else if(id === 'event-contactus'){
          const errorField = document.getElementById(id);
          errorField.scrollIntoView({ behavior: "smooth", inline: "nearest" }); 
        }
      }else{
      const errorField = document.getElementById(id);
      errorField.scrollIntoView({ behavior: "smooth", inline: "nearest" }); 
      if(this.eventWebsiteDetail.HeaderFixed && pageSystemName === 'event'){
        setTimeout(() => {
          errorField.getElementsByTagName('section')[0].classList.add('stick-to-top');  
        }, 100);
        }
     } 
    } catch (err) {

    }
  }
  openWindow() {
    let me = this;
    this.domainUrl = environment.domainUrl + "/eventmanagement/editevent?eventId=" + this.eventWebsiteDetail.Event.EventId;
    var win = window.open(this.domainUrl, "EditEvent", "status=1, height=" + this.screenHeight + ", width=" + this.screenWidth + ", toolbar=0,resizable=0");
    var timer = setInterval(function () {
      if (win.closed) {
        clearInterval(timer);
        me.getWebsitedetails();
      }
    }, 1000);
  }
  goBack() {   
    if(!this.isSaved) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        Title: 'Go back?',
        Message: 'Changes you made may not be saved.',
        CancelText: 'No',
        OkText: 'Yes'
      } as ConfirmDialogComponentData
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result)
        window.parent.location.href = environment.domainUrl + '/eventmaker?eventId=' + this.eventWebsiteDetail.Event.EventId + '#/eventmaker';
    });
  }else{
    window.parent.location.href = environment.domainUrl + '/eventmaker?eventId=' + this.eventWebsiteDetail.Event.EventId + '#/eventmaker';
  }
  }

  saveBeforePreview() {
    this.saveUserChanges(true);
    let title = this.eventWebsiteDetail.Event.EventTitle.replace(/[^a-zA-Z ]/g, "-").replace(/\s+/g, '-').toLowerCase();
    this.previewUrl = environment.domainUrl + "/e/" + title + '-' + this.eventWebsiteDetail.Event.EventId;
    window.open(this.previewUrl, "_blank");
  }
  getWebsitedetails() {
    this._viewEventService.getEventWebsiteDetail(this.eventWebsiteDetail.Event.EventId);
    this.subscription = this._viewEventService.eventWebsiteDetailChange.subscribe(eventDetails => {
      this.logoImages = [];
      this.favIcon = [];
      this.bannerImages = [];
      this.eventWebsiteDetail = eventDetails;
      let title = this.eventWebsiteDetail.Event.EventTitle.replace(/[^a-zA-Z ]/g, "-").replace(/\s+/g, '-').toLowerCase();
      this.previewUrl = environment.domainUrl + "/e/" + title + '-' + this.eventWebsiteDetail.Event.EventId;
      if (this.eventWebsiteDetail.ThemeColors) {
        for (let index = 0; index < this.ThemeColors.length; index++) {
          if (this.ThemeColors[index].id == index + 1) {
            this.ThemeColors[index].Color = this.eventWebsiteDetail.ThemeColors[index].Color
            this._viewEventService.changeTheme(this.ThemeColors[index].Color, this.ThemeColors[index].id);
          }
        }
      }
      if (!this.EventPage || this.EventPage.PageSections.length == 0) {
        this.EventPage = this.eventWebsiteDetail.EventPages[0];
        this.eventWebsiteDetail.EventPages[0].IsExpanded = true;
      } else {
        this.eventWebsiteDetail.EventPages.forEach(res => {
          if (res.PageName === this.EventPage.PageName) {
            res.IsExpanded = true;
            this.EventPage = res;
            this.EventPage.IsExpanded = true;
          } else {
            res.IsExpanded = false;
          }
        });
      }
      if (this.eventWebsiteDetail.LogoDetails.Image)
        this.logoImages.push(this.eventWebsiteDetail.LogoDetails.Image);

      if (this.eventWebsiteDetail.BannerDetails.Image)
        this.bannerImages.push(this.eventWebsiteDetail.BannerDetails.Image);

      if (this.eventWebsiteDetail.Favicon)
        this.favIcon.push(this.eventWebsiteDetail.Favicon);

      this.eventWebsiteDetail.FontType = this.eventWebsiteDetail.FontStyle ? 'Web Safe Fonts' : 'Custom Font';
      let logoId = this.eventWebsiteDetail.LogoDetails.LogoTypeId;
      this.eventWebsiteDetail.LogoType = logoId=== 3?'No Logo': logoId === 0?'Upload Logo' : logoId === 2 ? 'Enter Text' : 'Enter URL';
      this.eventWebsiteDetail.BannerType = this.eventWebsiteDetail.BannerTypeId === 2 ? 'No Banner' : this.eventWebsiteDetail.BannerDetails.ImageUrl? 'Enter URL' : 'Upload Banner';
      this.eventWebsiteDetail.BannerSize = this.eventWebsiteDetail.BannerDetails.BannerSize;
    });
  }

  resetAllSetting() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        Title: 'Reset Settings?',
        Message: 'Changes you made, will be removed.',
        CancelText: 'No',
        OkText: 'Yes'
      } as ConfirmDialogComponentData
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        this._globalService.showLoader(true);
        this._eventmakerService.resetAllSetting(this.eventWebsiteDetail).subscribe(res => {
          this._globalService.showLoader(false);
          if (res) {
            this._viewEventService.getEventWebsiteDetail(this.eventWebsiteDetail.Event.EventId);
            this._globalService.showToast("Reset successfully!", "success-message");
          } else {
            this._globalService.showToast("Something went wrong!", "error-message");
          }
        });
      }
    });

  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  designList: StyleArr[] = [{ name: 'Favicon', id: 6 }, { name: 'Logo', id: 1 }, { name: 'Banner', id: 5 }, { name: 'Theme Colors', id: 2 }, { name: 'Font Style', id: 3 }, { name: 'Custom CSS', id: 4 }];
  designListView = 0;
  listActionFunc(currentItem) {
    this.designListView = currentItem;
  }

  sidebarCollapsed: boolean;
  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  changeImage(data) {
    if (data.length > 0) {
      this.eventWebsiteDetail.LogoDetails.Text = "";
      this.eventWebsiteDetail.LogoDetails.ImageUrl = "";
      this.eventWebsiteDetail.LogoDetails.Image = data[0];
    }
    else {
      this.eventWebsiteDetail.LogoDetails.Image = new ECImageViewModel();
      this.logoImages = [];
    }
    this._globalService.changeLogoDetails(this.eventWebsiteDetail.LogoDetails);
  }
  changeBannerImage(data) {
    if (data.length > 0) {
      this.eventWebsiteDetail.BannerDetails.ImageUrl = "";
      this.eventWebsiteDetail.BannerDetails.Image = data[0];
    }
    else {
      this.eventWebsiteDetail.BannerDetails.Image = new ECImageViewModel();
      this.bannerImages = [];
    }
    this._globalService.changeBannerDetails(this.eventWebsiteDetail.BannerDetails);
    if (this.eventWebsiteDetail.AutoSaved) {
      this.saveUserChanges(false);
    }
  }
  changeFavIconImage(data) {
    if (data.length > 0) {
      this.eventWebsiteDetail.Favicon = data[0];
    }
    else {
      this.eventWebsiteDetail.Favicon = new ECImageViewModel();
    }
    this._globalService.changeFaviconDetails(this.eventWebsiteDetail.Favicon);
    if (this.eventWebsiteDetail.AutoSaved) {
      this.saveUserChanges(false);
    }
  }

  changeTheme(color: string, index) {
    for (let i = 0; i < this.ThemeColors.length; i++) {
      if (this.ThemeColors[i].id == index) {
        if (this.eventWebsiteDetail.ThemeColors[index - 1])
          this.eventWebsiteDetail.ThemeColors[index - 1].Color = color;
        else {
          let col = {
            Active: true,
            Color: color,
            ColorId: index,
            ColorName: null,
            Deleted: false,
            TemplateId: this.eventWebsiteDetail.TemplateId
          }
          this.eventWebsiteDetail.ThemeColors.push(col);
        }
      }
    }
    this._viewEventService.changeTheme(color, index);
    if (this.eventWebsiteDetail.AutoSaved) {
      this.saveUserChanges(1);
    }
  }

  changeFont() {
    this._viewEventService.changeFont(this.eventWebsiteDetail);
    if (this.eventWebsiteDetail.AutoSaved) {
      this.saveUserChanges(false);
    }
  }
  setBannerSizeValue(){
    if(this.BannerSize)
    this.eventWebsiteDetail.BannerDetails.BannerSize =1;
    else
    this.eventWebsiteDetail.BannerDetails.BannerSize =0
  }
  onLogoDetailChange(type) {
    if (type == 'image') {
      this.eventWebsiteDetail.LogoDetails.Text = '',
        this.eventWebsiteDetail.LogoDetails.ImageUrl = '';
    } else if (type == 'url') {
      this.eventWebsiteDetail.LogoDetails.Text = '',
        this.eventWebsiteDetail.LogoDetails.Image = new ECImageViewModel();
    } else {
      this.eventWebsiteDetail.LogoDetails.Image = new ECImageViewModel();
      this.eventWebsiteDetail.LogoDetails.ImageUrl = '';
    }
    this._globalService.changeLogoDetails(this.eventWebsiteDetail.LogoDetails);
    if (this.eventWebsiteDetail.AutoSaved) {
      this.saveUserChanges(false);
    }
  }
  onBannerDetailChange(type) {
    if (type == 'image') {
      this.eventWebsiteDetail.BannerDetails.ImageUrl = '';
    } else if (type == 'url') {
      this.eventWebsiteDetail.BannerDetails.Image = new ECImageViewModel();
    } else {
      this.eventWebsiteDetail.BannerDetails.Image = new ECImageViewModel();
      this.eventWebsiteDetail.BannerDetails.ImageUrl = '';
    }
    this._globalService.changeBannerDetails(this.eventWebsiteDetail.BannerDetails);
    if (this.eventWebsiteDetail.AutoSaved) {
      this.saveUserChanges(false);
    }
  }
  onAutoSaved() {
    this._globalService.autoSaved(this.eventWebsiteDetail.AutoSaved);
  }
  openDialogAddNewPage(eventId, EventMakerWebsitePageId) {
    let mod = new CustomPageModel();
    mod.EventId = this.eventWebsiteDetail.Event.EventId;
    mod.EventMakerWebsitePageId = EventMakerWebsitePageId;
    mod.EventMakerWebsiteId = this.eventWebsiteDetail.WebsiteDetailId;
    mod.WebsiteType = this.eventWebsiteDetail.WebsiteType;
    const dialogRef = this.dialog.open(CustomSectionComponent, {
      data: mod
    });
    dialogRef.componentInstance.saveEvent.subscribe(t => {
      if (t)
        this._viewEventService.getEventWebsiteDetail(this.eventWebsiteDetail.Event.EventId);
      dialogRef.close();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getWebsitedetails();
      }
    });
  }
  addRemovePage(page: any) {
    page.Selected = !page.Selected;
    this.saveUserChanges(true);
  }
  removeSection(page: any) {
    page.Deleted = true;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        Title: 'Please confirm',
        Message: 'Do you want to delete this section `' + page.PageTitle + '`',
        CancelText: 'No',
        OkText: 'Yes'
      } as ConfirmDialogComponentData
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {

      if (result) {
        let data = new CustomPageModel();
        data.CustomPageId = page.PageId,
        data.EventMakerWebsiteId = this.eventWebsiteDetail.WebsiteDetailId;
        data.EventId = this.eventWebsiteDetail.Event.EventId;
        this._eventmakerService.deleteCustomPage(data).subscribe(res => {
          this._globalService.showLoader(false);
          if (res) {
            this._viewEventService.getEventWebsiteDetail(this.eventWebsiteDetail.Event.EventId);
            this._globalService.showToast("Deleted successfully!", "success-message");
          } else {
            this._globalService.showToast("Something went wrong!", "error-message");
          }
        });
      }
    });
  }

  saveUserChanges(val) {
    if(val !==1){
    this._globalService.showLoader(true);
    }
    try {
      this._eventmakerService.saveWebsiteDetails(this.eventWebsiteDetail).subscribe(res => {
        this._globalService.showLoader(false);
        if (res) {   
          this._globalService.saved(true);      
          if(val !==1){
          this._viewEventService.eventWebsiteDetailChange.next(res);
          if (!this.eventWebsiteDetail.AutoSaved)
            this._globalService.showToast("Saved successfully!", "success-message");
        }}
      });
    } catch (err) {
      this._globalService.showLoader(false);
      console.log(err);
    }
  }  
  openDialogPageSettings(page, eventWebsiteDetail, EventMakerWebsitePageId) {
    page.EventMakerWebsitePageId = EventMakerWebsitePageId
    const dialogRef = this.dialog.open(PageSettingModalComponent, {
      data: {
        data: page,
        eventWebsiteDetail: eventWebsiteDetail
      },
      width: '800px'
    });
    dialogRef.componentInstance.outputEvent.subscribe(t => {
      if (t)
        this._viewEventService.getEventWebsiteDetail(this.eventWebsiteDetail.Event.EventId);
      dialogRef.close();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        page.eventWebsiteDetail = {};
        this.getWebsitedetails();
      }
    });
  }
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousIndex !== event.currentIndex) {
      if(this.EventPage.PageSections[event.currentIndex].Selected && this.EventPage.PageSections[event.currentIndex].PageSystemName !=='event-header'){
      moveItemInArray(this.EventPage.PageSections, event.previousIndex, event.currentIndex);
      this.saveComponentOrder()
      }
    }
  }
  setExpand(webPage) {
    this.eventWebsiteDetail.EventPages.forEach(page => {
      if (page.PageName == webPage.PageName) {
        page = webPage;
        page.IsExpanded = true;
        webPage.IsExpanded = true;
        this.EventPage = webPage;
        // setTimeout(() => {
        //   this.setFocus(webPage.PageSections[0], webPage.PageSystemName);
        // }, 500);
        // this.previewUrl = "/"+webPage.PageSystemName.toLowerCase()+"/" + this.eventWebsiteDetail.Event.EventId;
      } else {
        page.IsExpanded = false;
      }
    });
   // this._viewEventService.eventWebsiteDetailChange.next(this.eventWebsiteDetail);
  }
  saveComponentOrder() {
    this._globalService.showLoader(true);
    let componentdata: ComponentOrderModel = new ComponentOrderModel();
    componentdata.SelectedComponents = this.EventPage.PageSections.filter(x => x.Selected).map(a => a.PageId);
    componentdata.EventMakerWebsiteId = this.eventWebsiteDetail.WebsiteDetailId;
    componentdata.EventId = this.eventWebsiteDetail.Event.EventId;
    this._eventmakerService.saveWebComponentOrder(componentdata).subscribe(res => {
      this._globalService.showLoader(false);
      if (res) {
        this._viewEventService.getEventWebsiteDetail(this.eventWebsiteDetail.Event.EventId);
      }
    });
  }
  openDialogNewPage(customPage) {
    customPage.WebsiteDetailId = this.eventWebsiteDetail.WebsiteDetailId;
    customPage.EventId = this.eventWebsiteDetail.Event.EventId;
    customPage.Event = this.eventWebsiteDetail.Event;
    customPage.CustomPropertyName = (customPage.EventmakerPagePropertyDesigns.filter(a => a.Name == "Button")[0] ? customPage.EventmakerPagePropertyDesigns.filter(a => a.Name == "Button")[0].CustomPropertyName : "");
    const dialogRef = this.dialog.open(AddNewPageComponent, {
      data: customPage,
      width: '700px'
    });
    dialogRef.componentInstance.outputEvent.subscribe(res => {
      if (res) {
        dialogRef.close();
      }
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._viewEventService.getEventWebsiteDetail(this.eventWebsiteDetail.Event.EventId);
      }
    });
  }
  setStyles() {
    this._viewEventService.setStyles(this.eventWebsiteDetail);
  }
}
function ngOnDestroy() {
  this.unsubscribe();
}

