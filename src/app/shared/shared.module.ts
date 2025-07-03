import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeaturesSectionComponent } from './features-section/features-section.component';
import { HowWeWorkSectionComponent } from './how-we-work-section/how-we-work-section.component';
import { BenefitsSectionComponent} from './benefits-section/benefits-section.component';
import { PageHeader } from './page-header/page-header';
import { RouterModule } from '@angular/router';
import { CtaSection } from './cta-section/cta-section';



@NgModule({
  declarations: [
    FeaturesSectionComponent,
    HowWeWorkSectionComponent,
    BenefitsSectionComponent,
    PageHeader,
    CtaSection
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    FeaturesSectionComponent,
    HowWeWorkSectionComponent,
    BenefitsSectionComponent,
    CtaSection,
    PageHeader
  ]
})
export class SharedModule { }
