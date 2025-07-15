import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  HostListener,
  Renderer2,
  OnInit,
  NgZone
} from '@angular/core';

@Component({
  selector: 'app-about-section',
  standalone: false,
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.scss',
})
export class AboutSectionComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('textBlock') textBlock!: ElementRef;

  private scrollPosition = 0;
  private textBlockElement!: HTMLElement;
  private hasAnimationStarted = false;
  private observer: IntersectionObserver | null = null;
  private scrollSpeedFactor = 0.3; // Increased from 0.15 for faster manual scrolling
  private isAutoScrolling = false;
  private autoScrollInterval: any = null;
  private animationCompleted = false;
  private readonly animationDuration = 8000; // Reduced from 15000 to 8000 (8 seconds)

  // Parameters for the perspective effect
  private initialScale = 1.0;
  private finalScale = 0.2;
  private viewportHeight = 0;
  private totalScrollDistance = 0;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // No initialization needed
  }

  ngAfterViewInit(): void {
    this.textBlockElement = this.textBlock.nativeElement;
    this.viewportHeight = window.innerHeight;

    // Calculate total scroll distance based on text height
    setTimeout(() => {
      const textHeight = this.textBlockElement.clientHeight;
      this.totalScrollDistance = this.viewportHeight + textHeight;
    });

    // Setup intersection observer to trigger animation when section is visible
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimationStarted && !this.animationCompleted) {
          this.hasAnimationStarted = true;
          this.startAnimation();
        } else if (!entry.isIntersecting && this.hasAnimationStarted && !this.animationCompleted) {
          // Reset when scrolled out of view and animation not completed
          this.pauseAnimation();
        }
      });
    }, { threshold: 0.2 });

    this.observer.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }

    // Stop any ongoing auto-scroll
    this.stopAutoScroll();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    // If animation is completed, allow normal page scrolling
    if (this.animationCompleted) return;

    if (!this.hasAnimationStarted) return;

    // Stop auto-scroll when user manually scrolls
    this.stopAutoScroll();

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollDiff = scrollTop - this.scrollPosition;

    this.updateTextPosition(scrollDiff * this.scrollSpeedFactor);

    this.scrollPosition = scrollTop;
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    // If animation is completed, allow normal page scrolling
    if (this.animationCompleted) return;

    if (!this.hasAnimationStarted) return;

    // Stop auto-scroll when user manually scrolls with wheel
    this.stopAutoScroll();

    // Manual scroll speed control for wheel events
    const delta = event.deltaY;
    this.updateTextPosition(delta * 0.1); // Increased from 0.05 for faster wheel scrolling

    // Prevent default scrolling for a smoother experience
    event.preventDefault();
  }

  private updateTextPosition(scrollAmount: number): void {
    // If animation is completed, don't update position
    if (this.animationCompleted) return;

    // Get current transform state
    const computedStyle = window.getComputedStyle(this.textBlockElement);
    const transform = computedStyle.transform || computedStyle.webkitTransform;

    // Extract current Y position
    const matrix = new DOMMatrix(transform);
    const currentY = matrix.m42;

    // Calculate new position
    const containerHeight = this.textBlockElement.clientHeight;
    const minY = -containerHeight;
    const maxY = window.innerHeight * 0.5;

    const newY = Math.min(maxY, Math.max(minY, currentY - scrollAmount));

    // Calculate scale factor based on position - from initialScale to finalScale
    // As the text moves from bottom to top, scale decreases
    const startY = this.viewportHeight;
    const progress = 1 - Math.min(1, Math.max(0, (newY + containerHeight) / this.totalScrollDistance));
    const scale = this.initialScale - (progress * (this.initialScale - this.finalScale));

    // Apply new position with scale
    this.renderer.setStyle(
      this.textBlockElement,
      'transform',
      `translateY(${newY}px) scale(${scale})`
    );

    // If text has scrolled to its end position, mark animation as completed
    if (newY <= minY) {
      this.completeAnimation();
    }
  }

  private startAnimation(): void {
    // Set the text to full width initially
    this.renderer.setStyle(
      this.textBlockElement,
      'width',
      '100%'
    );

    // Position the text below the viewport
    this.renderer.setStyle(
      this.textBlockElement,
      'transform',
      `translateY(${window.innerHeight}px) scale(${this.initialScale})`
    );

    // Remove any existing transition
    this.renderer.setStyle(this.textBlockElement, 'transition', 'none');

    // Start auto-scroll after a short delay
    setTimeout(() => {
      this.startAutoScroll();

      // Set a timer to automatically complete the animation after a certain duration
      setTimeout(() => {
        this.completeAnimation();
      }, this.animationDuration);
    }, 500); // Reduced from 1000 to 500 for quicker start
  }

  private pauseAnimation(): void {
    if (this.animationCompleted) return;
    this.stopAutoScroll();
    this.hasAnimationStarted = false;
  }

  private startAutoScroll(): void {
    if (this.isAutoScrolling || this.animationCompleted) return;

    this.isAutoScrolling = true;

    // Run outside Angular zone for better performance
    this.ngZone.runOutsideAngular(() => {
      this.autoScrollInterval = setInterval(() => {
        this.updateTextPosition(1.5); // Increased from 0.5 for faster auto-scrolling
      }, 16); // ~60fps
    });
  }

  private stopAutoScroll(): void {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
    this.isAutoScrolling = false;
  }

  private completeAnimation(): void {
    this.animationCompleted = true;
    this.stopAutoScroll();

    // Final position for the text with small scale
    const containerHeight = this.textBlockElement.clientHeight;
    this.renderer.setStyle(
      this.textBlockElement,
      'transform',
      `translateY(${-containerHeight}px) scale(${this.finalScale})`
    );

    // Make the container non-interactive to allow normal page scrolling
    this.renderer.setStyle(this.elementRef.nativeElement, 'pointer-events', 'none');
  }
}
