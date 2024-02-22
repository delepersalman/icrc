import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, QueryList, Renderer2, ViewChildren, ViewContainerRef } from '@angular/core';
import { EventFAQListModel, EventFAQModel, ngStyleModel, SectionPropertyModel } from 'src/app/shared/models/event-maker/event-maker-model';
import { GlobalService } from 'src/app/shared/services/global-service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'theme2-event-faq',
  templateUrl: './theme2-event-faq.component.html',
  styleUrls: ['./theme2-event-faq.component.scss']
})
export class Theme2EventFaqComponent implements OnInit {
  @Input() eventFAQ: EventFAQListModel;
  ngStyle:ngStyleModel = new ngStyleModel();
  domainUrl:string;
  Ques:SectionPropertyModel= new SectionPropertyModel();
  Ans:SectionPropertyModel= new SectionPropertyModel();
  heading:SectionPropertyModel= new SectionPropertyModel();
  @ViewChildren('appendItem', { read: ViewContainerRef })  public dynComponents: QueryList<ViewContainerRef>;
  expanded = false;
  constructor(private globalService: GlobalService, private renderer: Renderer2, private cd: ChangeDetectorRef) { }
  changeAlignment(event){
    this.globalService.changeAlignment(event, this.eventFAQ, this.ngStyle);
    this.cd.detectChanges();
    this.ngStyle =  new ngStyleModel();
  }
  ChangeDetect(event, section) {
    this.ngStyle = this.globalService.changeDetected(event, section, this.ngStyle, this.cd);
    this.ngStyle.SectionName = "faq";
    this.cd.detectChanges();
  }
  ngDoCheck():void{
    if(this.eventFAQ.ComponentId){
      this.heading= this.eventFAQ.SectionProperties.filter(a=>a.Name == 'FAQHeading')[0];
      this.Ques= this.eventFAQ.SectionProperties.filter(a=>a.Name == 'Question')[0];
      this.Ans= this.eventFAQ.SectionProperties.filter(a=>a.Name == 'Answer')[0];
      this.ngStyle.sectionTextColor =  this.eventFAQ.ModuleTextColor;
      this.ngStyle.sectionBgColor = this.eventFAQ.ModuleBGColor;
      this.ngStyle.SectionBorder =   this.eventFAQ.SectionBorder;
      this.ngStyle.SectionPadding =   this.eventFAQ.SectionPadding;
      this.ngStyle.BannerSectionBorder =   this.eventFAQ.BannerSectionBorder;
      this.ngStyle.BannerSectionPadding =   this.eventFAQ.BannerSectionPadding;
    }
  }
  showHideToolbar(event:any,prop:SectionPropertyModel, ques: any = undefined, ans: any = undefined){    
     
    this.dynComponents.map(
     (vcr: ViewContainerRef, index: number) => {
       vcr.clear();
       prop.expanded = false;          
       if(vcr.element.nativeElement == event.target){
        if(ques) {
          prop.FieldId = ques.EventFaqId;
          prop.BGColor = ques.BGColor;
          prop.Color = ques.Color;
          prop.TextFormat = ques.TextFormat;
          prop.TextAlignment = ques.TextAlignment;
          prop.FontSize = ques.FontSize;
          prop.FontWeight = ques.FontWeight;
          prop.TextDecoration = ques.TextDecoration;
          prop.FontStyle = ques.FontStyle;
        }
        if(ans) {
          prop.FieldId = ans.EventFaqId;
          prop.BGColor = ans.AnswerBGColor;
          prop.Color = ans.AnswerColor;
          prop.TextFormat = ans.AnswerTextFormat;
          prop.TextAlignment = ans.AnswerTextAlignment;
          prop.FontSize = ans.AnswerFontSize;
          prop.FontWeight = ans.AnswerFontWeight;
          prop.TextDecoration = ans.AnswerTextDecoration;
          prop.FontStyle = ans.AnswerFontStyle;
        }
       this.globalService.showHideToolbar(event,prop,this.ngStyle, vcr, this.eventFAQ);
       prop.expanded = true;
       }
     })
  
 }
  onChange(value, prop){
    this.globalService.onChange(value, prop, this.eventFAQ);
   }
ngOnInit(): void {
  this.ngStyle.SectionName = "faq";
  this.domainUrl =environment.domainUrl;  
  this.renderer.listen('window', 'click', (e: any) => {
    this.globalService.clearToolBar(this.dynComponents, e);
  });
  this.globalService.onFieldDataChanged.subscribe(s => {
    for (let index = 0; index < s.length; index++) {
      for (let j = 0; j < this.eventFAQ.eventFAQs.length; j++) {
        if (s[index].FieldId === this.eventFAQ.eventFAQs[j].EventFaqId && s[index].FieldName === 'Question') {
          this.eventFAQ.eventFAQs[j].BGColor = s[index].BGColor;
          this.eventFAQ.eventFAQs[j].Color = s[index].TextColor;
          this.eventFAQ.eventFAQs[j].TextFormat = s[index].TextFormat;
          this.eventFAQ.eventFAQs[j].TextAlignment = s[index].TextAlignment;
          this.eventFAQ.eventFAQs[j].FontSize = s[index].FontSize;
          this.eventFAQ.eventFAQs[j].FontStyle = s[index].FontStyle;
          this.eventFAQ.eventFAQs[j].FontWeight = s[index].FontWeight;
          this.eventFAQ.eventFAQs[j].TextDecoration = s[index].TextDecoration;
        }
        if (s[index].FieldId === this.eventFAQ.eventFAQs[j].EventFaqId && s[index].FieldName === 'Answer') {
            this.eventFAQ.eventFAQs[j].AnswerBGColor = s[index].BGColor;
            this.eventFAQ.eventFAQs[j].AnswerColor = s[index].TextColor;
            this.eventFAQ.eventFAQs[j].AnswerTextFormat = s[index].TextFormat;
            this.eventFAQ.eventFAQs[j].AnswerTextAlignment = s[index].TextAlignment;
            this.eventFAQ.eventFAQs[j].AnswerFontSize = s[index].FontSize;
            this.eventFAQ.eventFAQs[j].AnswerFontStyle = s[index].FontStyle;
            this.eventFAQ.eventFAQs[j].AnswerFontWeight = s[index].FontWeight;
            this.eventFAQ.eventFAQs[j].AnswerTextDecoration = s[index].TextDecoration;
          }
        }
    }
  });
}
getStyleString(fieldName: SectionPropertyModel) {
  return this.globalService.getStyleString(fieldName);
}
getSectionStyleString(sectionName) {
  return this.globalService.getSectionStyleString(sectionName);
}
}
