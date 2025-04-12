import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { ImageRecComponent } from './app/Components/CamComponents/image-rec.component';

bootstrapApplication(AppComponent,appConfig)
  .catch((err) => console.error(err));

