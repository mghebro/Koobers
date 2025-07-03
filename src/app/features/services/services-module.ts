import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicesRoutingModule } from './services-routing-module';
import { ServicesPage } from './services-page/services-page';
import { SharedModule } from '../../shared/shared.module';
import { Faq } from './faq/faq';


@NgModule({
  declarations: [
    ServicesPage,
    Faq
  ],
  imports: [
    CommonModule,
    ServicesRoutingModule,
    SharedModule
  ]
})
export class ServicesModule { }
