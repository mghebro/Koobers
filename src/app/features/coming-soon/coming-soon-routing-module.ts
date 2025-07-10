import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComingSoonPage } from './coming-soon-page/coming-soon-page';

const routes: Routes = [
  {
    path: '',
    component: ComingSoonPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComingSoonRoutingModule { }
