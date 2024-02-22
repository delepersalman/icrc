import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'custom-question',
  templateUrl: './custom-question.component.html',
  styleUrls: ['./custom-question.component.scss']
})
export class CustomQuestionComponent implements OnInit {
  @Input() quest: any;
  constructor() { }

  ngOnInit(): void {
  }
  onVariantChange(variant) {
    this.quest.Value = variant.Id
    if (Array.isArray(this.quest.Variants)) {
      var selected = this.quest.Variants.map(item => {
        return item.Id == this.quest.Value;
      });
      if (selected && Array.isArray(selected)) {
        selected.forEach(res => {
          if (res)
            this.quest.SelectedVariant = this.quest.Variants.filter(a => a.Id === this.quest.Value);
        });
      }
    }
  }

}
