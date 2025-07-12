import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly LANGUAGE_KEY = 'selectedLanguage';

  // Available languages
  private languages: Language[] = [
    { code: 'en', name: 'English', flag: '../../../assets/images/Eng.png' },
    { code: 'ka', name: 'Georgian', flag: '../../../assets/images/Geo.png' }
  ];

  // Current language subject
  private currentLanguageSubject = new BehaviorSubject<Language>(this.languages[0]);

  constructor(private translateService: TranslateService) {
    this.initLanguage();
  }

  /**
   * Initialize language based on saved preference or browser default
   */
  private initLanguage(): void {
    const savedLang = localStorage.getItem(this.LANGUAGE_KEY);
    let defaultLang: Language;

    if (savedLang) {
      defaultLang = this.languages.find(lang => lang.code === savedLang) || this.languages[0];
    } else {
      // If no saved preference, try to match browser language
      const browserLang = this.translateService.getBrowserLang();
      defaultLang = this.languages.find(lang => lang.code === browserLang) || this.languages[0];
    }

    this.setLanguage(defaultLang);
  }

  /**
   * Set current application language
   */
  setLanguage(language: Language): void {
    // Update translate service
    this.translateService.use(language.code);

    // Save to local storage
    localStorage.setItem(this.LANGUAGE_KEY, language.code);

    // Update behavior subject
    this.currentLanguageSubject.next(language);
  }

  /**
   * Get current language observable
   */
  getCurrentLanguage(): Observable<Language> {
    return this.currentLanguageSubject.asObservable();
  }

  /**
   * Get current language value
   */
  getCurrentLanguageValue(): Language {
    return this.currentLanguageSubject.value;
  }

  /**
   * Get all available languages
   */
  getLanguages(): Language[] {
    return this.languages;
  }
}
