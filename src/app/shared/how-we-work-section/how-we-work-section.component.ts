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
  
  // State management
  private hasEnteredSection: boolean = false;
  private sectionCompleted: boolean = false;
  private lastScrollY: number = 0;
  private scrollDirection: 'up' | 'down' = 'down';
  
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

    // Calculate if section center is near screen center
    const sectionCenter = sectionTop + (sectionHeight / 2);
    const screenCenter = windowHeight / 2;
    const distanceFromCenter = Math.abs(sectionCenter - screenCenter);
    const centerThreshold = windowHeight * 0.1;
    const isAtCenter = distanceFromCenter <= centerThreshold;

    // Check if section is visible in viewport
    const sectionVisible = sectionTop < windowHeight && (sectionTop + sectionHeight) > 0;

    // Determine if we should lock scroll
    if (!this.isLocked && isAtCenter && sectionVisible) {
      this.lockScroll();
    }

    // Determine if we should unlock scroll
    if (this.isLocked && (!sectionVisible || distanceFromCenter > windowHeight * 0.4)) {
      this.unlockScroll();
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
      // Completed all steps, unlock and continue scrolling
      this.sectionCompleted = true;
      this.unlockScroll();
      this.scrollPastSection();
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
      this.unlockScroll();
      this.scrollBeforeSection();
    }
  }

  private lockScroll(): void {
    if (this.isLocked) return;
    
    this.isLocked = true;
    this.scrollAccumulator = 0;
    document.body.style.overflow = 'hidden';
    
    // Set initial step based on scroll direction
    if (!this.hasEnteredSection) {
      this.activeIndex = this.scrollDirection === 'down' ? 1 : this.steps.length;
      this.hasEnteredSection = true;
    }
    
    // Center the section on screen
    this.centerSection();
  }

  private unlockScroll(): void {
    if (!this.isLocked) return;
    
    this.isLocked = false;
    this.scrollAccumulator = 0;
    document.body.style.overflow = '';
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
    
    setTimeout(() => {
      window.scrollTo({
        top: sectionBottom + window.innerHeight * 0.2,
        behavior: 'smooth'
      });
    }, 300);
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
    if (this.isLocked) {
      this.centerSection();
    }
  }
}