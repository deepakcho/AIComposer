import 'zone.js';
import '@ai-composer/themes/css/tokens.css';
import '@ai-composer/themes/css/default.css';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';

bootstrapApplication(AppComponent).catch((error) => console.error(error));
