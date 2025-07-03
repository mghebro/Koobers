import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComingSoonRoutingModule } from './coming-soon-routing-module';
import { ComingSoonPage } from './coming-soon-page/coming-soon-page';
import { ComingSoonHeading } from './coming-soon-heading/coming-soon-heading';
import { ComingSoonInput } from './coming-soon-input/coming-soon-input';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    ComingSoonPage,
    ComingSoonHeading,
    ComingSoonInput
  ],
  imports: [
    CommonModule,
    ComingSoonRoutingModule,
    SharedModule
  ]
})
export class ComingSoonModule { }
