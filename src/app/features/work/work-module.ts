import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkRoutingModule } from './work-routing-module';
import { WorkPage } from './work-page/work-page';
import { SharedModule } from '../../shared/shared.module';
import { WorkPortfolioSection } from './work-portfolio-section/work-portfolio-section';


@NgModule({
  declarations: [
    WorkPage,
    WorkPortfolioSection
  ],
  imports: [
    CommonModule,
    WorkRoutingModule,
    SharedModule
  ]
})
export class WorkModule { }
