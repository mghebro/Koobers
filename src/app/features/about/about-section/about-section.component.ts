import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
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

  constructor() {}

  ngAfterViewInit(): void {
    this.startAnimation();
  }

  ngOnDestroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  private startAnimation(): void {
    const animate = () => {
      if (this.textBlock) {
        const section = this.textBlock.nativeElement.closest('.about-section');
        if (section) {
          const rect = section.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          
          // Check if section is in viewport
          if (rect.top < windowHeight && rect.bottom > 0) {
            // Calculate scroll progress
            const sectionHeight = rect.height;
            const scrolled = Math.max(0, -rect.top);
            const progress = scrolled / (sectionHeight - windowHeight);
            
            // Calculate Y position - starts below viewport, moves up
            const startY = 600;
            const endY = -1200;
            const currentY = startY + (progress * (endY - startY));
            
            // Apply transform
            this.textBlock.nativeElement.style.transform = 
              `translateX(-50%) rotateX(25deg) translateY(${currentY}px)`;
          }
        }
      }
      
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
  }
}