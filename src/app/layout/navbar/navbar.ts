import { Component, ElementRef, QueryList, ViewChildren, AfterViewInit, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface MenuItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {activeLink = 'Home';
  isLanguageDropdownOpen = false;
  menuItemPosition = 0;

  // Updated menu items with routes
  menuItems: MenuItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Services', route: '/services' },
    { label: 'Work', route: '/work' },
    { label: 'About', route: '/about' },
    { label: 'Contact', route: '/contact' },
  ];

  @ViewChildren('menuItem') menuItemsElements!: QueryList<ElementRef>;

  languages: Language[] = [
    { code: 'en', name: 'English', flag: '../../../assets/images/Eng.png' },
    { code: 'geo', name: 'Georgian', flag: '../../../assets/images/Geo.png' },
  ];

  selectedLanguage: Language = this.languages[0];
  previousLanguageDisplay = '';
  isFadingOut = false;
  isFadingIn = false;

  constructor(private elementRef: ElementRef, private router: Router) {}

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
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updateGlowPosition();
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
      this.activeLink = 'Home';
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

    if (!clickedInside && this.isLanguageDropdownOpen) {
      this.isLanguageDropdownOpen = false;
    }
  }

  selectLanguage(language: Language, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.selectedLanguage.code !== language.code) {
      this.previousLanguageDisplay = this.languageDisplay;
      this.isFadingOut = true;
      this.isFadingIn = true;

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
    } else if (this.selectedLanguage.code === 'geo') {
      return 'Geo';
    }
    return 'Eng/Geo';
  }
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}