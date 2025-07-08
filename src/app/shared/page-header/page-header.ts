import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

interface ContactInfo {
  phone: string;
  phoneAlternative: string;
  email: string;
  emailAlternative: string;
}

@Component({
  selector: 'app-page-header',
  standalone: false,
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss'
})
export class PageHeader {
  @Input() headingLinkText = ""
  @Input() headingLink = ""
  @Input() headingTitle: string = ""
  @Input() headingTitleSpan: string = ""
  @Input() headingDescription: string = ""
  @Input() primaryButtonContent: string = ""
  @Input() primaryButtonTarget: string = ""
  @Input() secondaryButtonContent: string = ""
  @Input() secondaryButtonTarget: string = ""
  @Input() contactHeader: boolean = false;

  constructor(private router: Router) {}

  // Navigate to a specific route
  navigateTo(route: string): void {
    if (route) {
      this.router.navigate([route]);
    }
  }

  scrollToContact(): void {
    const el = document.getElementById('contactForm');
    if (el) {
      const yOffset = -75; // scroll 75px above the element
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
  
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }
}
