import { platformBrowser } from '@angular/platform-browser';
import { register } from 'swiper/element/bundle';
import { AppModule } from './app/app-module';

register();

platformBrowser().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
})
  .catch(err => console.error(err));
