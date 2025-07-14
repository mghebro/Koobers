import { Directive, ElementRef, OnInit, OnDestroy, Input, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { I18nService } from '../../core/services/i18n.service';
import { LayoutManagerService } from '../../core/services/layout-manager.service';

@Directive({
  selector: '[appI18nLayout]',
  standalone: false
})
export class I18nLayoutDirective implements OnInit, OnDestroy {
  @Input() isHeading = false;
  @Input() isTruncatable = false;
  @Input() isContainer = false;
  @Input() isButton = false;
  @Input() isMultiline = false;

  private subscription: Subscription | undefined;

  constructor(
    private elementRef: ElementRef,
    private i18nService: I18nService,
    private layoutManager: LayoutManagerService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Apply initial styles based on current language
    this.applyStyles(this.i18nService.currentLanguage.code);

    // Subscribe to language changes
    this.subscription = this.i18nService.currentLanguage$.subscribe(language => {
      this.applyStyles(language.code);
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Apply appropriate styles based on language and element type
   */
  private applyStyles(langCode: string): void {
    const element = this.elementRef.nativeElement;

    // Apply different styles based on element type
    if (this.isContainer) {
      // Apply container-specific styles
      this.layoutManager.applyComponentLayoutAdjustments(element, langCode);
    } else if (this.isHeading) {
      // Apply heading-specific styles
      this.layoutManager.applyTextStyles(element, langCode, true);
    } else if (this.isButton) {
      // Apply button-specific styles for Georgian language
      if (langCode === 'geo') {
        this.renderer.setStyle(element, 'white-space', 'normal');
        this.renderer.setStyle(element, 'word-break', 'break-word');
        this.renderer.setStyle(element, 'min-height', 'var(--button-min-height)');
      } else {
        this.renderer.removeStyle(element, 'white-space');
        this.renderer.removeStyle(element, 'word-break');
        this.renderer.setStyle(element, 'min-height', '48px');
      }
    } else {
      // Standard text element
      this.layoutManager.applyTextStyles(element, langCode, false);

      // Apply truncation or multiline handling if needed
      if (this.isTruncatable) {
        if (langCode === 'geo') {
          // For Georgian, use multi-line truncation
          this.renderer.addClass(element, 'text-multiline');
          this.renderer.removeClass(element, 'text-truncate');
        } else {
          // For English, use single-line truncation
          this.renderer.addClass(element, 'text-truncate');
          this.renderer.removeClass(element, 'text-multiline');
        }
      }

      // If element should always be multiline
      if (this.isMultiline) {
        this.renderer.setStyle(element, 'white-space', 'normal');
        this.renderer.setStyle(element, 'word-break', 'break-word');
      }
    }
  }
}
