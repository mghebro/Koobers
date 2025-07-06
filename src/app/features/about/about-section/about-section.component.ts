import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
} from '@angular/core';

@Component({
  selector: 'app-about-section',
  standalone: false,
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.scss',
})
export class AboutSectionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('textBlock') textBlock!: ElementRef;
  private textLines: HTMLElement[] = [];
  private scrollListener: () => void = () => {};
  private resizeListener: () => void = () => {};
  private ticking = false;
  private windowHeight = 0;
  private windowWidth = 0;
  private isMobile = false;
  private isTablet = false;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private initializeComponent(): void {
    this.textLines = Array.from(document.querySelectorAll('.text-line'));
    this.updateViewportDimensions();
    this.setDeviceType();
    this.hideAllLines();
    this.setupEventListeners();

    // Initialize with delays for better performance
    setTimeout(() => this.updateTextTransform(), 100);
    setTimeout(() => this.handleInitialVisibility(), 150);
  }

  private updateViewportDimensions(): void {
    this.windowHeight = window.innerHeight;
    this.windowWidth = window.innerWidth;
  }

  private setDeviceType(): void {
    this.isMobile = this.windowWidth <= 768;
    this.isTablet = this.windowWidth > 768 && this.windowWidth <= 1024;

    // Special handling for very small screens
    if (this.windowWidth <= 320) {
      this.isMobile = true;
    }
  }

  private setupEventListeners(): void {
    this.ngZone.runOutsideAngular(() => {
      this.scrollListener = this.handleScroll.bind(this);
      this.resizeListener = this.handleResize.bind(this);

      window.addEventListener('scroll', this.scrollListener, { passive: true });
      window.addEventListener('resize', this.resizeListener, { passive: true });
      window.addEventListener('orientationchange', this.resizeListener, {
        passive: true,
      });
    });
  }

  private cleanup(): void {
    window.removeEventListener('scroll', this.scrollListener);
    window.removeEventListener('resize', this.resizeListener);
    window.removeEventListener('orientationchange', this.resizeListener);
  }

  private handleInitialVisibility(): void {
    const scrollY = window.scrollY;
    const textContainer =
      this.textBlock.nativeElement.closest('.text-container');
    const containerTop = this.getOffsetTop(textContainer);
    const visibilityThreshold = this.getVisibilityThreshold();

    if (scrollY < containerTop - visibilityThreshold) {
      this.hideAllLines();
    }
  }

  private hideAllLines(): void {
    if (!this.textLines.length && this.textBlock) {
      this.textLines = Array.from(document.querySelectorAll('.text-line'));
    }

    this.textLines.forEach((line) => {
      line.style.opacity = '0';
      line.style.transform = this.getHiddenTransform();
    });
  }

  private getHiddenTransform(): string {
    if (this.windowWidth <= 320) {
      return 'translateY(30px)';
    } else if (this.isMobile) {
      return 'translateY(50px)';
    } else if (this.isTablet) {
      return 'translateY(75px)';
    }
    return 'translateY(100px)';
  }

  private getVisibilityThreshold(): number {
    if (this.windowWidth <= 320) {
      return this.windowHeight * 0.15;
    } else if (this.isMobile) {
      return this.windowHeight * 0.2;
    } else if (this.isTablet) {
      return this.windowHeight * 0.25;
    }
    return this.windowHeight * 0.3;
  }

  private getAnimationSpeed(): number {
    if (this.windowWidth <= 320) {
      return 2.5; // Fastest for very small screens
    } else if (this.isMobile) {
      return 2.0; // Faster on mobile
    } else if (this.isTablet) {
      return 1.7;
    }
    return 1.5;
  }

  private handleResize(): void {
    this.updateViewportDimensions();
    this.setDeviceType();

    // Debounce resize updates
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.updateTextTransform();
        this.ticking = false;
      });
      this.ticking = true;
    }
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
    const textContainer =
      this.textBlock.nativeElement.closest('.text-container');
    const containerTop = this.getOffsetTop(textContainer);
    const containerHeight = textContainer.offsetHeight;
    const visibilityThreshold = this.getVisibilityThreshold();

    const inContainer =
      scrollY >= containerTop - visibilityThreshold &&
      scrollY <= containerTop + containerHeight;

    if (inContainer) {
      this.handleInContainerAnimation(
        scrollY,
        containerTop,
        containerHeight,
        visibilityThreshold
      );
    } else if (scrollY < containerTop - visibilityThreshold) {
      this.handleBeforeContainer();
    } else {
      this.handleAfterContainer();
    }
  }

  private handleInContainerAnimation(
    scrollY: number,
    containerTop: number,
    containerHeight: number,
    visibilityThreshold: number
  ): void {
    this.textBlock.nativeElement.style.display = 'block';

    const totalScrollDistance = containerHeight * (this.isMobile ? 0.8 : 1);
    const scrollOffset = scrollY - (containerTop - visibilityThreshold);
    const scrollProgress = Math.max(
      0,
      Math.min(1, scrollOffset / totalScrollDistance)
    );

    const linesCount = this.textLines.length;
    const animationSpeed = this.getAnimationSpeed();
    const visibleLinesCount = Math.min(
      linesCount,
      Math.ceil(scrollProgress * linesCount * animationSpeed)
    );

    this.textLines.forEach((line, index) => {
      if (index < visibleLinesCount) {
        if (index === visibleLinesCount - 1) {
          this.animateCurrentLine(
            line,
            scrollProgress,
            linesCount,
            animationSpeed
          );
        } else {
          this.showCompleteLine(line);
        }
      } else {
        this.hideLine(line);
      }
    });
  }

  private animateCurrentLine(
    line: HTMLElement,
    scrollProgress: number,
    linesCount: number,
    animationSpeed: number
  ): void {
    const lineProgress = Math.min(
      1,
      ((scrollProgress * linesCount * animationSpeed) % 1) * animationSpeed
    );
    const translateY = this.getTranslateY(lineProgress);

    line.style.opacity = lineProgress.toString();
    line.style.transform = `translateY(${translateY}px)`;
  }

  private getTranslateY(progress: number): number {
    if (this.windowWidth <= 320) {
      return 30 * (1 - progress);
    }
    const baseTranslate = this.isMobile ? 50 : this.isTablet ? 75 : 100;
    return baseTranslate * (1 - progress);
  }

  private showCompleteLine(line: HTMLElement): void {
    line.style.opacity = '1';
    line.style.transform = 'translateY(0)';
  }

  private hideLine(line: HTMLElement): void {
    line.style.opacity = '0';
    line.style.transform = this.getHiddenTransform();
  }

  private handleBeforeContainer(): void {
    this.textBlock.nativeElement.style.display = 'block';
    this.hideAllLines();
  }

  private handleAfterContainer(): void {
    this.textBlock.nativeElement.style.display = 'block';
    this.textLines.forEach((line) => {
      this.showCompleteLine(line);
    });
  }

  private getOffsetTop(element: HTMLElement): number {
    let offsetTop = 0;
    while (element) {
      offsetTop += element.offsetTop;
      element = element.offsetParent as HTMLElement;
    }
    return offsetTop;
  }
}
