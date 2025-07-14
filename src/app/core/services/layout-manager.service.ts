import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';
import { I18nService } from './i18n.service';

@Injectable({
  providedIn: 'root'
})
export class LayoutManagerService {
  private renderer: Renderer2;

  constructor(
    private i18nService: I18nService,
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);

    // Subscribe to language changes
    this.i18nService.currentLanguage$.subscribe(language => {
      this.applyLanguageSpecificLayout(language.code);
    });
  }

  /**
   * Apply language-specific layout adjustments
   */
  applyLanguageSpecificLayout(langCode: string): void {
    // Set language attribute on HTML element
    this.renderer.setAttribute(this.document.documentElement, 'lang', langCode);

    // Update body classes
    this.document.body.classList.remove('layout-en', 'layout-geo');
    this.document.body.classList.add(`layout-${langCode}`);

    // Apply CSS variables based on language
    if (langCode === 'geo') {
      this.setGeorgianLayoutStyles();
    } else {
      this.setEnglishLayoutStyles();
    }
  }

  /**
   * Set styles for Georgian language
   */
  private setGeorgianLayoutStyles(): void {
    const styles = {
      '--content-max-width': '75ch',
      '--text-line-height': '1.6',
      '--heading-line-height': '1.3',
      '--button-min-height': '54px',
      '--text-scale-ratio': '0.95',
      '--flex-gap': '1.25rem',
      '--content-spacing': '1.25rem',
      '--container-padding': '1.25rem',
      '--nav-item-padding': '0.5rem 0.75rem'
    };

    Object.entries(styles).forEach(([prop, value]) => {
      this.renderer.setStyle(this.document.documentElement, prop, value);
    });
  }

  /**
   * Set styles for English language (default)
   */
  private setEnglishLayoutStyles(): void {
    const styles = {
      '--content-max-width': '65ch',
      '--text-line-height': '1.5',
      '--heading-line-height': '1.2',
      '--button-min-height': '48px',
      '--text-scale-ratio': '1',
      '--flex-gap': '1rem',
      '--content-spacing': '1rem',
      '--container-padding': '1rem',
      '--nav-item-padding': '0.5rem 1rem'
    };

    Object.entries(styles).forEach(([prop, value]) => {
      this.renderer.setStyle(this.document.documentElement, prop, value);
    });
  }

  /**
   * Apply specific style to a container based on language
   * Useful for component-specific adjustments
   */
  applyComponentLayoutAdjustments(element: HTMLElement, langCode: string): void {
    if (langCode === 'geo') {
      // Georgian-specific component adjustments
      this.renderer.addClass(element, 'text-wrap');

      // Check if this is a button or menu-item that needs text adjustments
      if (element.classList.contains('menu-items') ||
          element.classList.contains('Primary-Default') ||
          element.classList.contains('Secondary-Default')) {
        this.renderer.setStyle(element, 'white-space', 'normal');
        this.renderer.setStyle(element, 'word-break', 'break-word');
      }
    } else {
      // English (default) adjustments
      this.renderer.removeClass(element, 'text-wrap');
    }
  }

  /**
   * Apply language-specific styles to text elements
   */
  applyTextStyles(element: HTMLElement, langCode: string, isHeading: boolean = false): void {
    if (langCode === 'geo') {
      // Georgian text adjustments
      this.renderer.setStyle(element, 'line-height', isHeading ? '1.3' : '1.6');
      this.renderer.setStyle(element, 'overflow-wrap', 'break-word');
      this.renderer.setStyle(element, 'word-break', 'break-word');

      // Check if text truncation is needed
      if (element.classList.contains('truncate')) {
        this.renderer.addClass(element, 'text-multiline');
        this.renderer.removeClass(element, 'text-truncate');
      }
    } else {
      // English text adjustments
      this.renderer.setStyle(element, 'line-height', isHeading ? '1.2' : '1.5');

      // Reset text truncation if needed
      if (element.classList.contains('truncate')) {
        this.renderer.addClass(element, 'text-truncate');
        this.renderer.removeClass(element, 'text-multiline');
      }
    }
  }
}
