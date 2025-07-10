import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  HostListener,
} from '@angular/core';

@Component({
  selector: 'app-about-section',
  standalone: false,
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.scss',
})
export class AboutSectionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('textBlock') textBlock!: ElementRef;
  private animationFrame: number | null = null;
  private smoothProgress: number = 0;

  constructor() {}

  ngAfterViewInit(): void {
    // Set initial position
    this.updateAnimation();
    
    // Start continuous animation
    this.startAnimation();
  }

  ngOnDestroy(): void {
    this.stopAnimation();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    // Animation is always running, no need to check
  }

  private startAnimation(): void {
    const animate = () => {
      this.updateAnimation();
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
  }

  private stopAnimation(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private updateAnimation(): void {
    if (!this.textBlock || !this.textBlock.nativeElement) {
      return;
    }

    const section = this.textBlock.nativeElement.closest('.about-section');
    if (!section) {
      return;
    }

    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate scroll progress
    const targetProgress = this.calculateScrollProgress(rect, windowHeight);
    
    // Smooth the progress for heavy, cinematic feel
    this.smoothProgress = this.lerp(this.smoothProgress, targetProgress, 0.08);
    
    // Apply transform based on smoothed progress
    this.applyTransform(this.smoothProgress);
  }

  private calculateScrollProgress(rect: DOMRect, windowHeight: number): number {
    // Progress starts when section enters viewport
    // Progress ends when section leaves viewport
    
    if (rect.top >= windowHeight) {
      // Section hasn't entered viewport yet
      return 0;
    } else if (rect.bottom <= 0) {
      // Section has left viewport
      return 1;
    } else {
      // Section is in viewport - calculate progress
      // Total scroll distance is the section height minus one viewport
      const totalScrollDistance = rect.height - windowHeight;
      const scrolled = -rect.top;
      
      // Calculate progress (0 to 1)
      const progress = scrolled / totalScrollDistance;
      
      return Math.max(0, Math.min(1, progress));
    }
  }

  private applyTransform(progress: number): void {
    // Star Wars style positioning
    const startY = 600;   // Start below viewport
    const endY = -1800;   // End above viewport (reduced from -3000)
    
    // Use custom easing for cinematic feel
    const easedProgress = this.cinematicEase(progress);
    const currentY = startY + (easedProgress * (endY - startY));
    
    // Apply the transform with proper centering
    this.textBlock.nativeElement.style.transform = 
      `translate(-50%, -50%) rotateX(25deg) translateZ(0) translateY(${currentY}px)`;
    
    // Fade in/out for smooth appearance
    let opacity = 1;
    
    // Fade in at the beginning (first 10%)
    if (progress < 0.1) {
      opacity = progress / 0.1;
    } 
    // Fade out at the end (last 10%)
    else if (progress > 0.9) {
      opacity = (1 - progress) / 0.1;
    }
    
    this.textBlock.nativeElement.style.opacity = opacity.toString();
  }

  // Linear interpolation for smoothing
  private lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
  }

  // Custom easing function for cinematic feel
  private cinematicEase(t: number): number {
    // More linear progression for consistent speed
    // Slight ease at start and end
    if (t < 0.05) {
      // Gentle start
      return t * t * 20;
    } else if (t < 0.95) {
      // Linear middle (most of the animation)
      const adjustedT = (t - 0.05) / 0.9;
      return 0.05 + (adjustedT * 0.9);
    } else {
      // Gentle end
      const endT = (t - 0.95) * 20;
      return 0.95 + (endT * endT * 0.05);
    }
  }
}