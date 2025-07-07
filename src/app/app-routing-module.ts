import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/home/home.module').then(
        (m) => m.HomeModule
      ),
    data: { animation: 'HomePage' }
  },

  {
    path: 'coming-soon',
    loadChildren: () =>
      import('./features/coming-soon/coming-soon-module').then(
        (m) => m.ComingSoonModule
      ),
    data: { animation: 'ComingSoonPage' }
  },

  {
    path: 'contact',
    loadChildren: () =>
      import('./features/contact/contact.module').then(
        (m) => m.ContactModule
      ),
    data: { animation: 'ContactPage' }
  },

  {
    path: 'about',
    loadChildren: () =>
      import('./features/about/about-module').then(
        (m) => m.AboutModule
      ),
    data: { animation: 'AboutPage' }
  },

  {
    path: 'services',
    loadChildren: () =>
      import('./features/services/services-module').then(
        (m) => m.ServicesModule
      ),
    data: { animation: 'ServicesPage' }
  },

  {
    path: 'work',
    loadChildren: () =>
      import('./features/work/work-module').then(
        (m) => m.WorkModule
      ),
    data: { animation: 'WorkPage' }
  },

  {
    path: "**",
    redirectTo: ""
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
