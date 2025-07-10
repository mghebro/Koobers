import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cta-section',
  standalone: false,
  templateUrl: './cta-section.html',
  styleUrl: './cta-section.scss'
})
export class CtaSection {
  @Input() ctaTitle: string = ""
  @Input() ctaDescription: string = ""
  @Input() buttonContent: string = ""
  @Input() buttonTarget: string = ""

  constructor(private router: Router) {}

  // Navigate to a specific route
  navigateTo(route: string): void {
    if (route) {
      this.router.navigate([route]);
    }
  }
}
