import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicesRoutingModule } from './services-routing-module';
import { ServicesPage } from './services-page/services-page';
import { SharedModule } from '../../shared/shared.module';
import { ServicesFaqSection } from './services-faq-section/services-faq-section';
import { OutServicesComponent } from './out-services/out-services.component';


@NgModule({
  declarations: [
    ServicesPage,
    ServicesFaqSection
  ],
  imports: [
    CommonModule,
    ServicesRoutingModule,
    SharedModule,
    OutServicesComponent // Added the standalone component here
  ]
})
export class ServicesModule { }
