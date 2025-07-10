import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContactRoutingModule } from './contact-routing.module';
import { ContactPageComponent } from './contact-page/contact-page.component';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { ContactNextStepsComponent } from './contact-next-steps/contact-next-steps.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    ContactPageComponent,
    ContactFormComponent,
    ContactNextStepsComponent
  ],
  imports: [
    CommonModule,
    ContactRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class ContactModule { }
