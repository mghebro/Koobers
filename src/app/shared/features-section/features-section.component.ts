import { Component, OnInit } from '@angular/core';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-features-section',
  standalone: false,
  templateUrl: './features-section.component.html',
  styleUrls: ['./features-section.component.scss']
})
export class FeaturesSectionComponent implements OnInit {
  currentLanguage: string = 'en';

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    // Set initial language
    this.currentLanguage = this.translationService.getCurrentLanguageValue().code;

    // Subscribe to language changes
    this.translationService.getCurrentLanguage().subscribe(lang => {
      this.currentLanguage = lang.code;
    });
  }

  isGeorgian(): boolean {
    return this.currentLanguage === 'ka';
  }
}
