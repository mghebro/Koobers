import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone, HostListener } from '@angular/core';
import { ScrollLockService } from '../../core/services/scroll-lock.service';

@Component({
  selector: 'app-how-we-work-section',
  standalone: false,
  templateUrl: './how-we-work-section.component.html',
  styleUrls: ['./how-we-work-section.component.scss']
})
export class HowWeWorkSectionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('processSection', { static: false }) processSection!: ElementRef;
  
  activeIndex: number = 1;
  isLocked: boolean = false;
  
  // State management
  private hasEnteredSection: boolean = false;
  private sectionCompleted: boolean = false;
  private hasEverLocked: boolean = false;
  private lastScrollY: number = 0;
  private scrollDirection: 'up' | 'down' = 'down';
  
  // Lock/unlock debouncing
  private lockDebounceTimer: any = null;
  private unlockDebounceTimer: any = null;
  private lockDebounceDelay: number = 200;
  private unlockDebounceDelay: number = 300;
  
  // Hysteresis thresholds
  private lockThreshold: number = 0.2;
  private unlockThreshold: number = 0.4;
  private wasInLockZone: boolean = false;
  
  // Scroll control
  private scrollAccumulator: number = 0;
  private requiredScroll: number = 120;
  private lastScrollTime: number = 0;
  private scrollDelay: number = 300;
  private isTransitioning: boolean = false;
  
  // Touch handling
  private touchStartY: number = 0;
  private touchSensitivity: number = 50;
  
  steps = [
    {
      id: 1,
      number: '01',
      title: 'Discovery',
      timeline: '1-2 Weeks',
      description: 'Understand your vision and define clear goals.',
      icon: '../../../assets/svgs/how-we-work/discovery.svg',
      highlight: 'Strategy'
    },
    {
      id: 2,
      number: '02',
      title: 'Design',
      timeline: '2-4 Weeks',
      description: 'Create beautiful, intuitive user experiences.',
      icon: '../../../assets/svgs/how-we-work/design.svg',
      highlight: 'UX/UI'
    },
    {
      id: 3,
      number: '03',
      title: 'Development',
      timeline: '4-12 Weeks',
      description: 'Build scalable solutions with clean code.',
      icon: '../../../assets/svgs/how-we-work/development.svg',
      highlight: 'Engineering'
    },
    {
      id: 4,
      number: '04',
      title: 'Launch',
      timeline: '1 Week',
      description: 'Deploy smoothly with zero downtime.',
      icon: '../../../assets/svgs/how-we-work/launch.svg',
      highlight: 'Go Live'
    },
    {
      id: 5,
      number: '05',
      title: 'Support',
      timeline: 'Ongoing',
      description: 'Continuous optimization and growth.',
      icon: '../../../assets/svgs/how-we-work/support.svg',
      highlight: 'Maintain'
    }
  ];

  private readonly SECTION_ID = 'how-we-work';
  
  constructor(
    private ngZone: NgZone,
    private scrollLockService: ScrollLockService
  ) {}

  ngAfterViewInit(): void {
    this.setupScrollListener();
  }

  ngOnDestroy(): void {
    this.unlockScroll();
    this.removeEventListeners();
    this.clearDebounceTimers();
  }
  
  private clearDebounceTimers(): void {
    if (this.lockDebounceTimer) {
      clearTimeout(this.lockDebounceTimer);
      this.lockDebounceTimer = null;
    }
    if (this.unlockDebounceTimer) {
      clearTimeout(this.unlockDebounceTimer);
      this.unlockDebounceTimer = null;
    }
  }

  private setupScrollListener(): void {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.handleScroll.bind(this), { passive: false });
      window.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
      window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
      window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
      window.addEventListener('keydown', this.handleKeydown.bind(this), { passive: false });
    });
  }

  private removeEventListeners(): void {
    window.removeEventListener('scroll', this.handleScroll.bind(this));
    window.removeEventListener('wheel', this.handleWheel.bind(this));
    window.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    window.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    window.removeEventListener('keydown', this.handleKeydown.bind(this));
  }

  private handleScroll(): void {
    if (!this.processSection) return;

    const currentScrollY = window.scrollY;
    this.scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up';
    this.lastScrollY = currentScrollY;

    const sectionRect = this.processSection.nativeElement.getBoundingClientRect();
    const sectionTop = sectionRect.top;
    const sectionHeight = sectionRect.height;
    const windowHeight = window.innerHeight;

    // Calculate if section center is near screen center
    const sectionCenter = sectionTop + (sectionHeight / 2);
    const screenCenter = windowHeight / 2;
    const distanceFromCenter = Math.abs(sectionCenter - screenCenter);
    const lockDistance = windowHeight * this.lockThreshold;
    const unlockDistance = windowHeight * this.unlockThreshold;
    
    // Check if section is visible in viewport
    const sectionVisible = sectionTop < windowHeight && (sectionTop + sectionHeight) > 0;
    const isInLockZone = distanceFromCenter <= lockDistance && sectionVisible;
    const shouldUnlock = !sectionVisible || distanceFromCenter > unlockDistance;

    // Apply hysteresis logic with scroll lock service
    if (!this.isLocked && isInLockZone && !this.wasInLockZone && !this.hasEverLocked) {
      // Only lock once, when scrolling down for the first time
      if (this.scrollDirection === 'down' && this.scrollLockService.canSectionLock(this.SECTION_ID, this.scrollDirection)) {
        // Entering lock zone - debounce the lock
        this.clearDebounceTimers();
        this.lockDebounceTimer = setTimeout(() => {
          if (isInLockZone && this.scrollLockService.canSectionLock(this.SECTION_ID, this.scrollDirection)) {
            this.lockScroll();
          }
        }, this.lockDebounceDelay);
      }
    } else if (this.isLocked && shouldUnlock) {
      // Should unlock - debounce the unlock
      this.clearDebounceTimers();
      this.unlockDebounceTimer = setTimeout(() => {
        const rect = this.processSection.nativeElement.getBoundingClientRect();
        const center = rect.top + (rect.height / 2);
        const dist = Math.abs(center - (window.innerHeight / 2));
        if (dist > windowHeight * this.unlockThreshold || !sectionVisible) {
          const exitDirection = this.scrollDirection;
          this.unlockScroll(exitDirection);
        }
      }, this.unlockDebounceDelay);
    }
    
    this.wasInLockZone = isInLockZone;
  }

  private handleWheel(event: WheelEvent): void {
    if (!this.isLocked) return;

    event.preventDefault();
    
    const now = Date.now();
    if (now - this.lastScrollTime < this.scrollDelay || this.isTransitioning) {
      return;
    }

    this.scrollAccumulator += Math.abs(event.deltaY);

    if (this.scrollAccumulator >= this.requiredScroll) {
      this.scrollAccumulator = 0;
      this.lastScrollTime = now;

      if (event.deltaY > 0) {
        this.nextStep();
      } else {
        this.previousStep();
      }
    }
  }

  private handleTouchStart(event: TouchEvent): void {
    this.touchStartY = event.touches[0].clientY;
  }

  private handleTouchMove(event: TouchEvent): void {
    if (!this.isLocked) return;

    const touchEndY = event.touches[0].clientY;
    const deltaY = this.touchStartY - touchEndY;

    if (Math.abs(deltaY) > this.touchSensitivity) {
      event.preventDefault();
      
      const now = Date.now();
      if (now - this.lastScrollTime < this.scrollDelay || this.isTransitioning) {
        return;
      }

      this.lastScrollTime = now;
      
      if (deltaY > 0) {
        this.nextStep();
      } else {
        this.previousStep();
      }
      
      this.touchStartY = touchEndY;
    }
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (!this.isLocked) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      
      const now = Date.now();
      if (now - this.lastScrollTime < this.scrollDelay || this.isTransitioning) {
        return;
      }

      this.lastScrollTime = now;

      if (event.key === 'ArrowDown') {
        this.nextStep();
      } else {
        this.previousStep();
      }
    }
  }

  private nextStep(): void {
    if (this.activeIndex < this.steps.length) {
      this.isTransitioning = true;
      this.ngZone.run(() => {
        this.activeIndex++;
        setTimeout(() => {
          this.isTransitioning = false;
        }, 600);
      });
    } else {
      // Completed all steps - add a slight delay before unlocking
      this.isTransitioning = true;
      this.sectionCompleted = true;
      
      setTimeout(() => {
        this.clearDebounceTimers();
        this.unlockScroll('down');
        this.scrollPastSection();
        this.isTransitioning = false;
      }, 100); // Give user time to see completion
    }
  }

  private previousStep(): void {
    if (this.activeIndex > 1) {
      this.isTransitioning = true;
      this.ngZone.run(() => {
        this.activeIndex--;
        setTimeout(() => {
          this.isTransitioning = false;
        }, 600);
      });
    } else {
      // At first step, unlock and scroll up
      this.clearDebounceTimers();
      this.unlockScroll('up');
      this.scrollBeforeSection();
    }
  }

  private lockScroll(): void {
    if (this.isLocked) return;
    
    // Clear any pending unlocks
    if (this.unlockDebounceTimer) {
      clearTimeout(this.unlockDebounceTimer);
      this.unlockDebounceTimer = null;
    }
    
    this.isLocked = true;
    this.hasEverLocked = true;
    this.scrollAccumulator = 0;
    this.scrollLockService.lockSection(this.SECTION_ID);
    document.body.style.overflow = 'hidden';
    
    // Set initial step based on scroll direction
    if (!this.hasEnteredSection) {
      this.activeIndex = this.scrollDirection === 'down' ? 1 : this.steps.length;
      this.hasEnteredSection = true;
    }
    
    // Center the section on screen
    this.centerSection();
  }

  private unlockScroll(exitDirection?: 'up' | 'down'): void {
    if (!this.isLocked) return;
    
    // Clear any pending locks
    if (this.lockDebounceTimer) {
      clearTimeout(this.lockDebounceTimer);
      this.lockDebounceTimer = null;
    }
    
    const direction = exitDirection || this.scrollDirection;
    this.scrollLockService.unlockSection(this.SECTION_ID, direction);
    
    this.isLocked = false;
    this.scrollAccumulator = 0;
    document.body.style.overflow = '';
    this.wasInLockZone = false;
    
    // Reset scroll tracking to prevent immediate re-lock
    this.lastScrollTime = Date.now();
  }

  private centerSection(): void {
    const sectionElement = this.processSection.nativeElement;
    const sectionTop = sectionElement.offsetTop;
    const sectionHeight = sectionElement.offsetHeight;
    const windowHeight = window.innerHeight;
    const centerOffset = (windowHeight - sectionHeight) / 2;
    
    window.scrollTo({
      top: sectionTop - centerOffset,
      behavior: 'smooth'
    });
  }

  private scrollPastSection(): void {
    const sectionElement = this.processSection.nativeElement;
    const sectionBottom = sectionElement.offsetTop + sectionElement.offsetHeight;
    
    // More conservative scroll - just move past the section edge
    const targetScroll = sectionBottom + 50; // Just 50px past the section
    
    // Use requestAnimationFrame for smoother control
    requestAnimationFrame(() => {
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    });
  }

  private scrollBeforeSection(): void {
    const sectionElement = this.processSection.nativeElement;
    const sectionTop = sectionElement.offsetTop;
    
    setTimeout(() => {
      window.scrollTo({
        top: sectionTop - window.innerHeight * 1.2,
        behavior: 'smooth'
      });
    }, 300);
  }

  isStepActive(stepId: number): boolean {
    return stepId === this.activeIndex;
  }

  getProgressPercentage(): number {
    if (this.activeIndex === 1) return 0;
    if (this.activeIndex === this.steps.length) return 100;
    
    const segmentWidth = 100 / (this.steps.length - 1);
    return (this.activeIndex - 1) * segmentWidth;
  }

  onStepClick(stepId: number): void {
    if (!this.isLocked) return;
    
    if (stepId !== this.activeIndex && !this.isTransitioning) {
      this.isTransitioning = true;
      this.activeIndex = stepId;
      
      setTimeout(() => {
        this.isTransitioning = false;
      }, 800);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.isLocked && this.processSection) {
      this.centerSection();
    } else {
      this.unlockScroll();
    }
  }
}