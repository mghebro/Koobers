import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  OnInit,
  HostListener
} from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';

declare const UnicornStudio: any;

@Component({
  selector: 'app-coming-soon-page',
  standalone: false,
  templateUrl: './coming-soon-page.html',
  styleUrl: './coming-soon-page.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})

export class ComingSoonPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('unicornContainer', { static: false }) unicornContainer!: ElementRef;

  public animationError: string | null = null;
  public animationLoaded = false;

  private unicornAnimation: any;
  private resizeTimeout: any;
  private readonly ANIMATION_INIT_DELAY = 300;
  private readonly ANIMATION_LOAD_DELAY = 500;
  private readonly RESIZE_DEBOUNCE = 150;

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    this.setContainerTransparent();
    setTimeout(() => this.initAnimation(), this.ANIMATION_INIT_DELAY);
  }

  ngOnDestroy(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.cleanupAnimation();
    this.destroyUnicornStudio();
  }

  @HostListener('window:beforeunload')
  handleBeforeUnload(): void {
    this.cleanupAnimation();
  }

  @HostListener('window:resize')
  handleResize(): void {
    // Immediately hide animation to prevent border artifacts
    this.animationLoaded = false;
    
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    this.resizeTimeout = setTimeout(() => {
      this.performResize();
      this.animationLoaded = false;
    }, this.RESIZE_DEBOUNCE);
  }

  private performResize(): void {
    const container = this.unicornContainer?.nativeElement;
    if (!container || !this.unicornAnimation) return;

    container.classList.add('loading');
    
    try {
      // Try different UnicornStudio resize methods
      if (this.unicornAnimation.resize) {
        this.unicornAnimation.resize();
      } else if (this.unicornAnimation.updateSize) {
        this.unicornAnimation.updateSize();
      } else {
        // Fallback: recreate animation
        this.recreateAnimationOnResize();
        return;
      }
    } catch (error) {
      console.error('Error resizing animation:', error);
      this.recreateAnimationOnResize();
      return;
    }

    setTimeout(() => {
      container.classList.remove('loading');
      this.ensureCanvasTransparency(container);
      // Re-enable animation display after resize is complete
      this.animationLoaded = true;
    }, 500);
  }

  private recreateAnimationOnResize(): void {
    if (!this.unicornAnimation) return;
    
    const container = this.unicornContainer?.nativeElement;
    if (!container) return;

    const wasPlaying = this.animationLoaded;
    
    this.cleanupAnimation();
    
    setTimeout(() => {
      this.initAnimation().then(() => {
        if (wasPlaying) {
          this.playAnimation();
        }
      });
    }, 100);
  }

  private async initAnimation(): Promise<void> {
    if (!this.isUnicornStudioAvailable()) {
      return this.setError('UnicornStudio library not found');
    }

    const container = this.getAnimationContainer();
    if (!container) {
      return this.setError('Animation container not found');
    }

    this.prepareContainer(container);

    try {
      this.unicornAnimation = await this.createUnicornScene(container);
      this.playAnimation();
      this.finalizeAnimationLoading(container);
    } catch (error) {
      console.error('Animation initialization failed:', error);
      this.setError('Failed to load animation');
    }
  }

  private isUnicornStudioAvailable(): boolean {
    return typeof UnicornStudio !== 'undefined';
  }

  private getAnimationContainer(): HTMLElement | null {
    return this.unicornContainer?.nativeElement || null;
  }

  private prepareContainer(container: HTMLElement): void {
    this.setElementTransparent(container);
    container.id = container.id || `unicorn-animation-${Date.now().toString(36)}`;
  }

  private async createUnicornScene(container: HTMLElement): Promise<any> {
    return await UnicornStudio.addScene({
      elementId: container.id,
      filePath: 'assets/animations/polaris.json',
      fps: 90,
      scale: 1,
      dpi: 1.5,
      lazyLoad: false,
      altText: 'Background animation',
      ariaLabel: 'Animated background canvas',
      production: false,
      autoplay: true,
      loop: true,
      interactivity: {
        mouse: { disableMobile: true },
      },
      settings: {
        responsive: true,
        preserveAspectRatio: true,
        backgroundColor: 'transparent',
      },
    });
  }

  private finalizeAnimationLoading(container: HTMLElement): void {
    setTimeout(() => {
      this.animationError = null;
      this.animationLoaded = true;
      this.ensureCanvasTransparency(container);
    }, this.ANIMATION_LOAD_DELAY);
  }

  private ensureCanvasTransparency(container: HTMLElement): void {
    const canvas = container.querySelector('canvas');
    if (canvas) {
      this.setElementTransparent(canvas);
    }
  }

  private setError(message: string): void {
    console.error(message);
    this.animationError = message;
    this.animationLoaded = false;
    this.setContainerTransparent();
  }

  private cleanupAnimation(): void {
    if (!this.unicornAnimation) return;

    try {
      this.unicornAnimation.destroy?.();
    } catch (error) {
      console.error('Error destroying animation:', error);
    } finally {
      this.unicornAnimation = null;
    }
  }

  private destroyUnicornStudio(): void {
    try {
      UnicornStudio?.destroy?.();
    } catch (error) {
      console.error('Error destroying UnicornStudio globally:', error);
    }
  }

  private setContainerTransparent(): void {
    const container = this.unicornContainer?.nativeElement;
    if (container) {
      this.setElementTransparent(container);
    }
  }

  private setElementTransparent(element: HTMLElement): void {
    element.style.backgroundColor = 'transparent';
  }

  public playAnimation(): void {
    this.unicornAnimation?.play?.();
  }

  public retryAnimation(): void {
    this.cleanupAnimation();
    this.resetAnimationState();
    this.setContainerTransparent();
    setTimeout(() => this.initAnimation(), 100);
  }

  private resetAnimationState(): void {
    this.animationError = null;
    this.animationLoaded = false;
  }
}
