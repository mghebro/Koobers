import { Component, ElementRef, ViewChildren, QueryList, AfterViewInit, Renderer2, ViewChild } from '@angular/core';

interface TeamMember {
  name: string;
  role: string;
  link: string;
  imageUrl?: string;
  displayUrl?: string;
  isFlipped?: boolean;
}

@Component({
  selector: 'app-team-section',
  standalone: false,
  templateUrl: './team-section.component.html',
  styleUrl: './team-section.component.scss'
})
export class TeamSectionComponent implements AfterViewInit {
  @ViewChildren('topRow') topRows!: QueryList<ElementRef>;
  @ViewChildren('bottomRow') bottomRows!: QueryList<ElementRef>;
  @ViewChild('teamSection') teamSection!: ElementRef;

  constructor(private renderer: Renderer2) {}

  topRowMembers: TeamMember[] = [
    { name: 'Dachi Sebiskveradze', role: 'Developer', link: '#', isFlipped: false },
    { name: 'Nikoloz Oqroshiashvili', role: 'UI/UX Designer', link: 'nickoqroshiashvili.framer.website', displayUrl: 'nickoqroshiashvili.framer.website', isFlipped: false },
    { name: 'Giorgi Shanidze', role: 'Developer', link: '#', isFlipped: false },
    {name: 'Mate Oqroshiashvili', role: 'Developer', link: '#', isFlipped: false}
  ];

  bottomRowMembers: TeamMember[] = [
    { name: 'Nuca Nasaraia', role: 'Developer', link: '#', isFlipped: false },
    { name: 'Gocha Zautashvili', role: 'Developer', link: '#', isFlipped: false },
    { name: 'Giorgi Mamaladze', role: 'Developer', link: '#', isFlipped: false },
    { name: 'Nikoloz Chikhradze', role: 'Developer', link: '#', isFlipped: false }
  ];

  ngAfterViewInit() {
    // Use Intersection Observer to handle visibility
    if (typeof IntersectionObserver !== 'undefined') {
      this.setupIntersectionObserver();
    }
  }

  /**
   * Setup Intersection Observer to monitor card visibility
   */
  private setupIntersectionObserver() {
    const options = {
      root: null, // Use viewport
      rootMargin: '0px',
      threshold: [0.5, 0.9] // Trigger at 50% and 90% visibility
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target as HTMLElement;

        // Find if this is a flip card
        if (el.classList.contains('team-member')) {
          // Add or remove the disable-hover class based on visibility
          if (entry.intersectionRatio >= 0.9) {
            // Fully visible - allow hover
            el.classList.remove('disable-hover');
          } else if (entry.intersectionRatio < 0.5) {
            // Partially visible - disable hover
            el.classList.add('disable-hover');
          }
        }
      });
    }, options);

    // Observe all team members
    setTimeout(() => {
      const teamMembers = document.querySelectorAll('.team-member');
      teamMembers.forEach(member => observer.observe(member));
    }, 500);
  }

  toggleFlip(member: TeamMember): void {
    member.isFlipped = !member.isFlipped;
  }

  flipCard(member: TeamMember, isFlipped: boolean, event?: MouseEvent): void {
    // Don't flip if the element has disable-hover class
    if (event && (event.currentTarget as HTMLElement).classList.contains('disable-hover')) {
      return;
    }

    member.isFlipped = isFlipped;

    // Determine which row this member belongs to
    const rowType = this.topRowMembers.includes(member) ? 'top' : 'bottom';

    // Pause animation on hover, resume on leave
    const row = (rowType === 'top') ? this.topRows.first?.nativeElement : this.bottomRows.first?.nativeElement;
    if (row) {
      this.renderer.setStyle(row, 'animation-play-state', isFlipped ? 'paused' : 'running');
    }
  }

  pauseAnimation(event: MouseEvent, rowType: string): void {
    const row = (rowType === 'top') ? this.topRows.first?.nativeElement : this.bottomRows.first?.nativeElement;
    if (row) {
      this.renderer.setStyle(row, 'animation-play-state', 'paused');
    }
  }

  resumeAnimation(event: MouseEvent, rowType: string): void {
    const row = (rowType === 'top') ? this.topRows.first?.nativeElement : this.bottomRows.first?.nativeElement;
    if (row) {
      this.renderer.setStyle(row, 'animation-play-state', 'running');
    }
  }

  flipBack(event: MouseEvent, member: TeamMember): void {
    event.stopPropagation();
    event.preventDefault(); // Prevent default link navigation temporarily

    // Force immediate flip
    member.isFlipped = false;

    // Navigate to the link after a minimal timeout to ensure the flip happens first
    const url = (event.target as HTMLAnchorElement).href;
    setTimeout(() => {
      window.open(url, '_blank');
    }, 10); // Small timeout to prioritize the flip animation
  }
}
