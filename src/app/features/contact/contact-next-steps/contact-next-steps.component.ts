import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-contact-next-steps',
  standalone: false,
  templateUrl: './contact-next-steps.component.html',
  styleUrls: ['./contact-next-steps.component.scss']
})
export class ContactNextStepsComponent implements OnInit, AfterViewInit {
  @ViewChild('animatedSection', { read: ElementRef }) animatedSection!: ElementRef;
  
  private observer!: IntersectionObserver;
  
  ngOnInit() {
  }
  
  ngAfterViewInit() {
    this.setupScrollAnimation();
  }
  
  private setupScrollAnimation() {
    const options = {
      root: null,
      rootMargin: '-100px',
      threshold: 0.5
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          this.observer.unobserve(entry.target);
        }
      });
    }, options);
    
    if (this.animatedSection) {
      this.observer.observe(this.animatedSection.nativeElement);
    }
  }
  
  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
