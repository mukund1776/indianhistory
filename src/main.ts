import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { languageFromUrl } from './app/i18n/languages';
import { AVAILABLE_LANGUAGES } from './app/i18n/available-languages.generated';

const initialUrl = new URL(window.location.href);

const rawDev = initialUrl.searchParams.get('dev');
try {
  if (rawDev !== null) {
    if (rawDev === 'false' || rawDev === '0') {
      sessionStorage.removeItem('ih_dev_mode');
      initialUrl.searchParams.delete('dev');
    } else {
      sessionStorage.setItem('ih_dev_mode', 'true');
      initialUrl.searchParams.set('dev', 'true');
    }
  } else if (sessionStorage.getItem('ih_dev_mode') === 'true') {
    initialUrl.searchParams.set('dev', 'true');
  }
} catch {
  // Ignore sessionStorage errors
}

const requestedLanguage = initialUrl.searchParams.get('lang');
const requested = languageFromUrl(requestedLanguage);
const language = AVAILABLE_LANGUAGES.includes(requested) ? requested : 'en';
if (requestedLanguage !== language) {
  initialUrl.searchParams.set('lang', language);
}

if (initialUrl.href !== window.location.href) {
  window.history.replaceState(window.history.state, '', initialUrl);
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
