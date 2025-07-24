// about-section.component.ts
import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';

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
  private wheelListener: (event: WheelEvent) => void = () => {};
  private resizeListener: () => void = () => {};
  private animationFrameId: number | null = null;
  private isScrolling = false;
  private windowHeight = 0;
  private isLocked = false;
  private hasInitialized = false;
  
  // Performance optimizations
  private readonly SCROLL_THROTTLE = 16; // ~60fps
  private lastScrollTime = 0;
  private lockCooldown = false;
  
  // Animation state
  private currentProgress = 0;
  private targetProgress = 0;
  private readonly ANIMATION_SPEED = 0.08; // Smooth interpolation
  
  // Height detection for responsive behavior
  private heightCheckThreshold = 1.2; // 120% of viewport height

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.windowHeight = window.innerHeight;
    this.updateHeightThreshold();
    this.initializeTextLines();
    this.setupEventListeners();
    this.hideAllLines();
    
    // Initial position check
    setTimeout(() => {
      this.updateTextTransform();
      this.hasInitialized = true;
    }, 100);
  }

  ngOnDestroy(): void {
    this.removeEventListeners();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.unlockScroll();
  }

  private updateHeightThreshold(): void {
    // Adjust threshold based on screen size for better mobile experience
    if (this.windowHeight <= 600) {
      this.heightCheckThreshold = 1.0; // 100% for small screens
    } else if (this.windowHeight <= 768) {
      this.heightCheckThreshold = 1.1; // 110% for tablets
    } else {
      this.heightCheckThreshold = 1.2; // 120% for desktop
    }
  }

  private initializeTextLines(): void {
    this.textLines = Array.from(this.textBlock.nativeElement.querySelectorAll('.text-line'));
  }

  private setupEventListeners(): void {
    this.ngZone.runOutsideAngular(() => {
      // Throttled scroll listener
      this.scrollListener = this.throttle(this.handleScroll.bind(this), this.SCROLL_THROTTLE);
      window.addEventListener('scroll', this.scrollListener, { passive: true });
      
      // Resize with debounce
      this.resizeListener = this.debounce(this.handleResize.bind(this), 150);
      window.addEventListener('resize', this.resizeListener, { passive: true });
      
      // Wheel event for scroll hijacking
      this.wheelListener = this.handleWheel.bind(this);
      window.addEventListener('wheel', this.wheelListener, { passive: false });
    });
  }

  private removeEventListeners(): void {
    window.removeEventListener('scroll', this.scrollListener);
    window.removeEventListener('resize', this.resizeListener);
    window.removeEventListener('wheel', this.wheelListener);
  }

  private handleScroll(): void {
    if (!this.hasInitialized || this.lockCooldown) return;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    this.animationFrameId = requestAnimationFrame(() => {
      this.updateTextTransform();
    });
  }

  private handleResize(): void {
    this.windowHeight = window.innerHeight;
    this.updateHeightThreshold();
    
    if (this.isLocked) {
      // Check if we should unlock due to new viewport size
      const container = this.textBlock.nativeElement.closest('.text-container');
      const containerHeight = container.offsetHeight;
      
      if (containerHeight > this.windowHeight * this.heightCheckThreshold) {
        this.unlockForContentAccess({
          showAllContent: true,
          scrollToPosition: 'current',
          smooth: false
        });
        return;
      }
      
      this.centerSection();
    }
    this.updateTextTransform();
  }

  private handleWheel(event: WheelEvent): void {
    if (!this.isLocked) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const now = Date.now();
    if (now - this.lastScrollTime < 100) return; // Throttle wheel events
    
    this.lastScrollTime = now;
    
    // Smooth progress update
    const delta = Math.sign(event.deltaY) * 0.15; // Smaller increments for smoother animation
    this.targetProgress = Math.max(0, Math.min(1, this.targetProgress + delta));
    
    this.animateProgress();
    
    // Check for exit conditions
    if (this.targetProgress >= 1) {
      setTimeout(() => this.exitForward(), 300);
    } else if (this.targetProgress <= 0) {
      setTimeout(() => this.exitBackward(), 300);
    }
  }

  private animateProgress(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    const animate = () => {
      // Smooth interpolation
      this.currentProgress += (this.targetProgress - this.currentProgress) * this.ANIMATION_SPEED;
      
      if (Math.abs(this.targetProgress - this.currentProgress) > 0.001) {
        this.updateLinesVisibility(this.currentProgress);
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.currentProgress = this.targetProgress;
        this.updateLinesVisibility(this.currentProgress);
      }
    };
    
    animate();
  }

  private updateTextTransform(): void {
    if (!this.textBlock || !this.textLines.length) return;

    const scrollY = window.scrollY;
    const textContainer = this.textBlock.nativeElement.closest('.text-container');
    const containerTop = this.getOffsetTop(textContainer);
    const containerHeight = textContainer.offsetHeight;
    const threshold = this.windowHeight * 0.3;

    const inContainer = scrollY >= containerTop - threshold &&
                       scrollY <= containerTop + containerHeight + threshold;

    if (inContainer && !this.isLocked) {
      // Check if container is too tall for scroll hijacking
      if (containerHeight > this.windowHeight * this.heightCheckThreshold) {
        // Container too tall - automatically unlock for better UX
        this.unlockForContentAccess({
          showAllContent: true,
          scrollToPosition: 'current',
          smooth: false
        });
        return;
      }
      
      // Check if we should lock (only for containers that fit reasonably on screen)
      const centerY = containerTop + containerHeight / 2;
      const screenCenter = scrollY + this.windowHeight / 2;
      const distanceFromCenter = Math.abs(centerY - screenCenter);
      
      // Adjust lock trigger distance based on screen size
      const lockDistance = this.windowHeight <= 768 ? 0.15 : 0.3;
      
      if (distanceFromCenter < this.windowHeight * lockDistance) {
        this.lockScroll();
        return;
      }
    }

    if (!this.isLocked) {
      // Normal scroll behavior when not locked
      if (inContainer) {
        const scrollOffset = scrollY - (containerTop - threshold);
        const totalDistance = containerHeight + (threshold * 2);
        const progress = Math.max(0, Math.min(1, scrollOffset / totalDistance));
        this.updateLinesVisibility(progress);
      } else if (scrollY < containerTop - threshold) {
        this.hideAllLines();
      } else {
        this.showAllLines();
      }
    }
  }

  private updateLinesVisibility(progress: number): void {
    const linesCount = this.textLines.length;
    const visibleCount = Math.floor(progress * linesCount);
    const currentLineProgress = (progress * linesCount) % 1;

    this.textLines.forEach((line, index) => {
      // Remove existing classes
      line.classList.remove('active', 'scrolled-past');
      
      if (index < visibleCount) {
        // Fully visible lines
        line.style.opacity = '1';
        line.style.transform = 'translateY(0) scale(1)';
        line.classList.add('scrolled-past');
      } else if (index === visibleCount) {
        // Currently animating line
        line.style.opacity = currentLineProgress.toString();
        const translateY = 100 * (1 - currentLineProgress);
        const scale = 0.3 + (currentLineProgress * 0.7);
        line.style.transform = `translateY(${translateY}px) scale(${scale})`;
        
        if (currentLineProgress > 0.5) {
          line.classList.add('active');
        }
      } else {
        // Hidden lines
        line.style.opacity = '0';
        line.style.transform = 'translateY(100px) scale(0.3)';
      }
    });
  }

  private lockScroll(): void {
    if (this.isLocked || this.lockCooldown) return;
    
    const container = this.textBlock.nativeElement.closest('.text-container');
    const containerHeight = container.offsetHeight;
    
    // Final check before locking - prevent lock if container is too tall
    if (containerHeight > this.windowHeight * this.heightCheckThreshold) {
      this.unlockForContentAccess({
        showAllContent: true,
        scrollToPosition: 'current',
        smooth: false
      });
      return;
    }
    
    this.isLocked = true;
    this.lockCooldown = true;
    
    // Save scroll position and apply lock
    const scrollY = window.scrollY;
    document.body.style.cssText = `
      position: fixed !important;
      top: -${scrollY}px !important;
      width: 100% !important;
      overflow: hidden !important;
    `;
    
    this.centerSection();
    this.targetProgress = 0;
    this.currentProgress = 0;
    
    // Reset cooldown after a delay
    setTimeout(() => {
      this.lockCooldown = false;
    }, 1000);
  }

  private unlockScroll(): void {
    if (!this.isLocked) return;
    
    this.isLocked = false;
    
    // Restore scroll position
    const scrollY = Math.abs(parseInt(document.body.style.top || '0', 10));
    document.body.style.cssText = '';
    window.scrollTo({ top: scrollY, behavior: 'instant' });
  }

  /**
   * Public method to unlock scroll for content access purposes
   * Automatically called for tall containers, can also be triggered manually
   * @param options Configuration for unlock behavior
   */
  public unlockForContentAccess(options: {
    showAllContent?: boolean;
    scrollToPosition?: 'start' | 'end' | 'current' | number;
    smooth?: boolean;
    reason?: 'height' | 'accessibility' | 'manual';
  } = {}): void {
    const {
      showAllContent = true,
      scrollToPosition = 'current',
      smooth = false,
      reason = 'manual'
    } = options;

    // Force unlock regardless of cooldown state
    this.lockCooldown = false;
    
    if (this.isLocked) {
      // Cancel any ongoing animations
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      // Show all content if requested
      if (showAllContent) {
        this.showAllLines();
        // Add active class to all lines for proper styling
        this.textLines.forEach(line => {
          line.classList.remove('scrolled-past');
          line.classList.add('active');
        });
      }

      // Get current scroll position before unlocking
      const currentScrollY = Math.abs(parseInt(document.body.style.top || '0', 10));
      
      // Unlock scroll
      this.isLocked = false;
      document.body.style.cssText = '';

      // Handle scroll positioning
      let targetScrollY = currentScrollY;
      
      if (typeof scrollToPosition === 'number') {
        targetScrollY = scrollToPosition;
      } else if (scrollToPosition !== 'current') {
        const container = this.textBlock.nativeElement.closest('.text-container');
        const containerTop = this.getOffsetTop(container);
        const containerHeight = container.offsetHeight;
        
        switch (scrollToPosition) {
          case 'start':
            targetScrollY = containerTop - 100;
            break;
          case 'end':
            targetScrollY = containerTop + containerHeight + 100;
            break;
        }
      }

      // Apply scroll position
      window.scrollTo({
        top: targetScrollY,
        behavior: smooth ? 'smooth' : 'instant'
      });

      // Reset animation state
      this.currentProgress = showAllContent ? 1 : 0;
      this.targetProgress = this.currentProgress;
      
      // Trigger change detection
      this.cdr.detectChanges();
      
      // Log reason for debugging (remove in production)
      if (reason === 'height') {
        console.log('Star Wars intro unlocked due to container height exceeding viewport threshold');
      }
    }
  }

  /**
   * Public method to check if scroll hijacking should be enabled
   * @returns boolean indicating if container is suitable for scroll hijacking
   */
  public canUseScrollHijacking(): boolean {
    if (!this.textBlock) return false;
    
    const container = this.textBlock.nativeElement.closest('.text-container');
    const containerHeight = container.offsetHeight;
    
    return containerHeight <= this.windowHeight * this.heightCheckThreshold;
  }

  private centerSection(): void {
    const container = this.textBlock.nativeElement.closest('.text-container');
    const containerTop = this.getOffsetTop(container);
    const containerHeight = container.offsetHeight;
    const targetY = containerTop + (containerHeight / 2) - (this.windowHeight / 2);
    
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }

  private exitForward(): void {
    this.unlockScroll();
    const container = this.textBlock.nativeElement.closest('.text-container');
    const targetY = this.getOffsetTop(container) + container.offsetHeight + 100;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }

  private exitBackward(): void {
    this.unlockScroll();
    const container = this.textBlock.nativeElement.closest('.text-container');
    const targetY = this.getOffsetTop(container) - 200;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }

  private hideAllLines(): void {
    this.textLines.forEach(line => {
      line.style.opacity = '0';
      line.style.transform = 'translateY(100px) scale(0.3)';
      line.classList.remove('active', 'scrolled-past');
    });
  }

  private showAllLines(): void {
    this.textLines.forEach(line => {
      line.style.opacity = '1';
      line.style.transform = 'translateY(0) scale(1)';
      line.classList.remove('scrolled-past');
      line.classList.add('active');
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

  // Utility functions
  private throttle(func: Function, delay: number) {
    let timeoutId: number | null = null;
    let lastExecTime = 0;
    
    return (...args: any[]) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  private debounce(func: Function, delay: number) {
    let timeoutId: number;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => func.apply(this, args), delay);
    };
  }
}