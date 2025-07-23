import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  private scrollJackActive = false;
  private currentSection = 0; // Track which section we're in (0-4)
  private sectionPositions: number[] = [];
  private isScrollJacking = false;
  private lastScrollTime = 0;
  private scrollDirection = 1; // 1 for down, -1 for up

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.textLines = Array.from(document.querySelectorAll('.text-line'));
    this.windowHeight = window.innerHeight;

    // Forcefully hide all lines on initialization
    this.hideAllLines();

    // Setup scroll listener outside Angular zone for better performance
    this.ngZone.runOutsideAngular(() => {
      this.scrollListener = this.handleScroll.bind(this);
      window.addEventListener('scroll', this.scrollListener, { passive: false }); // Not passive for scroll jacking
      window.addEventListener('resize', this.handleResize.bind(this));
      window.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    });

    // Initialize on load
    setTimeout(() => {
      this.calculateSectionPositions();
      this.updateTextTransform();
    }, 100);

    // Make sure lines are hidden even after the initial update
    setTimeout(() => {
      const scrollY = window.scrollY;
      const textContainer = this.textBlock.nativeElement.closest('.text-container');
      const containerTop = this.getOffsetTop(textContainer);

      if (scrollY < containerTop - this.windowHeight * 1) {
        this.hideAllLines();
      }
    }, 150);
  }

  ngOnDestroy(): void {
    // Cleanup
    window.removeEventListener('scroll', this.scrollListener);
    window.removeEventListener('resize', this.handleResize.bind(this));
    window.removeEventListener('wheel', this.handleWheel.bind(this));
  }

  private calculateSectionPositions(): void {
    const textContainer = this.textBlock.nativeElement.closest('.text-container');
    const containerTop = this.getOffsetTop(textContainer);
    const containerHeight = textContainer.offsetHeight;
    const threshold = this.windowHeight * 0.3;
    
    // Define 5 scroll positions for smooth scroll jacking
    const totalDistance = containerHeight + (threshold * 2);
    this.sectionPositions = [
      containerTop - threshold,                    // Section 0: Before text
      containerTop - threshold + totalDistance * 0.2,  // Section 1: First lines
      containerTop - threshold + totalDistance * 0.4,  // Section 2: Middle lines  
      containerTop - threshold + totalDistance * 0.7,  // Section 3: Last lines
      containerTop - threshold + totalDistance         // Section 4: After text
    ];
  }

  private handleWheel(event: WheelEvent): void {
    const scrollY = window.scrollY;
    const textContainer = this.textBlock.nativeElement.closest('.text-container');
    const containerTop = this.getOffsetTop(textContainer);
    const containerHeight = textContainer.offsetHeight;
    const threshold = this.windowHeight * 0.3;
    
    // Check if we're in the scroll jack zone
    const inScrollZone = scrollY >= containerTop - threshold && 
                        scrollY <= containerTop + containerHeight + threshold;

    if (inScrollZone && !this.isScrollJacking) {
      // Only prevent default for large scroll movements (intentional section jumps)
      if (Math.abs(event.deltaY) > 100) {
        event.preventDefault();
        this.scrollDirection = event.deltaY > 0 ? 1 : -1;
        this.performScrollJack();
      }
      // Allow small scroll movements for smooth text animation
    }
  }

  private performScrollJack(): void {
    if (this.isScrollJacking) return;
    
    this.isScrollJacking = true;
    const currentScrollY = window.scrollY;
    
    // Find current section based on scroll position
    let targetSection = this.currentSection;
    
    // Only jump to next section if we're between sections, not during text animation
    const textContainer = this.textBlock.nativeElement.closest('.text-container');
    const containerTop = this.getOffsetTop(textContainer);
    const containerHeight = textContainer.offsetHeight;
    const threshold = this.windowHeight * 0.3;
    const textStartY = containerTop - threshold;
    const textEndY = containerTop + containerHeight;
    
    // If we're in the main text animation area, don't do section jumping
    if (currentScrollY >= textStartY + 100 && currentScrollY <= textEndY - 100) {
      // We're in the middle of text animation, allow normal smooth scrolling
      this.isScrollJacking = false;
      return;
    }
    
    // Only do section jumps at the beginning or end of the text section
    if (this.scrollDirection > 0) {
      // Scrolling down
      if (currentScrollY < textStartY + 200) {
        // Jump into the text section
        window.scrollTo({
          top: textStartY + 200,
          behavior: 'smooth'
        });
      } else if (currentScrollY > textEndY - 200) {
        // Jump out of the text section
        window.scrollTo({
          top: textEndY + 100,
          behavior: 'smooth'
        });
      }
    } else {
      // Scrolling up
      if (currentScrollY > textEndY - 200) {
        // Jump back into text section from bottom
        window.scrollTo({
          top: textEndY - 200,
          behavior: 'smooth'
        });
      } else if (currentScrollY < textStartY + 200) {
        // Jump out of text section to top
        window.scrollTo({
          top: textStartY - 100,
          behavior: 'smooth'
        });
      }
    }
    
    // Reset scroll jacking flag after animation
    setTimeout(() => {
      this.isScrollJacking = false;
    }, 800);
  }

  private hideAllLines(): void {
    if (!this.textLines.length && this.textBlock) {
      this.textLines = Array.from(document.querySelectorAll('.text-line'));
    }

    this.textLines.forEach(line => {
      line.style.opacity = '0';
      line.style.transform = 'translateY(100px) scale(0.3)';
    });
  }

  private handleResize(): void {
    this.windowHeight = window.innerHeight;
    this.calculateSectionPositions();
    this.updateTextTransform();
  }

  private handleScroll(): void {
    if (!this.ticking && !this.isScrollJacking) {
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
            line.style.transform = `translateY(${100 * (1 - lineProgress)}px) scale(${0.3 + (lineProgress * 0.7)})`;
          } else {
            // Lines that are already fully visible
            line.style.opacity = '1';
            line.style.transform = 'translateY(0) scale(1.0)';
          }
        } else {
          // Lines that should not be visible yet
          line.style.opacity = '0';
          line.style.transform = 'translateY(100px) scale(0.3)';
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
        line.style.transform = 'translateY(0) scale(1.0)';
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