import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef, NgZone, AfterViewInit } from '@angular/core';
import { ScrollLockService } from '../../core/services/scroll-lock.service';

@Component({
  selector: 'app-benefits-section',
  standalone: false,
  templateUrl: './benefits-section.component.html',
  styleUrls: ['./benefits-section.component.scss']
})
export class BenefitsSectionComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('benefitsSection', { static: false }) benefitsSection!: ElementRef;
  @ViewChild('benefitsContainer', { static: false }) benefitsContainer!: ElementRef;
  @ViewChild('swiperEl') swiperEl!: ElementRef;

  activeIndex: number = 1;
  isLocked: boolean = false;
  private hasCompletedSection: boolean = false;
  private hasEverLocked: boolean = false;
  private scrollThreshold: number = 30;
  private lastScrollTime: number = 0;
  private scrollDelay: number = 300;
  private unlockDelay: number = 300;
  private scrollSensitivity: number = 0.8;
  private isScrolling: boolean = false;
  private isTransitioning: boolean = false;
  private lastScrollY: number = 0;
  private scrollDirection: 'up' | 'down' = 'down';
  private unlockCooldown: boolean = false;
  private hasScrolledPast: boolean = false;
  
  benefits = [
    {
      id: 1,
      title: 'A Reliable Tech Partner',
      description: 'You can leave the technical part to us and focus on growing your business.',
    },
    {
      id: 2,
      title: 'Increased Efficiency',
      description: 'The automated systems we create will help you save time and human resources.',
    },
    {
      id: 3,
      title: 'Better User Experience',
      description: 'Intuitive and fast products will increase your customer satisfaction and loyalty.',
    },
    {
      id: 4,
      title: 'Future-Proof Solutions',
      description: "We build scalable products that will be ready for your business's future growth.",
    }
  ];

  private scrollAccumulator: number = 0;
  private originalBodyPosition: string = '';
  private originalScrollY: number = 0;
  
  // Event listener references for cleanup
  private wheelListener: any;
  private touchStartListener: any;
  private touchMoveListener: any;
  private scrollListener: any;
  private animationFrameId: number | null = null;
  // Removed observers for simpler, more reliable implementation

  private readonly SECTION_ID = 'benefits';
  
  constructor(
    private ngZone: NgZone,
    private scrollLockService: ScrollLockService
  ) {}

  autoplayConfig = JSON.stringify({
    delay: 3000,
    disableOnInteraction: true,
    pauseOnMouseEnter: true,
  });

  ngAfterViewInit() {
    const swiperContainer = this.swiperEl.nativeElement;
    
    // Configure Swiper parameters
    Object.assign(swiperContainer, {
      slidesPerView: 1,
      spaceBetween: 8,
      loop: true, // Optional: enable infinite loop
      // Disable built-in navigation since we're using custom
      navigation: false,
      pagination: false
    });
    
    // Initialize Swiper
    swiperContainer.initialize();
  }

  slidePrev() {
    this.swiperEl.nativeElement.swiper.slidePrev();
  }

  slideNext() {
    this.swiperEl.nativeElement.swiper.slideNext();
  }

  ngOnInit(): void {
    this.setupEventListeners();
  }

  ngOnDestroy(): void {
    // Ensure scroll is unlocked on destroy
    this.unlockScroll();
    // Remove event listeners
    this.removeEventListeners();
    // Cancel animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private setupEventListeners(): void {
    // Wheel event with passive: false
    this.wheelListener = this.onWheel.bind(this);
    window.addEventListener('wheel', this.wheelListener, { passive: false });
    
    // Touch events
    this.touchStartListener = this.onTouchStart.bind(this);
    this.touchMoveListener = this.onTouchMove.bind(this);
    window.addEventListener('touchstart', this.touchStartListener, { passive: true });
    window.addEventListener('touchmove', this.touchMoveListener, { passive: false });
    
    // Use only scroll event for more predictable behavior
    this.scrollListener = this.checkScrollPosition.bind(this);
    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  private removeEventListeners(): void {
    window.removeEventListener('wheel', this.wheelListener);
    window.removeEventListener('touchstart', this.touchStartListener);
    window.removeEventListener('touchmove', this.touchMoveListener);
    window.removeEventListener('scroll', this.scrollListener);
  }

  private checkScrollPosition(): void {
    if (!this.benefitsSection || this.isTransitioning || this.unlockCooldown) return;

    // Detect scroll direction
    const currentScrollY = window.pageYOffset;
    if (currentScrollY > this.lastScrollY) {
      this.scrollDirection = 'down';
    } else if (currentScrollY < this.lastScrollY) {
      this.scrollDirection = 'up';
    }
    this.lastScrollY = currentScrollY;

    // Use requestAnimationFrame for better performance
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.animationFrameId = requestAnimationFrame(() => {
      const rect = this.benefitsContainer.nativeElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Check if we've scrolled completely past the section
      if (this.scrollDirection === 'down' && rect.top < -rect.height) {
        this.hasScrolledPast = true;
      } else if (this.scrollDirection === 'up' && rect.bottom > viewportHeight + rect.height) {
        this.hasScrolledPast = true;
      } else {
        this.hasScrolledPast = false;
      }
      
      const rectCenter = rect.top + rect.height / 2;
      const screenCenter = viewportHeight / 2;
      const lockThreshold = viewportHeight * 0.2; // 20% of viewport height

      // Only lock if we're sufficiently within the section and have never locked before
      const isComingFromTop = this.scrollDirection === 'down' && rect.top > -100;
      
      if (!this.isLocked &&
          !this.hasEverLocked &&
          !this.hasScrolledPast &&
          Math.abs(rectCenter - screenCenter) < lockThreshold &&
          isComingFromTop &&
          this.scrollLockService.canSectionLock(this.SECTION_ID, this.scrollDirection)) {
        
        // Set initial benefit based on scroll direction
        if (this.scrollDirection === 'up') {
          this.activeIndex = this.benefits[this.benefits.length - 1].id;
        } else {
          this.activeIndex = 1;
        }
        
        // Reset completion status
        this.hasCompletedSection = false;
        
        this.lockScroll();
      }
    });
  }

  private lockScroll(): void {
    if (this.isLocked || this.isTransitioning) return;
    
    // Double-check with service before locking
    if (!this.scrollLockService.canSectionLock(this.SECTION_ID, this.scrollDirection)) {
      return;
    }
    
    this.isLocked = true;
    this.hasEverLocked = true;
    this.scrollLockService.lockSection(this.SECTION_ID);
    
    // Save exact scroll position before any changes
    this.originalScrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // Apply scroll lock immediately
    requestAnimationFrame(() => {
      this.applyScrollLock();
    });
  }
  
  private applyScrollLock(): void {
    // Save original body styles
    this.originalBodyPosition = document.body.style.position || '';
    
    // Get exact scroll position again to ensure accuracy
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // Apply all styles at once to prevent reflow
    document.body.style.cssText = `
      position: fixed !important;
      top: -${scrollY}px !important;
      left: 0 !important;
      right: 0 !important;
      width: 100% !important;
      overflow: hidden !important;
      touch-action: none !important;
    `;  
    
    // Also lock html element
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.scrollBehavior = 'auto';
    
    // Add class for additional styling
    document.body.classList.add('scroll-locked');
  }

  private unlockScroll(exitDirection?: 'up' | 'down'): void {
    if (!this.isLocked) return;
    
    const direction = exitDirection || this.scrollDirection;
    this.scrollLockService.unlockSection(this.SECTION_ID, direction);
    
    this.isLocked = false;
    this.unlockCooldown = true;
    
    // Get the scroll position from the fixed top value
    const scrollY = Math.abs(parseInt(document.body.style.top || '0', 10));
    
    // Remove all inline styles at once
    document.body.style.cssText = '';
    
    // Restore original position if it existed
    if (this.originalBodyPosition) {
      document.body.style.position = this.originalBodyPosition;
    }
    
    // Reset html element
    document.documentElement.style.overflow = '';
    document.documentElement.style.scrollBehavior = '';
    
    // Remove class
    document.body.classList.remove('scroll-locked');
    
    // Restore scroll position using the value from fixed positioning
    window.scrollTo({
      top: scrollY || this.originalScrollY,
      left: 0,
      behavior: 'instant'
    });
    
    // Set cooldown to prevent immediate re-lock
    setTimeout(() => {
      this.unlockCooldown = false;
    }, 800); // 0.8 second cooldown
  }

  private onWheel(event: WheelEvent): void {
    if (!this.isLocked || this.isTransitioning) {
      return;
    }

    // Prevent default scrolling
    event.preventDefault();
    event.stopPropagation();

    const currentTime = Date.now();
    
    // Prevent rapid scrolling with better timing
    if (this.isScrolling || currentTime - this.lastScrollTime < this.scrollDelay) {
      return;
    }

    // Normalize wheel delta across browsers
    const normalizedDelta = this.normalizeWheelDelta(event);
    
    // Apply sensitivity with better control
    this.scrollAccumulator += normalizedDelta * this.scrollSensitivity;
    
    // Check threshold with momentum consideration
    if (Math.abs(this.scrollAccumulator) < this.scrollThreshold) {
      return;
    }

    this.isScrolling = true;
    
    // Smooth benefit transitions
    this.ngZone.run(() => {
      if (this.scrollAccumulator > 0) {
        this.nextBenefit();
      } else {
        this.previousBenefit();
      }
    });
    
    this.lastScrollTime = currentTime;
    this.scrollAccumulator = 0;
    
    // Reset scrolling flag after delay
    setTimeout(() => {
      this.isScrolling = false;
    }, this.scrollDelay);
  }

  private nextBenefit(): void {
    const currentBenefitIndex = this.benefits.findIndex(b => b.id === this.activeIndex);
    
    if (currentBenefitIndex < this.benefits.length - 1) {
      // Move to next benefit
      this.activeIndex = this.benefits[currentBenefitIndex + 1].id;
    } else {
      // Reached the last benefit - unlock and continue scrolling
      this.hasCompletedSection = true;
      
      // Unlock scroll to continue forward
      setTimeout(() => {
        // Calculate forward scroll position
        const section = this.benefitsSection.nativeElement;
        const sectionBottom = section.offsetTop + section.offsetHeight;
        this.originalScrollY = sectionBottom - window.innerHeight + 100;
        
        this.unlockScroll('down');
        
        // Continue scrolling forward with more force
        setTimeout(() => {
          window.scrollBy({
            top: 600,
            behavior: 'smooth'
          });
        }, 100);
      }, this.unlockDelay);
    }
  }

  private previousBenefit(): void {
    const currentBenefitIndex = this.benefits.findIndex(b => b.id === this.activeIndex);
    
    if (currentBenefitIndex > 0) {
      // Move to previous benefit
      this.activeIndex = this.benefits[currentBenefitIndex - 1].id;
      
      // Reset completion if going back
      if (this.hasCompletedSection) {
        this.hasCompletedSection = false;
      }
    } else {
      // At first benefit and scrolling up - exit upward
      this.hasCompletedSection = false;
      
      // Unlock scroll to go back
      setTimeout(() => {
        // Calculate backward scroll position
        const section = this.benefitsSection.nativeElement;
        this.originalScrollY = section.offsetTop - 100;
        
        this.unlockScroll('up');
        
        // Continue scrolling backward
        setTimeout(() => {
          window.scrollBy({
            top: -200,
            behavior: 'smooth'
          });
        }, 100);
      }, this.unlockDelay);
    }
  }

  selectBenefit(selectedId: number): void {
    this.activeIndex = selectedId;
  }

  // Touch support
  private touchStartY: number = 0;
  private touchAccumulator: number = 0;
  
  private normalizeWheelDelta(event: WheelEvent): number {
    // Normalize wheel delta across different browsers and devices
    let delta = event.deltaY;
    
    // Handle different wheel modes
    if (event.deltaMode === 1) { // DOM_DELTA_LINE
      delta *= 40;
    } else if (event.deltaMode === 2) { // DOM_DELTA_PAGE
      delta *= 800;
    }
    
    // Clamp delta to prevent excessive values
    return Math.max(-100, Math.min(100, delta));
  }
  
  // Removed observer methods for simpler implementation
  
  private onTouchStart(event: TouchEvent): void {
    if (this.isLocked) {
      this.touchStartY = event.touches[0].clientY;
      this.touchAccumulator = 0;
    }
  }

  private onTouchMove(event: TouchEvent): void {
    if (!this.isLocked || this.isTransitioning) {
      return;
    }

    event.preventDefault();

    const currentTime = Date.now();
    const touchY = event.touches[0].clientY;
    const deltaY = this.touchStartY - touchY;
    
    this.touchAccumulator += deltaY;

    // Better timing for touch events
    if (currentTime - this.lastScrollTime < this.scrollDelay + 100) {
      return;
    }

    // Higher threshold for touch to prevent accidental triggers
    if (Math.abs(this.touchAccumulator) < this.scrollThreshold * 2.5) {
      return;
    }

    // Smooth touch transitions
    this.ngZone.run(() => {
      if (this.touchAccumulator > 0) {
        this.nextBenefit();
      } else {
        this.previousBenefit();
      }
    });
    
    this.lastScrollTime = currentTime;
    this.touchAccumulator = 0;
    this.touchStartY = touchY;
  }

  // Keyboard support
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isLocked || this.isTransitioning) {
      return;
    }

    const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
    
    if (scrollKeys.includes(event.key)) {
      event.preventDefault();
      
      const currentTime = Date.now();
      if (currentTime - this.lastScrollTime < this.scrollDelay) {
        return;
      }
      
      // Smooth keyboard navigation
      this.ngZone.run(() => {
        if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
          this.nextBenefit();
        } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
          this.previousBenefit();
        }
      });
      
      this.lastScrollTime = currentTime;
    }
  }

  private centerSection(): void {
    const sectionElement = this.benefitsContainer.nativeElement;
    const sectionTop = sectionElement.offsetTop;
    const sectionHeight = sectionElement.offsetHeight;
    const windowHeight = window.innerHeight;
    const centerOffset = (windowHeight - sectionHeight) / 2;
    
    window.scrollTo({
      top: sectionTop - centerOffset,
      behavior: 'smooth'
    });
  }
  
  @HostListener('window:resize')
  onResize(): void {
    if (this.isLocked && this.benefitsContainer) {
      this.centerSection();
    } else {
      this.unlockScroll();
    }
  }
}