import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomePageComponent } from './home-page/home-page.component';
import { SharedModule } from "../../shared/shared.module";
import { FeaturesSectionComponent } from '../../shared/features-section/features-section.component';
import { HowWeWorkSectionComponent } from '../../shared/how-we-work-section/how-we-work-section.component';
import { HomeHeroSection } from './home-hero-section/home-hero-section';
import { CodeDisplay } from './code-display/code-display';
import { HomeFaqSection } from './home-faq-section/home-faq-section';


@NgModule({
  declarations: [
    HomePageComponent,
    HomeHeroSection,
    CodeDisplay,
    HomeFaqSection,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,
  ]
})
export class HomeModule { }
