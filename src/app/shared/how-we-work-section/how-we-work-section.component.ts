import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone, HostListener } from '@angular/core';

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
  private hasCompletedSection: boolean = false;
  private hasExitedFromTop: boolean = false;
  private scrollThreshold: number = 50;
  private lastScrollTime: number = 0;
  private scrollDelay: number = 300;
  private isTransitioning: boolean = false;
  private lastScrollY: number = 0;
  private scrollDirection: 'up' | 'down' = 'down';
  private hasScrolledPast: boolean = false;
  
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

  private scrollAccumulator: number = 0;
  private requiredScroll: number = 120;
  private touchStartY: number = 0;
  private touchSensitivity: number = 50;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.setupScrollListener();
  }

  ngOnDestroy(): void {
    this.unlockScroll();
    this.removeEventListeners();
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

    // Check if section is in the viewport for locking
    if (!this.isLocked && !this.hasCompletedSection) {
      if (this.scrollDirection === 'down' && sectionTop <= windowHeight * 0.3 && sectionTop > -sectionHeight * 0.5) {
        // Reset to first step when entering from top
        this.activeIndex = 1;
        this.hasExitedFromTop = false;
        this.lockScroll();
      }
    }
    
    // Handle re-entry from top after exiting
    if (this.hasExitedFromTop && !this.isLocked && this.scrollDirection === 'down' && sectionTop <= windowHeight * 0.3) {
      this.activeIndex = 1;
      this.hasExitedFromTop = false;
      this.lockScroll();
    }

    // Check if we've scrolled past the section
    if (this.scrollDirection === 'down' && sectionTop < -sectionHeight * 0.7) {
      this.hasScrolledPast = true;
      if (this.isLocked) {
        this.unlockScroll();
      }
    }

    // Handle scroll up re-entry
    if (this.scrollDirection === 'up' && this.hasScrolledPast && sectionTop >= -sectionHeight * 0.3) {
      this.hasScrolledPast = false;
      this.activeIndex = 5;
      if (!this.isLocked && sectionTop <= windowHeight * 0.5) {
        this.lockScroll();
      }
    }
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
      this.unlockScroll();
      this.hasCompletedSection = true;
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
    } else if (this.activeIndex === 1) {
      // When on first step and scrolling up, unlock and scroll to top
      this.hasExitedFromTop = true;
      this.unlockScroll();
    }
  }

  private lockScroll(): void {
    this.isLocked = true;
    this.scrollAccumulator = 0;
    document.body.style.overflow = 'hidden';
    
    // Ensure the section stays in view
    const sectionTop = this.processSection.nativeElement.offsetTop;
    const offset = window.innerHeight * 0.1;
    window.scrollTo({
      top: sectionTop - offset,
      behavior: 'smooth'
    });
  }

  private unlockScroll(): void {
    this.isLocked = false;
    this.scrollAccumulator = 0;
    document.body.style.overflow = '';
    
    // If scrolling down and completed, scroll past the section
    if (this.scrollDirection === 'down' && this.activeIndex === this.steps.length) {
      const sectionBottom = this.processSection.nativeElement.offsetTop + this.processSection.nativeElement.offsetHeight;
      setTimeout(() => {
        window.scrollTo({
          top: sectionBottom - window.innerHeight * 0.5,
          behavior: 'smooth'
        });
      }, 100);
    }
  }

  private scrollToTop(): void {
    // Scroll to a position above the section
    const sectionTop = this.processSection.nativeElement.offsetTop;
    setTimeout(() => {
      window.scrollTo({
        top: sectionTop - window.innerHeight * 0.8,
        behavior: 'smooth'
      });
    }, 100);
  }

  isStepActive(stepId: number): boolean {
    return stepId === this.activeIndex;
  }

  getProgressPercentage(): number {
    if (this.activeIndex === 1) return 0;
    if (this.activeIndex === this.steps.length) return 100;
    
    // Calculate percentage based on active step
    const segmentWidth = 100 / (this.steps.length - 1);
    return (this.activeIndex - 1) * segmentWidth;
  }

  onStepClick(stepId: number): void {
    if (!this.isLocked) return;
    
    // Allow clicking on any step
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
    // Handle resize events if needed
  }
}