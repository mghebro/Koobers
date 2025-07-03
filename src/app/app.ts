import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App {
  protected title = 'KooberCoders';
  constructor(private location: Location, private router: Router) {
    // Optional: Listen to route changes to trigger change detection
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // This will trigger change detection when route changes
      });
  }

  isComingSoonPage(): boolean {
    return this.location.path() === '/coming-soon';
  }
}
