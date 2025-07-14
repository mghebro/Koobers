import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeaturesSectionComponent } from './features-section/features-section.component';
import { HowWeWorkSectionComponent } from './how-we-work-section/how-we-work-section.component';
import { BenefitsSectionComponent} from './benefits-section/benefits-section.component';
import { PageHeader } from './page-header/page-header';
import { RouterModule } from '@angular/router';
import { CtaSection } from './cta-section/cta-section';
import { ModalForm } from './modal-form/modal-form';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CookieConsent } from './cookie-consent/cookie-consent';



@NgModule({
  declarations: [
    FeaturesSectionComponent,
    HowWeWorkSectionComponent,
    BenefitsSectionComponent,
    PageHeader,
    CtaSection,
    ModalForm,
    CookieConsent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  exports: [
    FeaturesSectionComponent,
    HowWeWorkSectionComponent,
    BenefitsSectionComponent,
    CtaSection,
    PageHeader,
    ModalForm,
    TranslateModule,
    CookieConsent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }
