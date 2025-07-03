import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeaturesSectionComponent } from './features-section/features-section.component';
import { HowWeWorkSectionComponent } from './how-we-work-section/how-we-work-section.component';
import { BenefitsSectionComponent} from './benefits-section/benefits-section.component';
import { Cta } from './cta/cta';
import { PageHeader } from './page-header/page-header';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    FeaturesSectionComponent,
    HowWeWorkSectionComponent,
    BenefitsSectionComponent,
    Cta,
    PageHeader
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    FeaturesSectionComponent,
    HowWeWorkSectionComponent,
    BenefitsSectionComponent,
    Cta,
    PageHeader
  ]
})
export class SharedModule { }
