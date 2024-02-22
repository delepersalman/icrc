import { ComponentRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewContainerRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Component } from '@angular/core';
import { DynamicComponentService } from './dynamic-component.service';


export interface DynamicComponentInputs { [k: string]: any; };

@Component({
  selector: 'app-dynamic-selector',
  template: `
  <ng-container #componentContainer></ng-container>
  `
})
export class DynamicSelectorComponent implements OnDestroy, OnChanges {
  @ViewChild('componentContainer', { read: ViewContainerRef, static: true })
  container: ViewContainerRef;

  @Input() componentSelector: string;
  @Input() moduleLoaderFunction;
  @Input() inputs: DynamicComponentInputs;
  @Output() outputEvent : EventEmitter<any> = new EventEmitter<any>();
  public component: ComponentRef<any>;

  constructor(private componentService: DynamicComponentService) { 
    this.setComponentInputs();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.componentSelector) {
      await this.renderComponentInstance();
      this.setComponentInputs();
    } else if (changes.inputs) {
      this.setComponentInputs();
    }

  }
  private setComponentInputs() {
    if (this.component && this.component.instance && this.inputs) {
      Object.keys(this.inputs).forEach(p => (this.component.instance[p] = this.inputs[p]));
    }
  }
  ngOnDestroy() {
    this.destroyComponentInstance();
  }

  private async renderComponentInstance() {
    this.destroyComponentInstance();

    this.component = await this.componentService.getComponentBySelector(this.componentSelector, this.moduleLoaderFunction);
    if(this.component && this.component.instance.outputEvent){
    this.component.instance.outputEvent.subscribe(val => {
      this.outputEvent.emit(val);
    });
  }
    if(this.component)
    this.container.insert(this.component.hostView);
}



  private destroyComponentInstance() {
    if (this.component) {
      this.component.destroy();
      this.component = null;
    }
  }
}
