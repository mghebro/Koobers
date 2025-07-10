import { Component, OnInit } from '@angular/core';
import { CodeSnippetsService, CodeSnippets, TabType } from '../../../core/services/code-snippets.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home-hero-section',
  standalone: false,
  templateUrl: './home-hero-section.html',
  styleUrl: './home-hero-section.scss'
})
export class HomeHeroSection implements OnInit {
  // Property for template interpolation in code examples
  message = 'message';

  words: string[] = [];
  currentWordIndex: number = 0;
  displayedText: string = '';
  isDeleting: boolean = false;
  cursorVisible: boolean = true;
  isGeorgian: boolean = false;

  // Code display properties
  activeTab: TabType = 'angular';
  codeSnippets: CodeSnippets = {};

  constructor(
    private codeSnippetsService: CodeSnippetsService,
    private translationService: TranslationService,
    private translateService: TranslateService
  ) {
    this.codeSnippets = this.codeSnippetsService.getCodeSnippets();
    // Check if current language is Georgian
    this.isGeorgian = this.translationService.getCurrentLanguageValue().code === 'ka';

    // Initialize words with translations
    this.loadTranslatedWords();
  }

  ngOnInit(): void {
    this.type();
    this.blinkCursor();

    // Subscribe to language changes
    this.translationService.getCurrentLanguage().subscribe(lang => {
      this.isGeorgian = lang.code === 'ka';
      // Reload words when language changes
      this.loadTranslatedWords();
    });
  }

  // Load translated words from translation files
  loadTranslatedWords(): void {
    this.words = [
      this.translateService.instant('HOME.TYPEWRITER.DEVELOPERS'),
      this.translateService.instant('HOME.TYPEWRITER.STARTUPS'),
      this.translateService.instant('HOME.TYPEWRITER.BIG_CORPORATIONS')
    ];

    // Reset typewriter if language changes while typing
    if (this.displayedText.length > 0) {
      this.displayedText = '';
      this.isDeleting = false;
      this.currentWordIndex = 0;
    }
  }

  type(): void {
    const fullWord = this.words[this.currentWordIndex];

    if (this.isDeleting) {
      this.displayedText = fullWord.substring(0, this.displayedText.length - 1);
    } else {
      this.displayedText = fullWord.substring(0, this.displayedText.length + 1);
    }

    // Variable typing speed to make it more realistic
    let typeSpeed = this.getRandomTypingSpeed();

    if (this.isDeleting) {
      typeSpeed /= 1.5; // Faster when deleting
    }

    if (!this.isDeleting && this.displayedText === fullWord) {
      typeSpeed = 2000; // Pause at end of word
      this.isDeleting = true;
    } else if (this.isDeleting && this.displayedText === '') {
      this.isDeleting = false;
      this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
      typeSpeed = 700; // Pause before starting the next word
    }

    setTimeout(() => this.type(), typeSpeed);
  }

  // Get random typing speed for more realistic effect
  getRandomTypingSpeed(): number {
    const baseSpeed = 120; // Base typing speed
    const variance = 80; // Add some variability
    return Math.floor(baseSpeed + Math.random() * variance);
  }

  // Control the cursor blinking separately from typing
  blinkCursor(): void {
    this.cursorVisible = !this.cursorVisible;
    setTimeout(() => this.blinkCursor(), 700);
  }

  onTabChange(tab: TabType): void {
    this.activeTab = tab;
  }
}
