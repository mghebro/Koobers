import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { slideInAnimation } from './shared/animations/route-animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss',
  animations: [
    slideInAnimation
  ]
})
export class App {
  protected title = 'KooberCoders';
  isLoading = false;
  constructor(private location: Location, private router: Router) {
    // Listen to route changes for animations
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
        

      }
    });
  }

  isComingSoonPage(): boolean {
    return this.location.path() === '/coming-soon';
  }
  
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
