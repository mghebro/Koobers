import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutRoutingModule } from './about-routing-module';
import { AboutPage } from './about-page/about-page';
import { TeamSectionComponent } from './team-section/team-section.component';
import { SharedModule } from '../../shared/shared.module';
import { AboutSectionComponent } from './about-section/about-section.component';

@NgModule({
  declarations: [
    AboutPage,
    AboutSectionComponent,
    TeamSectionComponent
  ],
  imports: [
    CommonModule,
    AboutRoutingModule,
    SharedModule
  ]
})
export class AboutModule { }
