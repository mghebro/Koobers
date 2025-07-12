import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Location } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { slideInAnimation } from './shared/animations/route-animations';
import { TranslationService } from './core/services/translation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss',
  animations: [
    slideInAnimation
  ]
})
export class App implements OnInit {
  protected title = 'KooberCoders';
  isLoading = false;

  constructor(
    private location: Location,
    private router: Router,
    private translationService: TranslationService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    // Listen to route changes for animations
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        document.body.style.overflow = '';
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    // Set initial language class
    this.setLanguageClass(this.translationService.getCurrentLanguageValue().code);

    // Subscribe to language changes
    this.translationService.getCurrentLanguage().subscribe(lang => {
      this.setLanguageClass(lang.code);
    });
  }

  // Add language class to HTML element
  private setLanguageClass(languageCode: string): void {
    const htmlElement = this.document.documentElement;

    // Remove all language classes
    htmlElement.classList.forEach(className => {
      if (className.startsWith('lang-')) {
        this.renderer.removeClass(htmlElement, className);
      }
    });

    // Add current language class
    this.renderer.addClass(htmlElement, `lang-${languageCode}`);
  }

  isComingSoonPage(): boolean {
    return this.location.path() === '/coming-soon';
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
