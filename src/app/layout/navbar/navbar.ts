import { Component, ElementRef, QueryList, ViewChildren, AfterViewInit, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslationService, Language } from '../../core/services/translation.service';
import { TranslateService } from '@ngx-translate/core';

interface MenuItem {
  label: string;
  route: string;
  translationKey: string;
}

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit, AfterViewInit {
  activeLink = 'Home';
  isLanguageDropdownOpen = false;
  menuItemPosition = 0;

  // Updated menu items with routes and translation keys
  menuItems: MenuItem[] = [
    { label: 'Home', route: '/', translationKey: 'NAVBAR.HOME' },
    { label: 'Services', route: '/services', translationKey: 'NAVBAR.SERVICES' },
    { label: 'Work', route: '/work', translationKey: 'NAVBAR.WORK' },
    { label: 'About', route: '/about', translationKey: 'NAVBAR.ABOUT' },
    { label: 'Contact', route: '/contact', translationKey: 'NAVBAR.CONTACT' },
  ];

  @ViewChildren('menuItem') menuItemsElements!: QueryList<ElementRef>;

  languages: Language[] = [];
  selectedLanguage: Language;
  previousLanguageDisplay = '';
  isFadingOut = false;
  isFadingIn = false;

  constructor(
    private elementRef: ElementRef,
    private router: Router,
    private translationService: TranslationService,
    private translateService: TranslateService
  ) {
    // Get languages from the translation service
    this.languages = this.translationService.getLanguages();
    this.selectedLanguage = this.translationService.getCurrentLanguageValue();

    // Subscribe to language changes
    this.translationService.getCurrentLanguage().subscribe(lang => {
      this.selectedLanguage = lang;
      // Update menu labels when language changes
      this.updateMenuLabels();
    });
  }

  ngOnInit() {
    // Initialize with current language
    this.previousLanguageDisplay = this.languageDisplay;

    // Set active link based on current route
    this.setActiveLinkFromRoute();

    // Listen to route changes to update active link
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setActiveLinkFromRoute();
      });

    // Initialize menu labels with translations
    this.updateMenuLabels();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updateGlowPosition();
    });
  }

  // Update menu item labels based on current language
  private updateMenuLabels(): void {
    this.menuItems.forEach(item => {
      this.translateService.get(item.translationKey).subscribe((translation: string) => {
        item.label = translation;

        // If this is the active item, update the activeLink as well
        if (this.isRouteActive(item.route)) {
          this.activeLink = translation;
        }
      });
    });
  }

  // Set active link based on current route
  private setActiveLinkFromRoute(): void {
    const currentRoute = this.router.url;
    const matchedItem = this.menuItems.find(
      (item) =>
        item.route === currentRoute ||
        (item.route !== '/' && currentRoute.startsWith(item.route))
    );

    if (matchedItem) {
      this.activeLink = matchedItem.label;
    } else {
      // Default to Home if no match found
      const homeItem = this.menuItems.find(item => item.route === '/');
      this.activeLink = homeItem ? homeItem.label : 'Home';
    }

    setTimeout(() => {
      this.updateGlowPosition();
    });
  }

  // Navigate to route when menu item is clicked
  navigateTo(menuItem: MenuItem): void {
    this.activeLink = menuItem.label;
    this.toggleMenu();
    this.router.navigate([menuItem.route]);

    setTimeout(() => {
      this.updateGlowPosition();
    });
  }

  // Keep the old setActive method for backward compatibility
  setActive(link: string): void {
    const menuItem = this.menuItems.find((item) => item.label === link);
    if (menuItem) {
      this.navigateTo(menuItem);
    }
  }

  updateGlowPosition(): void {
    const activeIndex = this.menuItems.findIndex(
      (item) => item.label === this.activeLink
    );
    if (activeIndex >= 0) {
      const items = document.querySelectorAll('.menu-items');
      if (items[activeIndex]) {
        const element = items[activeIndex] as HTMLElement;
        const menuRect = element.parentElement?.getBoundingClientRect();
        const itemRect = element.getBoundingClientRect();

        if (menuRect) {
          // Position in the middle of the active item
          this.menuItemPosition =
            itemRect.left - menuRect.left + itemRect.width / 2;
        }
      }
    }
  }

  // Check if a route is currently active
  isRouteActive(route: string): boolean {
    if (route === '/') {
      return this.router.url === '/';
    }
    return this.router.url.startsWith(route);
  }

  toggleLanguageDropdown(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const languageSelector =
      this.elementRef.nativeElement.querySelector('.language-selector');
    const clickedInside = languageSelector.contains(event.target as Node);
    const navbarMenu =
      this.elementRef.nativeElement.querySelector('.navbar');
      const clickedInsideNavbar = navbarMenu.contains(event.target as Node);

    if (!clickedInside && this.isLanguageDropdownOpen) {
      this.isLanguageDropdownOpen = false;
    }

    if (!clickedInsideNavbar && this.menuOpen) {
      this.menuOpen = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event) {
    // Close the mobile menu when window is resized
    if (this.menuOpen) {
      this.menuOpen = false;
    }

    // Close language dropdown as well
    if (this.isLanguageDropdownOpen) {
      this.isLanguageDropdownOpen = false;
    }

    // Update glow position after resize
    setTimeout(() => {
      this.updateGlowPosition();
    }, 100);
  }

  selectLanguage(language: Language, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.selectedLanguage.code !== language.code) {
      this.previousLanguageDisplay = this.languageDisplay;
      this.isFadingOut = true;
      this.isFadingIn = true;

      // Use TranslationService to switch language
      this.translationService.setLanguage(language);
      this.selectedLanguage = language;

      this.toggleLanguageDropdown();

      setTimeout(() => {
        this.isFadingOut = false;
      }, 300);

      setTimeout(() => {
        this.isFadingIn = false;
      }, 300);
    }
  }

  get languageDisplay(): string {
    if (this.selectedLanguage.code === 'en') {
      return 'Eng';
    } else if (this.selectedLanguage.code === 'ka') {
      return 'Geo';
    }
    return 'Eng/Geo';
  }

  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;

    if (this.menuOpen) {
      // Check if we need to compensate for scrollbar
      const hasScrollbar = window.innerWidth > document.documentElement.clientWidth;

      // Add adjust class to html to prevent layout shift
      if (hasScrollbar) {
        document.documentElement.classList.add('scroll-lock-adjust');
      }

      document.body.style.overflow = 'hidden'; // Prevent scroll
    } else {
      document.body.style.overflow = ''; // Restore scroll
      document.documentElement.classList.remove('scroll-lock-adjust');
    }
  }
}
