import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Footer } from './footer/footer';
import { RouterModule } from '@angular/router';
import { Navbar } from './navbar/navbar';



@NgModule({
  declarations: [
    Footer,
    Navbar
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    Footer,
    Navbar
  ]
})
export class LayoutModule { }
