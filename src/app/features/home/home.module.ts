import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomePageComponent } from './home-page/home-page.component';
import { SharedModule } from "../../shared/shared.module";
import { FeaturesSectionComponent } from '../../shared/features-section/features-section.component';
import { HowWeWorkSectionComponent } from '../../shared/how-we-work-section/how-we-work-section.component';


@NgModule({
  declarations: [
    HomePageComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,
  ]
})
export class HomeModule { }
