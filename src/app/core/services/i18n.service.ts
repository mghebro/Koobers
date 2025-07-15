import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private readonly STORAGE_KEY = 'koobercoders_language';

  // Available languages
  readonly languages: Language[] = [
    { code: 'en', name: 'English', flag: '../../../assets/images/Eng.png' },
    { code: 'geo', name: 'Georgian', flag: '../../../assets/images/Geo.png' },
  ];

  // Default language
  private _currentLanguage = new BehaviorSubject<Language>(this.languages[0]);

  // Observable for components to subscribe to language changes
  currentLanguage$ = this._currentLanguage.asObservable();

  constructor(private translateService: TranslateService) {
    // Configure available languages
    const languageCodes = this.languages.map(lang => lang.code);
    this.translateService.addLangs(languageCodes);
    this.translateService.setDefaultLang('en');

    // Load language from local storage on initialization
    this.loadStoredLanguage();
  }

  /**
   * Get the current language
   */
  get currentLanguage(): Language {
    return this._currentLanguage.value;
  }

  /**
   * Set the active language and save to localStorage
   */
  setLanguage(languageCode: string): void {
    const language = this.languages.find(lang => lang.code === languageCode);
    if (language) {
      this._currentLanguage.next(language);
      this.translateService.use(language.code);
      this.saveLanguageToStorage(language.code);
    }
  }

  /**
   * Returns the display name for the current language
   */
  getLanguageDisplay(): string {
    const code = this._currentLanguage.value.code;
    if (code === 'en') {
      return 'Eng';
    } else if (code === 'geo') {
      return 'Geo';
    }
    return 'Eng/Geo';
  }

  /**
   * Translate a key
   */
  translate(key: string, params?: any): string {
    let result = '';
    this.translateService.get(key, params).subscribe(res => {
      result = res;
    });
    return result;
  }

  /**
   * Load the language from localStorage
   */
  private loadStoredLanguage(): void {
    try {
      const storedLang = localStorage.getItem(this.STORAGE_KEY);
      if (storedLang) {
        this.setLanguage(storedLang);
      } else {
        // Try to use browser language or default to English
        const browserLang = this.translateService.getBrowserLang();
        const langCode = browserLang && this.languages.some(l => l.code === browserLang)
          ? browserLang
          : 'en';
        this.setLanguage(langCode);
      }
    } catch (error) {
      console.error('Error loading language from localStorage:', error);
      // Default to English on error
      this.setLanguage('en');
    }
  }

  /**
   * Save the selected language to localStorage
   */
  private saveLanguageToStorage(languageCode: string): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, languageCode);
    } catch (error) {
      console.error('Error saving language to localStorage:', error);
    }
  }
}
