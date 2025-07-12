import { Component, OnInit, Renderer2, Inject, ElementRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-cookie-consent',
  standalone: false,
  templateUrl: './cookie-consent.html',
  styleUrl: './cookie-consent.scss'
})
export class CookieConsent implements OnInit {
  cookiesAccepted = false;
  private readonly COOKIE_KEY = 'cookies-accepted';

  // Variables for touch handling
  private touchStartY: number = 0;
  private touchMoveY: number = 0;
  private isDragging: boolean = false;
  private readonly SWIPE_THRESHOLD: number = 70; // Pixels required to dismiss
  private isAnimatingOut: boolean = false; // Flag to prevent multiple dismiss actions

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Check if user has already made a choice about cookies (either accepted or rejected)
    const cookieChoice = localStorage.getItem(this.COOKIE_KEY);
    this.cookiesAccepted = cookieChoice === 'true' || cookieChoice === 'false';

    // If cookies were accepted (not just chosen), load the Clarity script
    if (cookieChoice === 'true') {
      this.loadClarityScript();
    }
  }

  acceptCookies(): void {
    this.applyFadeOutAnimation(() => {
      this.cookiesAccepted = true;
      localStorage.setItem(this.COOKIE_KEY, 'true');
      this.loadClarityScript();
    });
  }

  rejectCookies(): void {
    this.applyFadeOutAnimation(() => {
      this.cookiesAccepted = true; // Hide the banner
      localStorage.setItem(this.COOKIE_KEY, 'false');
      // Note: We don't load the script if cookies are rejected
    });
  }

  // Helper method for applying fadeout animation
  private applyFadeOutAnimation(callback: () => void): void {
    if (this.isAnimatingOut) return; // Prevent multiple animations

    this.isAnimatingOut = true;
    const element = this.elementRef.nativeElement.querySelector('.cookie-consent');

    // Add the fading-out class to trigger animation
    this.renderer.addClass(element, 'fading-out');

    // Execute callback after animation completes
    setTimeout(() => {
      callback();
    }, 500); // Match the animation duration
  }

  // Touch event handlers for pull-down to dismiss
  onTouchStart(event: TouchEvent): void {
    // Only handle swipes on mobile
    if (window.innerWidth > 500 || this.isAnimatingOut) return;

    // Store the initial touch position
    this.touchStartY = event.touches[0].clientY;
    this.isDragging = true;
  }

  onTouchMove(event: TouchEvent): void {
    // Only handle swipes on mobile
    if (window.innerWidth > 500 || !this.isDragging || this.isAnimatingOut) return;

    this.touchMoveY = event.touches[0].clientY;
    const deltaY = this.touchMoveY - this.touchStartY;

    // Only allow downward swipe with resistance
    if (deltaY > 0) {
      // Apply resistance factor to make it feel more natural
      const resistedDelta = Math.min(deltaY * 0.5, 200);
      const element = this.elementRef.nativeElement.querySelector('.cookie-consent');
      this.renderer.setStyle(element, 'transform', `translateY(${resistedDelta}px)`);

      // Prevent default scrolling only when we're actually dragging downward
      event.preventDefault();
    }
  }

  onTouchEnd(event: TouchEvent): void {
    // Only handle swipes on mobile
    if (window.innerWidth > 500 || !this.isDragging || this.isAnimatingOut) return;

    const deltaY = this.touchMoveY - this.touchStartY;
    const element = this.elementRef.nativeElement.querySelector('.cookie-consent');

    if (deltaY > this.SWIPE_THRESHOLD) {
      // Set flag to prevent multiple dismiss actions
      this.isAnimatingOut = true;

      // Add sliding out animation class
      this.renderer.addClass(element, 'sliding-out');

      // Wait for animation to complete then reject cookies
      setTimeout(() => {
        this.rejectCookies();
      }, 300); // Match animation duration
    } else {
      // Reset position with smooth animation
      this.renderer.setStyle(element, 'transition', 'transform 0.3s ease');
      this.renderer.setStyle(element, 'transform', 'none');

      // Remove transition after animation completes
      setTimeout(() => {
        this.renderer.removeStyle(element, 'transition');
      }, 300);
    }

    this.isDragging = false;
  }

  private loadClarityScript(): void {
    // Create script element
    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.text = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "s8olrjkjbd");
    `;

    // Add script to document body
    this.renderer.appendChild(this.document.body, script);
  }
}
