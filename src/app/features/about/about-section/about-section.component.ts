import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';

@Component({
  selector: 'app-about-section',
  standalone: false,
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.scss'
})
export class AboutSectionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('textBlock') textBlock!: ElementRef;
  private textLines: HTMLElement[] = [];
  private scrollListener: () => void = () => {};
  private ticking = false;
  private windowHeight = 0;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.textLines = Array.from(document.querySelectorAll('.text-line'));
    this.windowHeight = window.innerHeight;

    // Forcefully hide all lines on initialization
    this.hideAllLines();

    // Setup scroll listener outside Angular zone for better performance
    this.ngZone.runOutsideAngular(() => {
      this.scrollListener = this.handleScroll.bind(this);
      window.addEventListener('scroll', this.scrollListener);
      window.addEventListener('resize', this.handleResize.bind(this));
    });

    // Initialize on load
    setTimeout(() => this.updateTextTransform(), 100);

    // Make sure lines are hidden even after the initial update
    setTimeout(() => {
      // Force check if we're not in the visible area and hide lines if needed
      const scrollY = window.scrollY;
      const textContainer = this.textBlock.nativeElement.closest('.text-container');
      const containerTop = this.getOffsetTop(textContainer);

      if (scrollY < containerTop - this.windowHeight * 0.3) {
        this.hideAllLines();
      }
    }, 150);
  }

  ngOnDestroy(): void {
    // Cleanup
    window.removeEventListener('scroll', this.scrollListener);
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  private hideAllLines(): void {
    if (!this.textLines.length && this.textBlock) {
      this.textLines = Array.from(document.querySelectorAll('.text-line'));
    }

    this.textLines.forEach(line => {
      line.style.opacity = '0';
      line.style.transform = 'translateY(100px)';
    });
  }

  private handleResize(): void {
    this.windowHeight = window.innerHeight;
    this.updateTextTransform();
  }

  private handleScroll(): void {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.updateTextTransform();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  private updateTextTransform(): void {
    if (!this.textBlock || !this.textLines.length) return;

    const scrollY = window.scrollY;
    const textContainer = this.textBlock.nativeElement.closest('.text-container');
    const containerTop = this.getOffsetTop(textContainer);
    const containerHeight = textContainer.offsetHeight;

    // Use a smaller threshold to ensure text doesn't show too early
    const visibilityThreshold = this.windowHeight * 0.3;

    // Check if we're in the text container area
    const inContainer = scrollY >= containerTop - visibilityThreshold &&
                       scrollY <= containerTop + containerHeight;

    if (inContainer) {
      // Show the text block
      this.textBlock.nativeElement.style.display = 'block';

      // Calculate scroll progress through the container - make it faster by reducing the total scroll distance
      const totalScrollDistance = containerHeight * 1; // Reduced from 1.5 * windowHeight for faster animation
      const scrollOffset = scrollY - (containerTop - visibilityThreshold); // Start animation sooner
      const scrollProgress = Math.max(0, Math.min(1, scrollOffset / totalScrollDistance));

      // Distribute the animation across the total number of lines - make it faster by showing more lines at once
      const linesCount = this.textLines.length;
      // Increase multiplier for faster text appearance
      const visibleLinesCount = Math.min(linesCount, Math.ceil(scrollProgress * linesCount * 1.5));

      this.textLines.forEach((line, index) => {
        // Check if this line should be visible based on scroll progress
        if (index < visibleLinesCount) {
          // For the currently revealing line, calculate its individual animation progress
          if (index === visibleLinesCount - 1) {
            // This is the line currently being revealed
            // Calculate animation progress for just this line - make it faster with higher multiplier
            const lineProgress = Math.min(1, ((scrollProgress * linesCount * 1.5) % 1) * 1.5);

            // Animate from bottom with faster motion
            line.style.opacity = lineProgress.toString();
            line.style.transform = `translateY(${100 * (1 - lineProgress)}px)`;
          } else {
            // Lines that are already fully visible
            line.style.opacity = '1';
            line.style.transform = 'translateY(0)';
          }
        } else {
          // Lines that should not be visible yet
          line.style.opacity = '0';
          line.style.transform = 'translateY(100px)';
        }
      });
    } else if (scrollY < containerTop - visibilityThreshold) {
      // Before the container, hide all lines
      this.textBlock.nativeElement.style.display = 'block';
      this.hideAllLines();
    } else {
      // After the container, show all lines
      this.textBlock.nativeElement.style.display = 'block';
      this.textLines.forEach(line => {
        line.style.opacity = '1';
        line.style.transform = 'translateY(0)';
      });
    }
  }

  // Helper function to get offset top accounting for all parent elements
  private getOffsetTop(element: HTMLElement): number {
    let offsetTop = 0;
    while(element) {
      offsetTop += element.offsetTop;
      element = element.offsetParent as HTMLElement;
    }
    return offsetTop;
  }
}
