# KooberCoders Localization Guide

This project uses ngx-translate for localization, which allows for dynamic language switching without page reloads.

## Current Supported Languages

- English (en)
- Georgian (ka)

## How to Use Translation in Templates

Use the translate pipe to translate text in templates:

```html
<!-- Simple translation -->
<h1>{{ 'SOME_KEY' | translate }}</h1>

<!-- Translation with parameters -->
<p>{{ 'WELCOME_MESSAGE' | translate:{ name: userName } }}</p>
```

## How to Use Translation in Components

Inject the TranslateService to use translations in component code:

```typescript
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-example',
  templateUrl: './example.html'
})
export class ExampleComponent {
  constructor(private translateService: TranslateService) {}
  
  showMessage() {
    this.translateService.get('SOME_KEY').subscribe((res: string) => {
      console.log(res);
      // Do something with the translated string
    });
    
    // Or with parameters
    this.translateService.get('WELCOME_MESSAGE', { name: 'John' }).subscribe((res: string) => {
      console.log(res);
    });
  }
}
```

## Adding a New Language

1. **Create a new translation file**

   Add a new JSON file in `src/assets/i18n/` folder with the language code as the filename (e.g., `fr.json` for French).

2. **Copy the structure from an existing language**

   Copy all keys from `en.json` and translate the values to the new language.

3. **Add the language to the TranslationService**

   Open `src/app/core/services/translation.service.ts` and add the new language to the languages array:

   ```typescript
   private languages: Language[] = [
     { code: 'en', name: 'English', flag: '../../../assets/images/Eng.png' },
     { code: 'ka', name: 'Georgian', flag: '../../../assets/images/Geo.png' },
     { code: 'fr', name: 'French', flag: '../../../assets/images/Fr.png' }  // Add your new language here
   ];
   ```

4. **Add a flag image**

   Add the flag image to the `src/assets/images/` folder and reference it in the language configuration.

5. **Add build configurations**

   Update `angular.json` to add build configurations for the new language:

   ```json
   "fr": {
     "localize": ["fr"],
     "optimization": true,
     "outputHashing": "all",
     "sourceMap": false,
     "namedChunks": false,
     "extractLicenses": true,
     "vendorChunk": false,
     "buildOptimizer": true,
     "outputPath": "dist/KooberCoders-fr"
   }
   ```

   And add a serve configuration:

   ```json
   "fr": {
     "buildTarget": "KooberCoders:build:fr"
   }
   ```

6. **Add npm scripts**

   Update `package.json` to add build and serve scripts for the new language:

   ```json
   "start:fr": "ng serve --configuration=fr",
   "build:fr": "ng build --configuration=fr"
   ```

   Also update the build:all script:

   ```json
   "build:all": "npm run build:en && npm run build:ka && npm run build:fr"
   ```

## Best Practices

1. **Use hierarchical keys**

   Use a hierarchical structure for translation keys to keep them organized:
   
   ```
   FEATURE.SECTION.ELEMENT
   ```
   
   For example: `NAVBAR.HOME`, `CONTACT.FORM.SUBMIT`

2. **Avoid hardcoding text**

   Always use translation keys instead of hardcoding text in your templates and components.

3. **Keep translation files up to date**

   When adding new text to the application, make sure to update all language files.

4. **Test all languages**

   After making changes, test the application in all supported languages to ensure everything displays correctly. 
