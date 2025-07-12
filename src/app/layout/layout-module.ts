import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Footer } from './footer/footer';
import { RouterModule } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    Footer,
    Navbar
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule
  ],
  exports: [
    Footer,
    Navbar
  ]
})
export class LayoutModule { }
