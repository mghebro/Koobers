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
  private scrollSpeedFactor = 0.9; // Adjusted for Star Wars feel
  private isAutoScrolling = false;
  private autoScrollInterval: any = null;
  private animationCompleted = false;
  private readonly animationDuration = 25000; // Longer for Star Wars effect (25 seconds)

  // Enhanced parameters for Star Wars perspective effect
  private initialScale = 1.0;
  private finalScale = 0.1; // Smaller final scale for disappearing effect
  private viewportHeight = 0;
  private totalScrollDistance = 0;
  private initialRotateX = 45; // Star Wars angle
  private finalRotateX = 85; // Nearly flat at the end

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // Set dark space background
    this.renderer.setStyle(document.body, 'background-color', '#000');
  }

  ngAfterViewInit(): void {
    this.textBlockElement = this.textBlock.nativeElement;
    this.viewportHeight = window.innerHeight;

    // Calculate total scroll distance based on text height
    setTimeout(() => {
      const textHeight = this.textBlockElement.clientHeight;
      this.totalScrollDistance = this.viewportHeight + textHeight * 2; // Increased for longer scroll
    });

    // Setup intersection observer
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimationStarted && !this.animationCompleted) {
          this.hasAnimationStarted = true;
          this.startAnimation();
        } else if (!entry.isIntersecting && this.hasAnimationStarted && !this.animationCompleted) {
          this.pauseAnimation();
        }
      });
    }, { threshold: 0.1 });

    this.observer.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.stopAutoScroll();
    
    // Reset body background
    this.renderer.removeStyle(document.body, 'background-color');
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.animationCompleted) return;
    if (!this.hasAnimationStarted) return;

    this.stopAutoScroll();

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollDiff = scrollTop - this.scrollPosition;

    this.updateTextPosition(scrollDiff * this.scrollSpeedFactor);
    this.scrollPosition = scrollTop;
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    if (this.animationCompleted) return;
    if (!this.hasAnimationStarted) return;

    this.stopAutoScroll();

    const delta = event.deltaY;
    this.updateTextPosition(delta * 0.15); // Slower for more control

    event.preventDefault();
  }

  private updateTextPosition(scrollAmount: number): void {
    if (this.animationCompleted) return;

    const computedStyle = window.getComputedStyle(this.textBlockElement);
    const transform = computedStyle.transform || computedStyle.webkitTransform;

    const matrix = new DOMMatrix(transform);
    const currentY = matrix.m42;

    const containerHeight = this.textBlockElement.clientHeight;
    const minY = -containerHeight * 1.5; // Extended range for Star Wars effect
    const maxY = this.viewportHeight * 0.3; // Start lower on screen

    const newY = Math.min(maxY, Math.max(minY, currentY - scrollAmount));

    // Calculate progress for Star Wars effects
    const progress = Math.min(1, Math.max(0, (maxY - newY) / (maxY - minY)));
    
    // Scale decreases more dramatically
    const scale = this.initialScale - (Math.pow(progress, 1.5) * (this.initialScale - this.finalScale));
    
    // Rotate X increases for Star Wars perspective
    const rotateX = this.initialRotateX + (progress * (this.finalRotateX - this.initialRotateX));
    
    // Add slight fade effect as text moves away
    const opacity = Math.max(0.1, 1 - (progress * 0.7));

    // Apply Star Wars-style transform
    this.renderer.setStyle(
      this.textBlockElement,
      'transform',
      `translateY(${newY}px) scale(${scale}) rotateX(${rotateX}deg)`
    );

    this.renderer.setStyle(
      this.textBlockElement,
      'opacity',
      opacity.toString()
    );

    // Complete animation when text is far enough
    if (progress >= 0.95) {
      this.completeAnimation();
    }
  }

  private startAnimation(): void {
    // Ensure text starts at bottom with initial Star Wars styling
    this.renderer.setStyle(this.textBlockElement, 'width', '100%');
    this.renderer.setStyle(this.textBlockElement, 'transition', 'none');
    this.renderer.setStyle(this.textBlockElement, 'opacity', '1');
    
    // Position text at bottom with initial Star Wars transform
    this.renderer.setStyle(
      this.textBlockElement,
      'transform',
      `translateY(${this.viewportHeight * 0.3}px) scale(${this.initialScale}) rotateX(${this.initialRotateX}deg)`
    );

    // Start the crawl after a dramatic pause
    setTimeout(() => {
      this.startAutoScroll();

      // Auto-complete after duration
      setTimeout(() => {
        this.completeAnimation();
      }, this.animationDuration);
    }, 1000); // Longer pause for dramatic effect
  }

  private pauseAnimation(): void {
    if (this.animationCompleted) return;
    this.stopAutoScroll();
    this.hasAnimationStarted = false;
  }

  private startAutoScroll(): void {
    if (this.isAutoScrolling || this.animationCompleted) return;

    this.isAutoScrolling = true;

    this.ngZone.runOutsideAngular(() => {
      this.autoScrollInterval = setInterval(() => {
        // Slower, more cinematic scroll speed
        this.updateTextPosition(0.8);
      }, 16); // 60fps
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

    // Final Star Wars position - disappeared into space
    this.renderer.setStyle(
      this.textBlockElement,
      'transform',
      `translateY(${-this.textBlockElement.clientHeight * 1.5}px) scale(${this.finalScale}) rotateX(${this.finalRotateX}deg)`
    );
    
    this.renderer.setStyle(this.textBlockElement, 'opacity', '0');

    // Allow normal scrolling
    this.renderer.setStyle(this.elementRef.nativeElement, 'pointer-events', 'none');
    
    // Optional: trigger next section or callback
    setTimeout(() => {
      // You can emit an event here or call a method to show next content
      console.log('Star Wars text crawl completed');
    }, 1000);
  }
}